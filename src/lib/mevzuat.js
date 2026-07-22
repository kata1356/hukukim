function mevzuatUrl(no, tertip = 5) {
  return `https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=${no}&MevzuatTur=1&MevzuatTertip=${tertip}`;
}

export const MEVZUAT_LISTESI = [
  {
    ad: "Türkiye Cumhuriyeti Anayasası",
    no: "2709",
    kabulTarihi: "7.11.1982",
    url: mevzuatUrl(2709),
  },
  {
    ad: "Türk Ceza Kanunu",
    no: "5237",
    kabulTarihi: "26.9.2004",
    url: mevzuatUrl(5237),
  },
  {
    ad: "Türk Medeni Kanunu",
    no: "4721",
    kabulTarihi: "22.11.2001",
    url: mevzuatUrl(4721),
  },
  {
    ad: "Türk Borçlar Kanunu",
    no: "6098",
    kabulTarihi: "11.1.2011",
    url: mevzuatUrl(6098),
  },
  {
    ad: "İş Kanunu",
    no: "4857",
    kabulTarihi: "22.5.2003",
    url: mevzuatUrl(4857),
  },
  {
    ad: "Tüketicinin Korunması Hakkında Kanun",
    no: "6502",
    kabulTarihi: "7.11.2013",
    url: mevzuatUrl(6502),
  },
  {
    ad: "İcra ve İflas Kanunu",
    no: "2004",
    kabulTarihi: "9.6.1932",
    url: mevzuatUrl(2004, 3),
  },
  {
    ad: "Ceza Muhakemesi Kanunu",
    no: "5271",
    kabulTarihi: "4.12.2004",
    url: mevzuatUrl(5271),
  },
  {
    ad: "Hukuk Muhakemeleri Kanunu",
    no: "6100",
    kabulTarihi: "12.1.2011",
    url: mevzuatUrl(6100),
  },
];
