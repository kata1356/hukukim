import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dailyOdaSuresiniAyarla } from "@/lib/daily";
import { gorusmeBitisMs, SURE_TOLERANSI_MS } from "@/lib/gorusmeYardimci";

// İki taraf da odaya girince istemci bu ucu çağırır; süre sunucu saatiyle başlar.
// İdempotenttir: süre bir kez başlar, sonraki çağrılar mevcut başlangıcı döndürür.
// Ek süre alındıktan sonra da çağrılarak Daily.co oda bitişi güncellenir.
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

  const { data: talep } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("*")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (!talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }

  if (talep.avukat_id !== kullanici.id && talep.muvekkil_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu görüşmeye katılma yetkin yok." }, { status: 403 });
  }

  if (talep.durum !== "kabul") {
    return NextResponse.json({ hata: "Bu görüşme aktif değil." }, { status: 400 });
  }

  let baslangic = talep.gorusme_baslangic_zamani;
  if (!baslangic) {
    const simdi = new Date().toISOString();
    const { data: guncellenen, error } = await supabaseAdmin
      .from("randevu_talepleri")
      .update({ gorusme_baslangic_zamani: simdi })
      .eq("id", randevuTalepId)
      .is("gorusme_baslangic_zamani", null)
      .select("gorusme_baslangic_zamani")
      .maybeSingle();

    if (error) {
      console.error("Görüşme başlangıcı yazılamadı:", error);
      return NextResponse.json({ hata: "Görüşme süresi başlatılamadı." }, { status: 500 });
    }

    // İki taraf aynı anda çağırdıysa kazanan başlangıcı okuruz.
    baslangic =
      guncellenen?.gorusme_baslangic_zamani ??
      (
        await supabaseAdmin
          .from("randevu_talepleri")
          .select("gorusme_baslangic_zamani")
          .eq("id", randevuTalepId)
          .maybeSingle()
      ).data?.gorusme_baslangic_zamani;
  }

  const bitisMs = gorusmeBitisMs({ ...talep, gorusme_baslangic_zamani: baslangic });

  try {
    await dailyOdaSuresiniAyarla(`hukukim-${randevuTalepId}`, bitisMs + SURE_TOLERANSI_MS);
  } catch (err) {
    // Oda süresi ayarlanamasa da görüşme sürer; istemci ve katil ucu süreyi yine denetler.
    console.error("Daily oda süresi ayarlanamadı:", err);
  }

  return NextResponse.json({
    gorusmeBaslangicZamani: baslangic,
    paketDakika: Number(talep.paket_dakika || 0),
    sunucuZamani: new Date().toISOString(),
  });
}
