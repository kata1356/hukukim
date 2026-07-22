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
