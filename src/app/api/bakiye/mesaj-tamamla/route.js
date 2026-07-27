import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DAKIKA_UCRETI, ILK_UCRETSIZ_DAKIKA, avukatPayiHesapla } from "@/lib/odemeYardimci";

// Goruntulu olmayan (mesajla) gorusmeler icin: video akisindaki gibi canli
// dakika sayaci calismadigi icin, avukat gorusme bitince sureyi elle girer
// ve o an toplu bakiye dusumu yapilir.
export async function POST(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });
  }

  const { data: kullaniciVerisi, error: kullaniciHatasi } = await supabaseAdmin.auth.getUser(token);
  if (kullaniciHatasi || !kullaniciVerisi.user) {
    return NextResponse.json({ hata: "Oturum geçersiz." }, { status: 401 });
  }

  const kullanici = kullaniciVerisi.user;
  const { randevuTalepId, dakika } = await request.json();

  const dakikaSayisi = Number(dakika);
  if (!randevuTalepId || !dakikaSayisi || dakikaSayisi <= 0) {
    return NextResponse.json({ hata: "Geçerli bir süre (dakika) gir." }, { status: 400 });
  }

  const { data: talep, error: talepHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("*")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (talepHatasi || !talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }

  if (talep.avukat_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu randevu sana ait değil." }, { status: 403 });
  }

  if (talep.durum !== "kabul") {
    return NextResponse.json({ hata: "Bu randevu tamamlanabilir durumda değil." }, { status: 400 });
  }

  const { count: gecmisGorusmeSayisi } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id", { count: "exact", head: true })
    .eq("muvekkil_id", talep.muvekkil_id)
    .neq("id", randevuTalepId)
    .gt("gorusme_suresi_dakika", 0);

  const ilkGorusmeMi = !gecmisGorusmeSayisi;
  const ucretliDakika = ilkGorusmeMi ? Math.max(0, dakikaSayisi - ILK_UCRETSIZ_DAKIKA) : dakikaSayisi;
  const tutar = ucretliDakika * DAKIKA_UCRETI;

  const { data: rpcSonuc, error: rpcHatasi } = await supabaseAdmin.rpc("bakiye_dakika_dus", {
    p_muvekkil_id: talep.muvekkil_id,
    p_tutar: tutar,
  });

  if (rpcHatasi || !rpcSonuc?.[0]) {
    return NextResponse.json({ hata: "Bakiye düşülemedi." }, { status: 500 });
  }

  const { yeni_bakiye: yeniBakiye, dusulen_tutar: dusulenTutar } = rpcSonuc[0];

  const { error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({
      gorusme_suresi_dakika: dakikaSayisi,
      odeme_tutari: Number(dusulenTutar),
      odeme_durumu: "odendi",
      durum: "tamamlandi",
    })
    .eq("id", randevuTalepId);

  if (guncelleHatasi) {
    return NextResponse.json({ hata: "Güncellenemedi." }, { status: 500 });
  }

  if (Number(dusulenTutar) > 0) {
    await supabaseAdmin.from("avukat_kazanclari").insert({
      avukat_id: talep.avukat_id,
      randevu_talep_id: talep.id,
      muvekkil_ad_soyad: talep.muvekkil_ad_soyad,
      kazanilan_miktar: avukatPayiHesapla(dusulenTutar),
    });
  }

  return NextResponse.json({ basarili: true, tutar: Number(dusulenTutar), bakiye: Number(yeniBakiye) });
}
