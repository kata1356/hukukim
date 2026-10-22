import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { smsGonder } from "@/lib/sms";
import {
  KOD_BEKLEME_SANIYE,
  KOD_GECERLILIK_DAKIKA,
  KOD_SAATLIK_LIMIT,
  KOD_TELEFON_SAATLIK_LIMIT,
  istekKullanicisi,
  kodHashle,
  kodUret,
  profilTablosu,
  telefonGecerliMi,
} from "@/lib/telefonKodu";
import { telefonKullanimda } from "@/lib/talepYardimci";

export async function POST(request) {
  const kullanici = await istekKullanicisi(request);
  if (!kullanici) {
    return NextResponse.json({ hata: "Oturum geçersiz." }, { status: 401 });
  }

  const { telefon } = await request.json().catch(() => ({}));
  if (!telefonGecerliMi(telefon)) {
    return NextResponse.json({ hata: "Telefon numarası 11 haneli olmalı (05XXXXXXXXX)." }, { status: 400 });
  }

  const tablo = await profilTablosu(kullanici.id);
  if (!tablo) {
    return NextResponse.json({ hata: "Profil bulunamadı." }, { status: 404 });
  }

  // Bir numara yalnızca bir hesapta kullanılabilir (başka hesapta kayıtlıysa kod gönderilmez).
  if (await telefonKullanimda(supabaseAdmin, telefon, kullanici.id)) {
    return NextResponse.json({ hata: "Bu numara başka bir hesapta kayıtlı." }, { status: 409 });
  }

  const birSaatOnce = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Kullanıcı başına sınır.
  const { data: sonKodlar } = await supabaseAdmin
    .from("telefon_kodlari")
    .select("created_at")
    .eq("user_id", kullanici.id)
    .gte("created_at", birSaatOnce)
    .order("created_at", { ascending: false });

  if (sonKodlar?.length >= KOD_SAATLIK_LIMIT) {
    return NextResponse.json({ hata: "Çok fazla deneme yaptın, bir saat sonra tekrar dene." }, { status: 429 });
  }
  if (sonKodlar?.length) {
    const gecen = (Date.now() - new Date(sonKodlar[0].created_at).getTime()) / 1000;
    if (gecen < KOD_BEKLEME_SANIYE) {
      return NextResponse.json(
        { hata: `Yeni kod için ${Math.ceil(KOD_BEKLEME_SANIYE - gecen)} saniye bekle.` },
        { status: 429 }
      );
    }
  }

  // Numara başına sınır: farklı hesaplarla aynı numaraya SMS yağdırmayı engeller.
  const { count: telefonSayisi } = await supabaseAdmin
    .from("telefon_kodlari")
    .select("id", { count: "exact", head: true })
    .eq("telefon", telefon)
    .gte("created_at", birSaatOnce);
  if ((telefonSayisi ?? 0) >= KOD_TELEFON_SAATLIK_LIMIT) {
    return NextResponse.json({ hata: "Bu numaraya çok fazla kod gönderildi, bir saat sonra tekrar dene." }, { status: 429 });
  }

  const kod = kodUret();
  const { error: eklemeHatasi } = await supabaseAdmin.from("telefon_kodlari").insert({
    user_id: kullanici.id,
    telefon,
    kod_hash: kodHashle(kullanici.id, kod),
    bitis: new Date(Date.now() + KOD_GECERLILIK_DAKIKA * 60 * 1000).toISOString(),
  });
  if (eklemeHatasi) {
    return NextResponse.json({ hata: "Kod oluşturulamadı." }, { status: 500 });
  }

  try {
    await smsGonder(telefon, `Hukukim doğrulama kodun: ${kod}. ${KOD_GECERLILIK_DAKIKA} dakika geçerlidir. Kimseyle paylaşma.`);
  } catch (hata) {
    console.error("SMS gönderilemedi:", hata.message);
    return NextResponse.json({ hata: "SMS gönderilemedi, lütfen sonra tekrar dene." }, { status: 502 });
  }

  return NextResponse.json({ basarili: true, bekleme: KOD_BEKLEME_SANIYE });
}
