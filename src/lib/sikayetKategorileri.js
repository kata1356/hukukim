// Şikayet kategorileri: hem formda hem API doğrulamasında hem admin ekranında kullanılır.
export const SIKAYET_KATEGORILERI = [
  { deger: "gelmedi", etiket: "Karşı taraf görüşmeye gelmedi / geç kaldı", roller: ["muvekkil", "avukat"] },
  { deger: "davranis", etiket: "Uygunsuz davranış veya hakaret", roller: ["muvekkil", "avukat"] },
  { deger: "hizmet", etiket: "Hizmet kalitesi / verilen bilgi", roller: ["muvekkil"] },
  { deger: "platform_disi", etiket: "Platform dışına yönlendirme veya ek ücret talebi", roller: ["muvekkil", "avukat"] },
  { deger: "teknik", etiket: "Teknik sorun (görüntü, ses, bağlantı)", roller: ["muvekkil", "avukat"] },
  { deger: "diger", etiket: "Diğer", roller: ["muvekkil", "avukat"] },
];

export const SIKAYET_DURUMLARI = [
  { deger: "acik", etiket: "Açık" },
  { deger: "incelemede", etiket: "İncelemede" },
  { deger: "cozuldu", etiket: "Çözüldü" },
  { deger: "reddedildi", etiket: "Reddedildi" },
];

export function kategoriEtiketi(deger) {
  return SIKAYET_KATEGORILERI.find((k) => k.deger === deger)?.etiket ?? deger;
}

export const SIKAYET_ACIKLAMA_MIN = 10;
export const SIKAYET_ACIKLAMA_MAX = 2000;
