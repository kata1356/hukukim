const BILINEN_HATALAR = [
  { icerir: "User already registered", mesaj: "Bu e-posta adresi zaten kayıtlı." },
  { icerir: "already registered", mesaj: "Bu e-posta adresi zaten kayıtlı." },
  { icerir: "Invalid login credentials", mesaj: "E-posta veya şifre hatalı." },
  { icerir: "Password should be at least", mesaj: "Şifre en az 6 karakter olmalı." },
  { icerir: "Unable to validate email address", mesaj: "Geçerli bir e-posta adresi gir." },
  { icerir: "is invalid", mesaj: "Bu e-posta adresi geçersiz. Gerçek bir e-posta adresi kullan (test.com, example.com gibi uzantılar kabul edilmiyor)." },
  { icerir: "Email not confirmed", mesaj: "E-posta adresin henüz onaylanmamış." },
  { icerir: "rate limit", mesaj: "Çok fazla deneme yapıldı, lütfen biraz sonra tekrar dene." },
];

export function turkceHataMesaji(error) {
  if (!error) return "Beklenmeyen bir hata oluştu.";
  const mesaj = error.message || String(error);
  const eslesen = BILINEN_HATALAR.find((h) => mesaj.includes(h.icerir));
  return eslesen ? eslesen.mesaj : "Bir hata oluştu, lütfen tekrar dene.";
}

export function emailZatenKayitliMi(error) {
  if (!error) return false;
  if (error.code === "email_exists") return true;
  const mesaj = error.message || String(error);
  return mesaj.includes("already registered") || mesaj.includes("already been registered");
}
