import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrTokenAl } from "@/lib/paytr";
import { SITE_URL } from "@/lib/site";

function istekIpAdresi(request) {
  const ileriIp = request.headers.get("x-forwarded-for");
  if (ileriIp) return ileriIp.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "85.34.78.112";
}

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
    return NextResponse.json({ hata: "Bu randevu henüz kabul edilmedi." }, { status: 400 });
  }

  if (talep.odeme_durumu !== "gerekli") {
    return NextResponse.json({ hata: "Bu randevu için ödeme gerekmiyor." }, { status: 400 });
  }

  if (!talep.gorusme_suresi_dakika) {
    return NextResponse.json({ hata: "Avukat henüz görüşme süresini girmedi." }, { status: 400 });
  }

  const { data: muvekkilProfili } = await supabaseAdmin
    .from("muvekkiller")
    .select("ad_soyad, email, telefon, kart_token")
    .eq("id", kullanici.id)
    .maybeSingle();

  if (!muvekkilProfili) {
    return NextResponse.json({ hata: "Müvekkil profili bulunamadı." }, { status: 404 });
  }

  const merchantOid = `RND${randevuTalepId.replace(/-/g, "").slice(0, 20)}${Date.now()}`.slice(0, 64);
  const tutarKurus = Math.round(Number(talep.odeme_tutari) * 100);
  const userIp = istekIpAdresi(request);

  const { error: eklemeHatasi } = await supabaseAdmin.from("odemeler").insert({
    merchant_oid: merchantOid,
    ad_soyad: muvekkilProfili.ad_soyad,
    email: muvekkilProfili.email,
    tutar: talep.odeme_tutari,
    test_modu: process.env.PAYTR_TEST_MODE !== "0",
    durum: "basladi",
    randevu_talep_id: randevuTalepId,
  });

  if (eklemeHatasi) {
    return NextResponse.json({ hata: "Ödeme kaydı oluşturulamadı." }, { status: 500 });
  }

  const { basarili, token: paytrToken, hata } = await paytrTokenAl({
    merchantOid,
    userIp,
    email: muvekkilProfili.email,
    tutarKurus,
    sepetAdi: `Hukukim Danışmanlık - ${talep.gorusme_suresi_dakika} dk`,
    adSoyad: muvekkilProfili.ad_soyad,
    telefon: muvekkilProfili.telefon ?? "05000000000",
    adres: "Belirtilmedi",
    basariliUrl: `${SITE_URL}/muvekkil/panel?odeme=basarili`,
    basarisizUrl: `${SITE_URL}/muvekkil/panel?odeme=basarisiz`,
    kayitliKartToken: muvekkilProfili.kart_token ?? undefined,
  });

  if (!basarili) {
    return NextResponse.json({ hata: hata ?? "PayTR token alınamadı." }, { status: 400 });
  }

  return NextResponse.json({ token: paytrToken });
}
