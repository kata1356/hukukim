import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { iyzicoOdemeBaslat, IYZICO_CANLI } from "@/lib/iyzico";
import { IYZICO_DONUS_ADRESI } from "@/lib/site";

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
  const { adSoyad, email, telefon, tutar } = govde;

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
    test_modu: !IYZICO_CANLI,
    durum: "basladi",
  });

  if (eklemeHatasi) {
    return NextResponse.json({ hata: "Ödeme kaydı oluşturulamadı." }, { status: 500 });
  }

  const { basarili, token, icerik, hata, ayrinti } = await iyzicoOdemeBaslat({
    siparisNo: merchantOid,
    userIp,
    email,
    adSoyad,
    telefon,
    tutarKurus,
    sepetAdi: "Hukukim Test Ödemesi",
    donusAdresi: IYZICO_DONUS_ADRESI,
  });

  if (!basarili) {
    // Bu uç yalnızca yöneticiye açık; teşhis ayrıntısı burada gösterilebilir.
    return NextResponse.json(
      { hata: `${hata ?? "iyzico ödeme formu başlatılamadı."}${ayrinti ? ` (${ayrinti})` : ""}` },
      { status: 400 }
    );
  }

  await supabaseAdmin.from("odemeler").update({ iyzico_token: token }).eq("merchant_oid", merchantOid);

  return NextResponse.json({ icerik, merchantOid });
}
