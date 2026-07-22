import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrTokenAl } from "@/lib/paytr";
import { SITE_URL } from "@/lib/site";

function istekIpAdresi(request) {
  const ileriIp = request.headers.get("x-forwarded-for");
  if (ileriIp) return ileriIp.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "85.34.78.112";
}

async function cagiranYoneticiyiDogrula(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return false;

  const { data: yoneticiKaydi } = await supabaseAdmin
    .from("yoneticiler")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  return Boolean(yoneticiKaydi);
}

export async function POST(request) {
  const yetkiliMi = await cagiranYoneticiyiDogrula(request);
  if (!yetkiliMi) {
    return NextResponse.json({ hata: "Bu işlem için yönetici yetkisi gerekir." }, { status: 401 });
  }

  const govde = await request.json();
  const { adSoyad, email, telefon, adres, tutar } = govde;

  if (!adSoyad || !email || !telefon) {
    return NextResponse.json({ hata: "Ad soyad, e-posta ve telefon zorunlu." }, { status: 400 });
  }

  const gecerliTutar = Number(tutar) > 0 ? Number(tutar) : 1;
  const tutarKurus = Math.round(gecerliTutar * 100);
  const merchantOid = `TEST${Date.now()}`;
  const userIp = istekIpAdresi(request);

  const { error: eklemeHatasi } = await supabaseAdmin.from("odemeler").insert({
    merchant_oid: merchantOid,
    ad_soyad: adSoyad,
    email,
    tutar: gecerliTutar,
    test_modu: process.env.PAYTR_TEST_MODE !== "0",
    durum: "basladi",
  });

  if (eklemeHatasi) {
    return NextResponse.json({ hata: "Ödeme kaydı oluşturulamadı." }, { status: 500 });
  }

  const { basarili, token, hata } = await paytrTokenAl({
    merchantOid,
    userIp,
    email,
    tutarKurus,
    sepetAdi: "Hukukim Test Ödemesi",
    adSoyad,
    telefon,
    adres: adres || "Belirtilmedi",
    basariliUrl: `${SITE_URL}/odeme/basarili?oid=${merchantOid}`,
    basarisizUrl: `${SITE_URL}/odeme/basarisiz?oid=${merchantOid}`,
  });

  if (!basarili) {
    return NextResponse.json({ hata: hata ?? "PayTR token alınamadı." }, { status: 400 });
  }

  return NextResponse.json({ token, merchantOid });
}
