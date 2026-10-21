export const AVUKAT_KOMISYON_ORANI = 0.6;

export const GORUSME_PAKETLERI = [
  { dakika: 5, tutar: 200 },
  { dakika: 10, tutar: 349 },
  { dakika: 15, tutar: 499 },
];

export function avukatPayiHesapla(tutar) {
  return Math.round(Number(tutar || 0) * AVUKAT_KOMISYON_ORANI);
}

// "Kendi süreni seç" seçeneği: hazır paketlerin dışındaki dakikalar bu oranla
// ücretlendirilir (en küçük paketle aynı oran, hazır paketler hep daha ucuz kalır).
export const OZEL_DAKIKA_UCRETI = 40;
export const OZEL_DAKIKA_EN_AZ = 5;
export const OZEL_DAKIKA_EN_FAZLA = 60;

export function paketHesapla(dakika) {
  const sayi = Number(dakika);
  const hazirPaket = GORUSME_PAKETLERI.find((p) => p.dakika === sayi);
  if (hazirPaket) return hazirPaket;
  if (!Number.isInteger(sayi) || sayi < OZEL_DAKIKA_EN_AZ || sayi > OZEL_DAKIKA_EN_FAZLA) return null;
  return { dakika: sayi, tutar: sayi * OZEL_DAKIKA_UCRETI };
}
