import "server-only";

// Avukatlara giden "yeni / acil talep" e-postası. Tablo tabanlı ve satır içi (inline) stillerle yazılmıştır,
// çünkü e-posta istemcilerinin çoğu <style> ve modern CSS'i desteklemez.
// KVKK: e-postada müvekkilin adı, konusu ve açıklaması yer almaz; yalnızca uzmanlık alanı ve şehir.
// Parametrelerin (ad, alan, sehir) çağıran tarafından temizlenmiş (HTML özel karakterleri çıkarılmış) olması gerekir.

// Talebin açık havuzda otomatik iptal edilmesine kadar geçen süre (dakika). Cron rotasıyla aynı olmalıdır.
const OTOMATIK_IPTAL_DAKIKA = 15;

function zamanMetni(tarih = new Date()) {
  return tarih.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function talepEpostasiOlustur({ acil, ad, alan, sehir, panelAdresi }) {
  const zaman = zamanMetni();

  const konu = acil
    ? `[ACİL] ${alan} · ${sehir}: yanıt bekleniyor`
    : `Yeni talep: ${alan} · ${sehir}`;

  const baslik = acil ? "Acil bir görüşme talebi sizi bekliyor" : "Yeni bir görüşme talebi açıldı";
  const giris = acil
    ? "Hukukim'de uzmanlık alanınıza ve bölgenize uygun <strong>ACİL</strong> bir görüşme talebi açıldı. Müvekkil şu an yanıt beklemektedir; <strong>en kısa sürede dönüş yapmanız gerekmektedir.</strong>"
    : "Hukukim'de açık havuza yeni bir görüşme talebi düştü. Uygunsanız talebi panelden üstlenebilirsiniz.";
  const renk = acil ? "#DC2626" : "#0E7490";
  const serit = acil ? "ACİL TALEP" : "YENİ TALEP";
  const oncelikHucresi = acil
    ? `<span style="display:inline-block;background:#FEE2E2;color:#B91C1C;font-weight:700;font-size:12px;padding:3px 10px;border-radius:999px;">ACİL</span>`
    : `<span style="display:inline-block;background:#CFFAFE;color:#0E7490;font-weight:700;font-size:12px;padding:3px 10px;border-radius:999px;">Normal</span>`;

  const uyariKutusu = acil
    ? `<tr><td style="padding:0 32px 8px 32px;">
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.5;color:#92400E;">
          <strong>Süre uyarısı:</strong> Talep, onaylayan <strong>ilk avukata</strong> atanır. ${OTOMATIK_IPTAL_DAKIKA} dakika içinde üstlenilmezse talep otomatik iptal edilir (ücretli ise müvekkile iade yapılır).
        </div>
      </td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${konu}</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${acil ? "ACİL talep: " : "Yeni talep: "}${alan} · ${sehir}. Panelden görüntüleyin.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <tr><td style="background:${renk};color:#FFFFFF;text-align:center;font-size:13px;font-weight:700;letter-spacing:2px;padding:10px 16px;">${serit}</td></tr>
        <tr><td style="background:#0D0F10;padding:18px 32px;">
          <span style="color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:0.5px;">Hukukim</span>
          <span style="color:#9CA3AF;font-size:12px;margin-left:10px;">Avukat Bildirimi</span>
        </td></tr>
        <tr><td style="padding:28px 32px 8px 32px;">
          <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.3;color:#111827;">${baslik}</h1>
          <p style="margin:0 0 6px 0;font-size:14px;line-height:1.6;color:#374151;">Sayın Av. ${ad},</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">${giris}</p>
        </td></tr>
        <tr><td style="padding:16px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;">
            <tr><td style="padding:10px 14px;font-size:13px;color:#6B7280;border-bottom:1px solid #F3F4F6;width:38%;">Hukuk alanı</td><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#111827;border-bottom:1px solid #F3F4F6;">${alan}</td></tr>
            <tr><td style="padding:10px 14px;font-size:13px;color:#6B7280;border-bottom:1px solid #F3F4F6;">Şehir</td><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#111827;border-bottom:1px solid #F3F4F6;">${sehir}</td></tr>
            <tr><td style="padding:10px 14px;font-size:13px;color:#6B7280;border-bottom:1px solid #F3F4F6;">Talep zamanı</td><td style="padding:10px 14px;font-size:14px;color:#111827;border-bottom:1px solid #F3F4F6;">${zaman}</td></tr>
            <tr><td style="padding:10px 14px;font-size:13px;color:#6B7280;">Öncelik</td><td style="padding:10px 14px;">${oncelikHucresi}</td></tr>
          </table>
        </td></tr>
        ${uyariKutusu}
        <tr><td align="center" style="padding:16px 32px 8px 32px;">
          <a href="${panelAdresi}" style="display:inline-block;background:${renk};color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;">Talebi Görüntüle ve Üstlen</a>
        </td></tr>
        <tr><td align="center" style="padding:4px 32px 24px 32px;">
          <p style="margin:8px 0 0 0;font-size:12px;color:#6B7280;line-height:1.5;">Düğme çalışmazsa bu adresi tarayıcıya yapıştırın:<br><a href="${panelAdresi}" style="color:${renk};word-break:break-all;">${panelAdresi}</a></p>
        </td></tr>
        <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:16px 32px;">
          <p style="margin:0;font-size:11px;color:#6B7280;line-height:1.6;">Bu e-posta, Hukukim avukat hesabınıza bağlı bildirimler kapsamında gönderilmiştir. Müvekkil bilgilerinin gizliliği nedeniyle talep ayrıntıları yalnızca panelde yer alır.<br>Hukukim · hukukim.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const metin = [
    `${serit}`,
    "",
    `Sayın Av. ${ad},`,
    "",
    acil
      ? "Hukukim'de uzmanlık alanınıza ve bölgenize uygun ACİL bir görüşme talebi açıldı. Müvekkil şu an yanıt beklemektedir; en kısa sürede dönüş yapmanız gerekmektedir."
      : "Hukukim'de açık havuza yeni bir görüşme talebi düştü. Uygunsanız talebi panelden üstlenebilirsiniz.",
    "",
    `Hukuk alanı : ${alan}`,
    `Şehir       : ${sehir}`,
    `Talep zamanı: ${zaman}`,
    `Öncelik     : ${acil ? "ACİL" : "Normal"}`,
    "",
    ...(acil
      ? [`Süre uyarısı: Talep, onaylayan ilk avukata atanır. ${OTOMATIK_IPTAL_DAKIKA} dakika içinde üstlenilmezse otomatik iptal edilir (ücretli ise müvekkile iade yapılır).`, ""]
      : []),
    `Talebi görüntülemek ve üstlenmek için: ${panelAdresi}`,
    "",
    "Bu e-posta, Hukukim avukat hesabınıza bağlı bildirimler kapsamında gönderilmiştir.",
    "Hukukim · hukukim.com",
  ].join("\n");

  return { konu, metin, html };
}
