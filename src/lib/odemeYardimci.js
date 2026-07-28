export const AVUKAT_KOMISYON_ORANI = 0.8;

export const GORUSME_PAKETLERI = [
  { dakika: 5, tutar: 200 },
  { dakika: 10, tutar: 349 },
  { dakika: 15, tutar: 499 },
];

export function avukatPayiHesapla(tutar) {
  return Math.round(Number(tutar || 0) * AVUKAT_KOMISYON_ORANI);
}

export function paketBul(dakika) {
  return GORUSME_PAKETLERI.find((p) => p.dakika === Number(dakika)) ?? null;
}
