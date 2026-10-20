import "server-only";

// SMS servisi seçildiğinde yalnızca bu dosyadaki `smsGonder` içine ilgili
// sağlayıcının çağrısı eklenir; geri kalan akış (kod üretme, doğrulama,
// süre ve deneme sınırı) sağlayıcıdan bağımsızdır.
// SMS_SAGLAYICI ortam değişkeni tanımlı değilse:
//   - geliştirmede kod sunucu konsoluna yazılır,
//   - canlıda gönderim reddedilir (sahte doğrulama yapılmaz).
export async function smsGonder(telefon, mesaj) {
  const saglayici = process.env.SMS_SAGLAYICI;

  if (!saglayici) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMS servisi yapılandırılmadı.");
    }
    console.log(`[SMS-TEST] ${telefon}: ${mesaj}`);
    return { test: true };
  }

  throw new Error(`Desteklenmeyen SMS sağlayıcısı: ${saglayici}`);
}
