import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { avukatPayiHesapla } from "@/lib/odemeYardimci";

// Paket sistemi: fiyat talep olusturulurken zaten sabitlenmis oldugu icin
// gorusme bitince yapilacak tek is, kazanci avukat_kazanclari tablosuna
// islemek ve talebi tamamlandi olarak isaretlemektir. Hem avukat hem
// muvekkil tarafi cagirabilir (kim once cagirirsa o tamamlar), idempotenttir.
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
  const { randevuTalepId, gorusmeSuresiSaniye } = await request.json();

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

  if (kullanici.id !== talep.avukat_id && kullanici.id !== talep.muvekkil_id) {
    return NextResponse.json({ hata: "Bu randevu sana ait değil." }, { status: 403 });
  }

  if (talep.durum === "tamamlandi") {
    return NextResponse.json({ basarili: true });
  }

  const dakika = gorusmeSuresiSaniye ? Math.max(1, Math.ceil(Number(gorusmeSuresiSaniye) / 60)) : null;

  const { error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({
      durum: "tamamlandi",
      ...(dakika ? { gorusme_suresi_dakika: dakika } : {}),
    })
    .eq("id", randevuTalepId);

  if (guncelleHatasi) {
    return NextResponse.json({ hata: "Görüşme tamamlanamadı." }, { status: 500 });
  }

  if (Number(talep.odeme_tutari || 0) > 0 && talep.avukat_id) {
    await supabaseAdmin.from("avukat_kazanclari").insert({
      avukat_id: talep.avukat_id,
      randevu_talep_id: talep.id,
      muvekkil_ad_soyad: talep.muvekkil_ad_soyad,
      kazanilan_miktar: avukatPayiHesapla(talep.odeme_tutari),
    });
  }

  return NextResponse.json({ basarili: true });
}
