import { SITE_URL } from "@/lib/site";

const ROTALAR = [
  { yol: "", oncelik: 1 },
  { yol: "/avukatlar", oncelik: 0.8 },
  { yol: "/mevzuat", oncelik: 0.6 },
  { yol: "/acil-avukat", oncelik: 0.7 },
  { yol: "/giris", oncelik: 0.5 },
  { yol: "/avukat/kayit", oncelik: 0.7 },
  { yol: "/muvekkil/kayit", oncelik: 0.7 },
  { yol: "/gizlilik-politikasi", oncelik: 0.3 },
  { yol: "/kullanim-sartlari", oncelik: 0.3 },
  { yol: "/kvkk-aydinlatma-metni", oncelik: 0.3 },
  { yol: "/mesafeli-satis-sozlesmesi", oncelik: 0.3 },
  { yol: "/iptal-iade-kosullari", oncelik: 0.3 },
  { yol: "/iletisim", oncelik: 0.4 },
];

export default function sitemap() {
  const simdi = new Date();
  return ROTALAR.map(({ yol, oncelik }) => ({
    url: `${SITE_URL}${yol}`,
    lastModified: simdi,
    changeFrequency: "weekly",
    priority: oncelik,
  }));
}
