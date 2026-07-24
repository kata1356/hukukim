import "server-only";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

export async function anthropicJsonIste({ sistemMesaji, kullaniciMesaji, maxTokens = 500 }) {
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
  const metin = sonuc.content?.[0]?.text ?? "";

  const jsonEslesme = metin.match(/\{[\s\S]*\}/);
  if (!jsonEslesme) throw new Error("Yapay zeka yanıtından JSON çıkarılamadı.");

  return JSON.parse(jsonEslesme[0]);
}
