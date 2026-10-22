import "server-only";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

// Hata nedenini kullanıcıya/yöneticiye anlaşılır kısa bir metinle özetler (anahtar ve ayrıntı sızdırmaz).
export function aiHataNedeni(err) {
  const mesaj = String(err?.message ?? "");
  if (mesaj.includes("ANTHROPIC_API_KEY")) return "API anahtarı tanımlı değil.";
  const durum = mesaj.match(/\((\d{3})\)/)?.[1];
  if (durum === "401" || durum === "403") return "API anahtarı geçersiz veya yetkisiz.";
  if (durum === "404") return "Model bulunamadı.";
  if (durum === "429") return "İstek sınırına takıldı, biraz sonra tekrar dene.";
  if (mesaj.toLowerCase().includes("credit balance")) return "Anthropic hesabında kredi bitmiş.";
  if (durum === "400") return "İstek reddedildi (400).";
  if (mesaj.includes("JSON")) return "Yanıt okunamadı, metni değiştirip tekrar dene.";
  return durum ? `Servis hatası (${durum}).` : "Bağlantı hatası.";
}

// Ham metin yanıtı döner. Yanıtta birden çok blok olabilir (ör. düşünme bloğu), yalnızca metin bloklarını birleştirir.
async function anthropicMetniAl({ sistemMesaji, kullaniciMesaji, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ortam değişkeni tanımlı değil.");

  const yanit = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: sistemMesaji,
      messages: [{ role: "user", content: kullaniciMesaji }],
    }),
  });

  if (!yanit.ok) {
    const hataMetni = await yanit.text();
    throw new Error(`Anthropic API hatası (${yanit.status}): ${hataMetni}`);
  }

  const sonuc = await yanit.json();
  const metin = (sonuc.content ?? [])
    .filter((blok) => blok.type === "text")
    .map((blok) => blok.text)
    .join("\n")
    .trim();

  if (!metin) {
    console.error("Anthropic boş metin döndürdü:", sonuc.stop_reason, JSON.stringify(sonuc.content ?? []).slice(0, 300));
    throw new Error(`Yapay zeka yanıtı boş (${sonuc.stop_reason ?? "bilinmiyor"}).`);
  }
  return metin;
}

// Düz metin yanıt ister (JSON gerektirmeyen, tek parça çıktılar için).
export async function anthropicMetinIste({ sistemMesaji, kullaniciMesaji, maxTokens = 1500 }) {
  return anthropicMetniAl({ sistemMesaji, kullaniciMesaji, maxTokens });
}

export async function anthropicJsonIste({ sistemMesaji, kullaniciMesaji, maxTokens = 1500 }) {
  const metin = await anthropicMetniAl({ sistemMesaji, kullaniciMesaji, maxTokens });

  const jsonEslesme = metin.match(/\{[\s\S]*\}/);
  if (!jsonEslesme) {
    console.error("Yapay zeka yanıtında JSON yok:", metin.slice(0, 300));
    throw new Error("Yapay zeka yanıtından JSON çıkarılamadı.");
  }

  try {
    return JSON.parse(jsonEslesme[0]);
  } catch {
    console.error("Yapay zeka JSON'u çözülemedi:", jsonEslesme[0].slice(0, 300));
    throw new Error("Yapay zeka JSON yanıtı geçersiz.");
  }
}
