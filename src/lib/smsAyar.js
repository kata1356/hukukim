// SMS ile telefon doğrulaması varsayılan olarak AÇIKTIR.
// Netgsm ayarları yanlış/eksikse ya da acil durumda doğrulamayı geçici kapatmak için
// Vercel'de NEXT_PUBLIC_SMS_KAPALI=1 tanımlayıp yeniden yayınla (doğrulama istenmez, telefon
// eskisi gibi doğrulamasız alınır). Normale dönmek için değişkeni sil ve yeniden yayınla.
export const SMS_DOGRULAMA = process.env.NEXT_PUBLIC_SMS_KAPALI !== "1";
