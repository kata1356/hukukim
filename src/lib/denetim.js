export const TABLO_ADLARI = {
  avukatlar: "Avukat",
  muvekkiller: "Müvekkil",
  randevu_talepleri: "Talep",
  yoneticiler: "Yönetici",
};

export const ALAN_ETIKETLERI = {
  ad_soyad: "Ad Soyad",
  email: "E-posta",
  telefon: "Telefon",
  sehir: "Şehir",
  baro_sicil_no: "Baro Sicil No",
  uzmanlik_alanlari: "Uzmanlık Alanları",
  biyografi: "Biyografi",
  dogrulanmis: "Doğrulanmış",
  profil_fotografi_url: "Profil Fotoğrafı",
  durum: "Durum",
  konu: "Konu",
  aciklama: "Açıklama",
  gorusme_sekli: "Görüşme Şekli",
  tarih: "Tarih",
  hedef_sehir: "Hedef Şehir",
  hedef_uzmanlik_alani: "Hedef Uzmanlık Alanı",
  acil: "Acil",
};

const GORMEZDEN_GELINEN_ALANLAR = new Set(["id", "created_at", "muvekkil_id", "avukat_id"]);

function degerYazdir(deger) {
  if (deger === null || deger === undefined || deger === "") return "—";
  if (typeof deger === "boolean") return deger ? "Evet" : "Hayır";
  if (Array.isArray(deger)) return deger.length ? deger.join(", ") : "—";
  return String(deger);
}

export function kimlikOzeti(veri, hedefTablo) {
  if (!veri) return "";
  if (hedefTablo === "randevu_talepleri") return veri.konu || veri.hedef_uzmanlik_alani || "";
  return veri.ad_soyad || veri.email || "";
}

export function degisenAlanlar(onceki, yeni) {
  if (!onceki || !yeni) return [];
  const anahtarlar = new Set([...Object.keys(onceki), ...Object.keys(yeni)]);
  const sonuc = [];

  for (const anahtar of anahtarlar) {
    if (GORMEZDEN_GELINEN_ALANLAR.has(anahtar)) continue;
    const eski = onceki[anahtar];
    const yeniDeger = yeni[anahtar];
    if (JSON.stringify(eski) === JSON.stringify(yeniDeger)) continue;

    sonuc.push({
      etiket: ALAN_ETIKETLERI[anahtar] ?? anahtar,
      eski: degerYazdir(eski),
      yeni: degerYazdir(yeniDeger),
    });
  }

  return sonuc;
}
