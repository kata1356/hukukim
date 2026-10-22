import { NextResponse } from "next/server";
import { anthropicJsonIste, aiHataNedeni } from "@/lib/anthropic";
import { avukatiDogrula } from "@/lib/aiYetki";

// Avukatın kendi yazdığı biyografiyi daha net ve profesyonel bir dille yeniden yazar.
// Metinde olmayan unvan, deneyim yılı, dava sonucu vb. bilgi eklemez.
export async function POST(request) {
  const { avukat, hata, durum } = await avukatiDogrula(request, { dogrulanmisGerekli: false });
  if (hata) return NextResponse.json({ hata }, { status: durum });

  const { biyografi } = await request.json().catch(() => ({}));
  const metin = String(biyografi ?? "").trim();
  if (metin.length < 30) {
    return NextResponse.json({ hata: "Önce biyografine birkaç cümle yaz, sonra iyileştirelim." }, { status: 400 });
  }

  try {
    const sonuc = await anthropicJsonIste({
      sistemMesaji: `Sen Türkiye'de bir hukuk platformunda avukat profili yazan bir editörsün. Avukatın kendi yazdığı biyografiyi, müvekkile güven veren, sade ve profesyonel bir Türkçeyle yeniden yaz. SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
{"biyografi": "yeniden yazılmış metin (100-600 karakter, birinci tekil şahıs, 2-4 cümle)"}

Kurallar:
- Yalnızca avukatın yazdığı bilgileri kullan. Yeni unvan, deneyim yılı, başarı, dava sonucu, kurum adı uydurma.
- "En iyi", "garanti", "kesin sonuç" gibi abartılı veya reklam yasağına aykırı ifadeler kullanma.
- Avukatın uzmanlık alanları: ${(avukat.uzmanlik_alanlari ?? []).join(", ") || "belirtilmemiş"}.`,
      kullaniciMesaji: metin.slice(0, 2000),
      maxTokens: 500,
    });

    const yeni = String(sonuc.biyografi ?? "").trim();
    if (!yeni) throw new Error("Boş yanıt");
    return NextResponse.json({ biyografi: yeni });
  } catch (err) {
    console.error("Biyografi iyileştirme hatası:", err);
    return NextResponse.json({ hata: `Yapay zeka şu an öneri üretemedi: ${aiHataNedeni(err)}` }, { status: 500 });
  }
}
