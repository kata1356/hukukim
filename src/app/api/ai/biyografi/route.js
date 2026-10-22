import { NextResponse } from "next/server";
import { anthropicMetinIste, aiHataNedeni } from "@/lib/anthropic";
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
    const yeni = await anthropicMetinIste({
      sistemMesaji: `Sen Türkiye'de bir hukuk platformunda avukat profili yazan bir editörsün. Avukatın kendi yazdığı biyografiyi, müvekkile güven veren, sade ve profesyonel bir Türkçeyle yeniden yaz. Yanıt olarak SADECE yeniden yazılmış biyografi metnini ver (100-600 karakter, birinci tekil şahıs, 2-4 cümle). Başlık, tırnak, açıklama, madde işareti veya markdown ekleme.

Kurallar:
- Metin büyük harfle, düzensiz veya kısa olsa bile içindeki bilgileri kullanarak düzgün bir biyografi yaz.
- Yalnızca avukatın yazdığı bilgileri kullan. Yeni unvan, deneyim yılı, başarı, dava sonucu, kurum adı uydurma.
- "En iyi", "garanti", "kesin sonuç" gibi abartılı veya reklam yasağına aykırı ifadeler kullanma.
- Avukatın uzmanlık alanları: ${(avukat.uzmanlik_alanlari ?? []).join(", ") || "belirtilmemiş"}.`,
      kullaniciMesaji: metin.slice(0, 2000),
      maxTokens: 800,
    });

    return NextResponse.json({ biyografi: yeni.replace(/^["“”]+|["“”]+$/g, "").trim() });
  } catch (err) {
    console.error("Biyografi iyileştirme hatası:", err);
    return NextResponse.json({ hata: `Yapay zeka şu an öneri üretemedi: ${aiHataNedeni(err)}` }, { status: 500 });
  }
}
