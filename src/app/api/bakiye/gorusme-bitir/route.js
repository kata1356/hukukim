import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { avukatPayiHesapla } from "@/lib/odemeYardimci";

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

  if (talep.durum === "tamamlandi") {
    return NextResponse.json({ basarili: true });
  }

  if (Number(talep.odeme_tutari || 0) > 0 && talep.avukat_id) {
    await supabaseAdmin.from("avukat_kazanclari").insert({
      avukat_id: talep.avukat_id,
      randevu_talep_id: talep.id,
      muvekkil_ad_soyad: talep.muvekkil_ad_soyad,
      kazanilan_miktar: avukatPayiHesapla(talep.odeme_tutari),
    });
  }

  const { error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({ durum: "tamamlandi" })
    .eq("id", randevuTalepId);

  if (guncelleHatasi) {
    return NextResponse.json({ hata: "Görüşme tamamlanamadı." }, { status: 500 });
  }

  return NextResponse.json({ basarili: true });
}
