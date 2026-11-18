import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { iyzicoOdemeBaslat, IYZICO_CANLI } from "@/lib/iyzico";
import { IYZICO_DONUS_ADRESI } from "@/lib/site";

function istekIpAdresi(request) {
  const ileriIp = request.headers.get("x-forwarded-for");
  if (ileriIp) return ileriIp.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "85.34.78.112";
}

// Ödemesi tamamlanmamış (başarısız / yarım kalmış) bir talep için yeni iyzico ödeme formu başlatır.
// Mobil uygulamadaki "Ödemeyi Tekrar Dene" düğmesi kullanır. Yeni bir talep oluşturmaz.
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

  const { randevuTalepId } = await request.json().catch(() => ({}));
  if (!randevuTalepId) {
    return NextResponse.json({ hata: "Randevu talebi belirtilmedi." }, { status: 400 });
  }

  const { data: talep } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id, muvekkil_id, durum, odeme_durumu, odeme_tutari, paket_dakika")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (!talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }
  if (talep.muvekkil_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu talep sana ait değil." }, { status: 403 });
  }
  if (talep.odeme_durumu === "odendi") {
    return NextResponse.json({ hata: "Bu talebin ödemesi zaten alınmış." }, { status: 409 });
  }
  if (talep.odeme_durumu !== "gerekli" || talep.durum !== "bekliyor") {
    return NextResponse.json({ hata: "Bu talep için ödeme yeniden başlatılamaz." }, { status: 400 });
  }

  const tutar = Number(talep.odeme_tutari || 0);
  if (!(tutar > 0)) {
    return NextResponse.json({ hata: "Bu talep için ödenecek tutar yok." }, { status: 400 });
  }

  const { data: muvekkil } = await supabaseAdmin
    .from("muvekkiller")
    .select("ad_soyad, email, telefon")
    .eq("id", kullanici.id)
    .maybeSingle();

  if (!muvekkil) {
    return NextResponse.json({ hata: "Müvekkil profili bulunamadı." }, { status: 404 });
  }

  // "TLP" öneki, iyzico dönüşünde kullanıcıyı talep paneline yönlendirmek için gerekli (donusAdresiBul).
  const merchantOid = `TLP${talep.id.replace(/-/g, "").slice(0, 20)}${Date.now()}`.slice(0, 64);

  const { error: odemeEklemeHatasi } = await supabaseAdmin.from("odemeler").insert({
    merchant_oid: merchantOid,
    ad_soyad: muvekkil.ad_soyad,
    email: muvekkil.email,
    tutar,
    test_modu: !IYZICO_CANLI,
    durum: "basladi",
    muvekkil_id: kullanici.id,
    randevu_talep_id: talep.id,
  });

  if (odemeEklemeHatasi) {
    return NextResponse.json({ hata: "Ödeme kaydı oluşturulamadı." }, { status: 500 });
  }

  const { basarili, token: iyzicoToken, icerik, hata } = await iyzicoOdemeBaslat({
    siparisNo: merchantOid,
    userIp: istekIpAdresi(request),
    kullaniciId: kullanici.id,
    email: muvekkil.email,
    adSoyad: muvekkil.ad_soyad,
    telefon: muvekkil.telefon,
    tutarKurus: Math.round(tutar * 100),
    sepetAdi: `Hukukim - ${talep.paket_dakika} dk Görüşme Paketi`,
    donusAdresi: IYZICO_DONUS_ADRESI,
  });

  if (!basarili) {
    return NextResponse.json({ hata: hata ?? "iyzico ödeme formu başlatılamadı." }, { status: 400 });
  }

  await supabaseAdmin.from("odemeler").update({ iyzico_token: iyzicoToken }).eq("merchant_oid", merchantOid);

  return NextResponse.json({ icerik, tutar, testModu: !IYZICO_CANLI });
}
