import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrTokenAl } from "@/lib/paytr";
import { SITE_URL } from "@/lib/site";

const DOGRULAMA_TUTARI_KURUS = 100;

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

  const { data: muvekkilProfili } = await supabaseAdmin
    .from("muvekkiller")
    .select("ad_soyad, email, telefon, kart_token")
    .eq("id", kullanici.id)
    .maybeSingle();

  if (!muvekkilProfili) {
    return NextResponse.json({ hata: "Müvekkil profili bulunamadı." }, { status: 404 });
  }

  if (muvekkilProfili.kart_token) {
    return NextResponse.json({ hata: "Kartın zaten doğrulanmış." }, { status: 400 });
  }

  const merchantOid = `DGR${kullanici.id.replace(/-/g, "").slice(0, 20)}${Date.now()}`.slice(0, 64);
  const userIp = istekIpAdresi(request);

  const { error: eklemeHatasi } = await supabaseAdmin.from("odemeler").insert({
    merchant_oid: merchantOid,
    ad_soyad: muvekkilProfili.ad_soyad,
    email: muvekkilProfili.email,
    tutar: DOGRULAMA_TUTARI_KURUS / 100,
    test_modu: process.env.PAYTR_TEST_MODE !== "0",
    durum: "basladi",
    muvekkil_id: kullanici.id,
  });

  if (eklemeHatasi) {
    return NextResponse.json({ hata: "Doğrulama kaydı oluşturulamadı." }, { status: 500 });
  }

  const { basarili, token: paytrToken, hata } = await paytrTokenAl({
    merchantOid,
    userIp,
    email: muvekkilProfili.email,
    tutarKurus: DOGRULAMA_TUTARI_KURUS,
    sepetAdi: "Hukukim - Kart Doğrulama",
    adSoyad: muvekkilProfili.ad_soyad,
    telefon: muvekkilProfili.telefon ?? "05000000000",
    adres: "Belirtilmedi",
    basariliUrl: `${SITE_URL}/muvekkil/panel?kartdogrulama=basarili`,
    basarisizUrl: `${SITE_URL}/muvekkil/panel?kartdogrulama=basarisiz`,
  });

  if (!basarili) {
    return NextResponse.json({ hata: hata ?? "PayTR token alınamadı." }, { status: 400 });
  }

  return NextResponse.json({ token: paytrToken });
}
