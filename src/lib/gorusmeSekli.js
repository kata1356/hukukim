export const GORUSME_SEKILLERI = [
  { value: "goruntulu", label: "Görüntülü Görüşme" },
  { value: "yuz_yuze", label: "Yüz Yüze Görüşme" },
  { value: "mesaj", label: "Mesajla Görüşme" },
];

export function gorusmeSekliEtiket(value) {
  return GORUSME_SEKILLERI.find((g) => g.value === value)?.label ?? value;
}

export function tarihFormatla(tarih) {
  if (!tarih) return "";
  return new Date(`${tarih}T00:00:00`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
