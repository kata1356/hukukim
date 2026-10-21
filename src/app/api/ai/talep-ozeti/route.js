import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { anthropicJsonIste } from "@/lib/anthropic";

// Avukata, önündeki talebin kısa bir özetini ve ilk görüşmede sorabileceği soruları üretir.
// Yalnızca doğrulanmış avukat, kendi talebi ya da açık havuzdaki ödenmiş/muaf talep için kullanabilir.
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
  const kullaniciId = kullaniciVerisi.user.id;

  const { data: avukat } = await supabaseAdmin
    .from("avukatlar")
    .select("id, dogrulanmis")
    .eq("id", kullaniciId)
    .maybeSingle();

  if (!avukat?.dogrulanmis) {
    return NextResponse.json({ hata: "Bu özellik doğrulanmış avukatlara açıktır." }, { status: 403 });
  }

  const { talepId } = await request.json().catch(() => ({}));
  if (!talepId) {
    return NextResponse.json({ hata: "Talep belirtilmedi." }, { status: 400 });
  }

  const { data: talep } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id, avukat_id, tur, odeme_durumu, konu, aciklama, hedef_sehir, hedef_uzmanlik_alani, acil, gorusme_sekli, paket_dakika")
    .eq("id", talepId)
    .maybeSingle();

  const gorebilir =
    talep &&
    (talep.avukat_id === kullaniciId ||
      (talep.avukat_id === null && talep.tur === "genel" && ["odendi", "muaf"].includes(talep.odeme_durumu)));

  if (!gorebilir) {
    return NextResponse.json({ hata: "Talep bulunamadı." }, { status: 404 });
  }

  if (!talep.aciklama || talep.aciklama.trim().length < 10) {
    return NextResponse.json({ hata: "Bu talepte özetlenecek kadar açıklama yok." }, { status: 400 });
  }

  const girdi = [
    `Konu: ${talep.konu ?? "-"}`,
    `Uzmanlık alanı: ${talep.hedef_uzmanlik_alani ?? "-"}`,
    `Şehir: ${talep.hedef_sehir ?? "-"}`,
    `Acil: ${talep.acil ? "evet" : "hayır"}`,
    `Açıklama: ${talep.aciklama.slice(0, 3000)}`,
  ].join("\n");

  try {
    const sonuc = await anthropicJsonIste({
      sistemMesaji: `Sen Türkiye'de çalışan bir avukata yardımcı olan asistansın. Müvekkilin gönderdiği talebi okuyup avukatın hızlı karar vermesi için SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
{"ozet": "en fazla 2 cümlelik sade özet", "anahtarNoktalar": ["en fazla 4 kısa madde: taraflar, tarih/süre, tutar, belge gibi somut bilgiler"], "sorular": ["ilk görüşmede müvekkile sorulması faydalı en fazla 3 soru"], "aciliyet": "dusuk" | "orta" | "yuksek"}

Aciliyeti süre/zamanaşımı/gözaltı/tahliye/haciz gibi unsurlara bakarak belirle. Hukuki görüş, sonuç tahmini veya tavsiye verme; yalnızca talebi özetle. Müvekkil metninde yazmayan bilgi uydurma.`,
      kullaniciMesaji: girdi,
      maxTokens: 500,
    });

    const aciliyet = ["dusuk", "orta", "yuksek"].includes(sonuc.aciliyet) ? sonuc.aciliyet : "orta";
    return NextResponse.json({
      ozet: String(sonuc.ozet ?? ""),
      anahtarNoktalar: Array.isArray(sonuc.anahtarNoktalar) ? sonuc.anahtarNoktalar.slice(0, 4).map(String) : [],
      sorular: Array.isArray(sonuc.sorular) ? sonuc.sorular.slice(0, 3).map(String) : [],
      aciliyet,
    });
  } catch (err) {
    console.error("Talep özeti hatası:", err);
    return NextResponse.json({ hata: "Yapay zeka özeti şu an oluşturulamadı." }, { status: 500 });
  }
}
