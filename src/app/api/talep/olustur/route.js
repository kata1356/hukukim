import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrTokenAl } from "@/lib/paytr";
import { SITE_URL } from "@/lib/site";
import { paketHesapla, DENEME_DAKIKA } from "@/lib/odemeYardimci";
import { ilkGorusmeMi, telefonKullanimda, denemeHakkiniAl, denemeHakkiniGeriVer } from "@/lib/talepYardimci";
import { SMS_DOGRULAMA } from "@/lib/smsAyar";

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
  const { hedefSehir, hedefUzmanlikAlani, konu, aciklama, gorusmeSekli, paketDakika, acil, telefon } =
    await request.json();

  const denemeMi = paketDakika === "deneme";
  const paket = denemeMi ? { dakika: DENEME_DAKIKA, tutar: 0 } : paketHesapla(paketDakika);
  if (!paket || !hedefSehir || !hedefUzmanlikAlani || !konu || !gorusmeSekli) {
    return NextResponse.json({ hata: "Eksik veya geçersiz bilgi." }, { status: 400 });
  }

  const { data: muvekkilProfili } = await supabaseAdmin
    .from("muvekkiller")
    .select("ad_soyad, email, telefon, telefon_dogrulandi, sehir, kart_token")
    .eq("id", kullanici.id)
    .maybeSingle();

  if (!muvekkilProfili) {
    return NextResponse.json({ hata: "Müvekkil profili bulunamadı." }, { status: 404 });
  }

  if (SMS_DOGRULAMA) {
    // Talep (ve ücretsiz deneme) için telefon numarası SMS koduyla doğrulanmış olmalı.
    if (!muvekkilProfili.telefon || !muvekkilProfili.telefon_dogrulandi) {
      return NextResponse.json(
        { hata: "Talep açmak için önce telefon numaranı doğrulamalısın." },
        { status: 403 }
      );
    }
  } else {
    // SMS doğrulaması kapalıyken (acil kapatma anahtarı): telefon eskisi gibi doğrulamasız alınır.
    const yeniTelefon = typeof telefon === "string" ? telefon.trim() : "";
    if (yeniTelefon && !/^0\d{10}$/.test(yeniTelefon)) {
      return NextResponse.json({ hata: "Telefon numarası 11 haneli olmalı (05XXXXXXXXX)." }, { status: 400 });
    }
    if (!muvekkilProfili.telefon && yeniTelefon) {
      if (await telefonKullanimda(supabaseAdmin, yeniTelefon, kullanici.id)) {
        return NextResponse.json({ hata: "Bu telefon numarası başka bir hesapta kayıtlı." }, { status: 409 });
      }
      const { error: telefonHatasi } = await supabaseAdmin
        .from("muvekkiller")
        .update({ telefon: yeniTelefon })
        .eq("id", kullanici.id);
      if (telefonHatasi) {
        return NextResponse.json({ hata: "Bu telefon numarası başka bir hesapta kayıtlı." }, { status: 409 });
      }
      muvekkilProfili.telefon = yeniTelefon;
    }
    if (!muvekkilProfili.telefon) {
      return NextResponse.json({ hata: "Telefon numarası gerekli." }, { status: 400 });
    }
  }

  if (!muvekkilProfili.sehir) {
    await supabaseAdmin.from("muvekkiller").update({ sehir: hedefSehir }).eq("id", kullanici.id);
  }

  // Ücretsiz deneme: numara başına bir kez, ödeme alınmaz. Hakkı önce alıyoruz
  // ki aynı numarayla eşzamanlı iki istek ikisi de deneme kullanamasın.
  if (denemeMi) {
    const hakVar =
      (await ilkGorusmeMi(supabaseAdmin, kullanici.id)) &&
      (await denemeHakkiniAl(supabaseAdmin, kullanici.id, muvekkilProfili.telefon));

    if (!hakVar) {
      return NextResponse.json(
        { hata: "Ücretsiz deneme hakkını daha önce kullanmışsın. Bir paket seçerek devam edebilirsin." },
        { status: 409 }
      );
    }
  }

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
      odeme_tutari: paket.tutar,
      odeme_durumu: denemeMi ? "muaf" : "gerekli",
    })
    .select()
    .single();

  if (eklemeHatasi || !yeniTalep) {
    if (denemeMi) await denemeHakkiniGeriVer(supabaseAdmin, kullanici.id);
    return NextResponse.json({ hata: "Talep oluşturulamadı." }, { status: 500 });
  }

  if (denemeMi) {
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
