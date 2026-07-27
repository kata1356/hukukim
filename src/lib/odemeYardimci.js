export const DAKIKA_UCRETI = 15;
export const AVUKAT_KOMISYON_ORANI = 0.8;
export const MIN_BAKIYE = 150;
export const BAKIYE_UYARI_ESIGI = 60;
export const BAKIYE_PAKETLERI = [300, 500, 1000];
export const OZEL_BAKIYE_MIN = 50;
export const OZEL_BAKIYE_MAX = 10000;

export function avukatPayiHesapla(tutar) {
  return Math.round(Number(tutar || 0) * AVUKAT_KOMISYON_ORANI);
}
