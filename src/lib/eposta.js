import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";

// Resend ile e-posta gönderimi (https://resend.com/docs/api-reference/emails/send-email).
// Gerekli ortam değişkenleri (Vercel):
//   RESEND_API_KEY : Resend API anahtarı. Tanımlı değilse e-posta gönderimi sessizce atlanır.
//   RESEND_FROM    : (isteğe bağlı) Gönderen adresi, ör. "Hukukim <bildirim@hukukim.com>".
//                    Alan adı Resend'de doğrulanmış olmalıdır.
const RESEND_URL = "https://api.resend.com/emails";
const VARSAYILAN_GONDEREN = "Hukukim <bildirim@hukukim.com>";

// Yönetici panelindeki "Gönderilen E-postalar" sayfası için kayıt tutar. İçerik (gövde) saklanmaz;
// yalnızca alıcı, konu, tür ve sonuç. Tablo yoksa (supabase-eposta-kayit.sql) sessizce atlanır.
async function kayitYaz(kayit) {
  try {
    await supabaseAdmin.from("eposta_kayitlari").insert(kayit);
  } catch {
    // Kayıt hatası e-posta gönderimini etkilemez.
  }
}

// gonderen verilirse varsayılan gönderen yerine kullanılır (alan adı doğrulanmış bir adres olmalıdır).
// tur ve aliciId yalnızca kayıt içindir (ör. "belge_hatirlat", "destek_yanit").
export async function epostaGonder({ to, konu, metin, html, gonderen, tur = "diger", aliciId = null }) {
  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) {
    await kayitYaz({ alici_email: to, alici_id: aliciId, tur, konu, durum: "atlandi", hata: "RESEND_API_KEY tanımlı değil" });
    return { atlandi: true };
  }

  const yanit = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anahtar}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: gonderen ?? process.env.RESEND_FROM ?? VARSAYILAN_GONDEREN,
      to: [to],
      subject: konu,
      text: metin,
      html,
    }),
  });

  const sonuc = await yanit.json().catch(() => ({}));

  if (!yanit.ok) {
    // Alıcı adresi ve içerik günlüğe yazılmaz; yalnızca HTTP durumu ve sağlayıcının mesajı.
    await kayitYaz({
      alici_email: to,
      alici_id: aliciId,
      tur,
      konu,
      durum: "hata",
      hata: `HTTP ${yanit.status}: ${sonuc.message ?? ""}`.slice(0, 300),
    });
    throw new Error(`E-posta gönderilemedi (HTTP ${yanit.status}): ${sonuc.message ?? ""}`);
  }

  await kayitYaz({ alici_email: to, alici_id: aliciId, tur, konu, durum: "gonderildi", resend_id: sonuc.id ?? null });
  return { gonderildi: true, id: sonuc.id };
}
