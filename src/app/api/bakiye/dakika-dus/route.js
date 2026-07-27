import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DAKIKA_UCRETI, BAKIYE_UYARI_ESIGI, ILK_UCRETSIZ_DAKIKA } from "@/lib/odemeYardimci";

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
  const { randevuTalepId } = await request.json();

  if (!randevuTalepId) {
    return NextResponse.json({ hata: "Randevu talebi belirtilmedi." }, { status: 400 });
  }

  const { data: talep, error: talepHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("*")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (talepHatasi || !talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }

  if (talep.muvekkil_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu randevu sana ait değil." }, { status: 403 });
  }

  if (talep.durum !== "kabul") {
    return NextResponse.json({ hata: "Bu görüşme aktif değil." }, { status: 400 });
  }

  const suradakiDakika = (talep.gorusme_suresi_dakika || 0) + 1;

  // Ilk ILK_UCRETSIZ_DAKIKA dakika, sadece muvekkilin hic tamamlanmis
  // gorusmesi yoksa (yani bu onun ilk gorusmesiyse) ucretsizdir.
  let ilkGorusmeMi = false;
  if (suradakiDakika <= ILK_UCRETSIZ_DAKIKA) {
    const { count } = await supabaseAdmin
      .from("randevu_talepleri")
      .select("id", { count: "exact", head: true })
      .eq("muvekkil_id", kullanici.id)
      .neq("id", randevuTalepId)
      .gt("gorusme_suresi_dakika", 0);

    ilkGorusmeMi = !count;
  }

  if (suradakiDakika <= ILK_UCRETSIZ_DAKIKA && ilkGorusmeMi) {
    const { data: bakiyeSatiri } = await supabaseAdmin
      .from("muvekkil_bakiyeleri")
      .select("bakiye_miktari")
      .eq("muvekkil_id", kullanici.id)
      .maybeSingle();

    const { error: guncelleHatasi } = await supabaseAdmin
      .from("randevu_talepleri")
      .update({ gorusme_suresi_dakika: suradakiDakika })
      .eq("id", randevuTalepId);

    if (guncelleHatasi) {
      return NextResponse.json({ hata: "Görüşme kaydı güncellenemedi." }, { status: 500 });
    }

    return NextResponse.json({
      bakiye: Number(bakiyeSatiri?.bakiye_miktari || 0),
      ucretsiz: true,
      uyari: false,
      yetersiz: false,
    });
  }

  const { data: rpcSonuc, error: rpcHatasi } = await supabaseAdmin.rpc("bakiye_dakika_dus", {
    p_muvekkil_id: kullanici.id,
    p_tutar: DAKIKA_UCRETI,
  });

  if (rpcHatasi || !rpcSonuc?.[0]) {
    return NextResponse.json({ hata: "Bakiye düşülemedi." }, { status: 500 });
  }

  const { yeni_bakiye: yeniBakiye, dusulen_tutar: dusulenTutar } = rpcSonuc[0];

  const { error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({
      gorusme_suresi_dakika: suradakiDakika,
      odeme_tutari: Number(talep.odeme_tutari || 0) + Number(dusulenTutar),
      odeme_durumu: "odendi",
    })
    .eq("id", randevuTalepId);

  if (guncelleHatasi) {
    return NextResponse.json({ hata: "Görüşme kaydı güncellenemedi." }, { status: 500 });
  }

  return NextResponse.json({
    bakiye: Number(yeniBakiye),
    dusulenTutar: Number(dusulenTutar),
    uyari: Number(yeniBakiye) > 0 && Number(yeniBakiye) <= BAKIYE_UYARI_ESIGI,
    yetersiz: Number(yeniBakiye) <= 0,
  });
}
