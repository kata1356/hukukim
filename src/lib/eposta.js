import "server-only";

// Resend ile e-posta gönderimi (https://resend.com/docs/api-reference/emails/send-email).
// Gerekli ortam değişkenleri (Vercel):
//   RESEND_API_KEY : Resend API anahtarı. Tanımlı değilse e-posta gönderimi sessizce atlanır.
//   RESEND_FROM    : (isteğe bağlı) Gönderen adresi, ör. "Hukukim <bildirim@hukukim.com>".
//                    Alan adı Resend'de doğrulanmış olmalıdır.
const RESEND_URL = "https://api.resend.com/emails";
const VARSAYILAN_GONDEREN = "Hukukim <bildirim@hukukim.com>";

export async function epostaGonder({ to, konu, metin, html }) {
  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) return { atlandi: true };

  const yanit = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anahtar}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? VARSAYILAN_GONDEREN,
      to: [to],
      subject: konu,
      text: metin,
      html,
    }),
  });

  if (!yanit.ok) {
    // Alıcı adresi ve içerik günlüğe yazılmaz; yalnızca HTTP durumu ve sağlayıcının mesajı.
    const sonuc = await yanit.json().catch(() => ({}));
    throw new Error(`E-posta gönderilemedi (HTTP ${yanit.status}): ${sonuc.message ?? ""}`);
  }

  return { gonderildi: true };
}
