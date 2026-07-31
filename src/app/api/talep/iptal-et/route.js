import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrIadeYap } from "@/lib/paytr";

// Muvekkil, henuz kimse ustlenmemis (bekliyor) odenmis bir talebi iptal edip
// anlik iade alabilir. Ucretsiz (odeme_tutari 0) talepler icin iade cagirilmaz,
// direkt iptal edilir.
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

  if (talep.durum !== "bekliyor") {
    return NextResponse.json({ hata: "Bu talep artık iptal edilemez." }, { status: 400 });
  }

  if (Number(talep.odeme_tutari || 0) > 0 && talep.odeme_durumu === "odendi") {
    const { data: odeme } = await supabaseAdmin
      .from("odemeler")
      .select("merchant_oid, tutar")
      .eq("randevu_talep_id", randevuTalepId)
      .eq("durum", "basarili")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (odeme) {
      const { basarili, hata } = await paytrIadeYap({
        merchantOid: odeme.merchant_oid,
        tutarKurus: Math.round(Number(odeme.tutar) * 100),
      });
      if (!basarili) {
        return NextResponse.json({ hata: hata ?? "İade işlemi başarısız oldu, lütfen tekrar dene." }, { status: 500 });
      }
    }
  }

  // Atomik: baska bir istek (ornegin bir avukatin tam o anda ustlenmesi) araya
  // girmisse iptal edilmesin.
  const { data: guncellenen, error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({ durum: "iptal" })
    .eq("id", randevuTalepId)
    .eq("durum", "bekliyor")
    .select("id")
    .maybeSingle();

  if (guncelleHatasi) {
    console.error("Talep iptal guncelleme hatasi:", guncelleHatasi);
    return NextResponse.json({ hata: "Talep iptal edilemedi." }, { status: 500 });
  }

  if (!guncellenen) {
    return NextResponse.json({ hata: "Talep iptal edilemedi, az önce bir avukat üstlenmiş olabilir." }, { status: 409 });
  }

  return NextResponse.json({ basarili: true });
}
