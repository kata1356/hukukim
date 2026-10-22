import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dailyOdaGetirYaDaOlustur, dailyOdaSuresiniAyarla, dailyTokenOlustur } from "@/lib/daily";
import { gorusmeBitisMs, gorusmeyiTamamla, SURE_TOLERANSI_MS } from "@/lib/gorusmeYardimci";

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
    .select("*, avukatlar(ad_soyad), muvekkiller(ad_soyad)")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (talepHatasi || !talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }

  if (talep.avukat_id !== kullanici.id && talep.muvekkil_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu görüşmeye katılma yetkin yok." }, { status: 403 });
  }

  if (talep.gorusme_sekli !== "goruntulu") {
    return NextResponse.json({ hata: "Bu randevu görüntülü görüşme değil." }, { status: 400 });
  }

  if (talep.durum === "tamamlandi") {
    return NextResponse.json({ hata: "Bu görüşme tamamlandı, yeniden katılamazsın." }, { status: 410 });
  }

  if (talep.durum !== "kabul") {
    return NextResponse.json({ hata: "Randevu henüz kabul edilmedi." }, { status: 400 });
  }

  // Süre sunucu saatiyle takip edilir: dolduysa odaya yeniden girilemez.
  const bitisMs = gorusmeBitisMs(talep);
  if (bitisMs && Date.now() >= bitisMs + SURE_TOLERANSI_MS) {
    await gorusmeyiTamamla(talep);
    return NextResponse.json({ hata: "Paket süresi doldu, görüşme sona erdi." }, { status: 410 });
  }

  const odaAdi = `hukukim-${randevuTalepId}`;
  const kullaniciAdi =
    talep.avukat_id === kullanici.id ? talep.avukatlar?.ad_soyad ?? "Avukat" : talep.muvekkiller?.ad_soyad ?? "Müvekkil";

  let videoBaslangicZamani = talep.video_baslangic_zamani;
  if (!videoBaslangicZamani) {
    videoBaslangicZamani = new Date().toISOString();
    await supabaseAdmin
      .from("randevu_talepleri")
      .update({ video_baslangic_zamani: videoBaslangicZamani })
      .eq("id", randevuTalepId)
      .is("video_baslangic_zamani", null);

    if (kullanici.id === talep.avukat_id) {
      await supabaseAdmin.from("bildirimler").insert({
        kullanici_id: talep.muvekkil_id,
        baslik: "Avukatınız hazır, görüşmede bekliyor",
        mesaj: talep.konu,
        link: "/muvekkil/panel#taleplerim",
      });
    }
  }

  try {
    await dailyOdaGetirYaDaOlustur(odaAdi);
    // Oda süresi: görüşme başladıysa planlanan bitiş anı, başlamadıysa bekleme süresi.
    await dailyOdaSuresiniAyarla(odaAdi, bitisMs ? bitisMs + SURE_TOLERANSI_MS : null);
    const meetingToken = await dailyTokenOlustur({ odaAdi, kullaniciAdi });
    const odaUrl = `https://${process.env.DAILY_DOMAIN}.daily.co/${odaAdi}?t=${meetingToken}`;
    return NextResponse.json({
      odaUrl,
      videoBaslangicZamani,
      gorusmeBaslangicZamani: talep.gorusme_baslangic_zamani ?? null,
      paketDakika: Number(talep.paket_dakika || 0),
      sunucuZamani: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Daily.co video oda hatasi:", err);
    return NextResponse.json({ hata: "Görüşme odası oluşturulamadı, lütfen tekrar dene." }, { status: 500 });
  }
}
