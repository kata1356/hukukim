import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrTokenAl } from "@/lib/paytr";
import { SITE_URL } from "@/lib/site";
import { paketBul } from "@/lib/odemeYardimci";
import { ilkGorusmeMi } from "@/lib/talepYardimci";

const BUGUN = () => new Date().toISOString().split("T")[0];

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
  const { hedefSehir, hedefUzmanlikAlani, konu, aciklama, gorusmeSekli, paketDakika, acil } =
    await request.json();

  const paket = paketBul(paketDakika);
  if (!paket || !hedefSehir || !hedefUzmanlikAlani || !konu || !gorusmeSekli) {
    return NextResponse.json({ hata: "Eksik veya geçersiz bilgi." }, { status: 400 });
  }

  const { data: muvekkilProfili } = await supabaseAdmin
    .from("muvekkiller")
    .select("ad_soyad, email, telefon, kart_token")
    .eq("id", kullanici.id)
    .maybeSingle();

  if (!muvekkilProfili) {
    return NextResponse.json({ hata: "Müvekkil profili bulunamadı." }, { status: 404 });
  }

  const ucretsizMi = await ilkGorusmeMi(supabaseAdmin, kullanici.id);
  const odemeTutari = ucretsizMi ? 0 : paket.tutar;

  const { data: yeniTalep, error: eklemeHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .insert({
      muvekkil_id: kullanici.id,
      avukat_id: null,
      tur: "genel",
      acil: !!acil,
      hedef_sehir: hedefSehir,
      hedef_uzmanlik_alani: hedefUzmanlikAlani,
      muvekkil_ad_soyad: muvekkilProfili.ad_soyad,
      muvekkil_telefon: muvekkilProfili.telefon,
      konu,
      aciklama,
      gorusme_sekli: gorusmeSekli,
      tarih: BUGUN(),
      paket_dakika: paket.dakika,
      paket_tutari: paket.tutar,
      odeme_tutari: odemeTutari,
      odeme_durumu: ucretsizMi ? "odendi" : "gerekli",
    })
    .select()
    .single();

  if (eklemeHatasi || !yeniTalep) {
    return NextResponse.json({ hata: "Talep oluşturulamadı." }, { status: 500 });
  }

  if (ucretsizMi) {
    return NextResponse.json({ talepId: yeniTalep.id, ucretsiz: true });
  }

  const merchantOid = `TLP${yeniTalep.id.replace(/-/g, "").slice(0, 20)}${Date.now()}`.slice(0, 64);
  const tutarKurus = Math.round(paket.tutar * 100);
  const userIp = istekIpAdresi(request);

  const { error: odemeEklemeHatasi } = await supabaseAdmin.from("odemeler").insert({
    merchant_oid: merchantOid,
    ad_soyad: muvekkilProfili.ad_soyad,
    email: muvekkilProfili.email,
    tutar: paket.tutar,
    test_modu: process.env.PAYTR_TEST_MODE !== "0",
    durum: "basladi",
    muvekkil_id: kullanici.id,
    randevu_talep_id: yeniTalep.id,
  });

  if (odemeEklemeHatasi) {
    return NextResponse.json({ hata: "Ödeme kaydı oluşturulamadı." }, { status: 500 });
  }

  const { basarili, token: paytrToken, hata } = await paytrTokenAl({
    merchantOid,
    userIp,
    email: muvekkilProfili.email,
    tutarKurus,
    sepetAdi: `Hukukim - ${paket.dakika} dk Görüşme Paketi`,
    adSoyad: muvekkilProfili.ad_soyad,
    telefon: muvekkilProfili.telefon ?? "05000000000",
    adres: "Belirtilmedi",
    basariliUrl: `${SITE_URL}/muvekkil/panel?talep=${yeniTalep.id}&odeme=basarili`,
    basarisizUrl: `${SITE_URL}/muvekkil/panel?talep=${yeniTalep.id}&odeme=basarisiz`,
    kayitliKartToken: muvekkilProfili.kart_token ?? undefined,
  });

  if (!basarili) {
    return NextResponse.json({ hata: hata ?? "PayTR token alınamadı." }, { status: 400 });
  }

  return NextResponse.json({ talepId: yeniTalep.id, token: paytrToken });
}
