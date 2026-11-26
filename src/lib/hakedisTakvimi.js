// Avukat hakediş takvimi (Avukat Hizmet Sözleşmesi Madde 7): on günlük dönemler.
//   Dönem 1: ayın 1-10'u       -> aynı ayın 18'inde ödenir
//   Dönem 2: ayın 11-20'si     -> aynı ayın 28'inde ödenir
//   Dönem 3: ayın 21'i-sonu    -> sonraki ayın 8'inde ödenir
// iyzico parayı işlemden yaklaşık 7 gün sonra aktardığı için ödeme, dönemin son gününden en az
// 8 gün sonra yapılır; kasada para hep hazır olur. Ödeme günü hafta sonuna denk gelirse bir
// sonraki Pazartesi'ye kayar. Resmi tatil kontrolü yapılmaz (sözleşme metni "takip eden ilk iş günü"
// der); tatile denk gelirse ödeme elle bir sonraki iş gününe kaydırılır.

function gunBasi(tarih) {
  const t = new Date(tarih);
  t.setHours(0, 0, 0, 0);
  return t;
}

// Hafta sonuna denk gelen günü sonraki Pazartesi'ye kaydırır.
function isGunu(tarih) {
  const t = gunBasi(tarih);
  const gun = t.getDay();
  if (gun === 6) t.setDate(t.getDate() + 2);
  else if (gun === 0) t.setDate(t.getDate() + 1);
  return t;
}

// Verilen tarihin ait olduğu dönem: { basi, sonu, vade }.
export function donemBul(tarih) {
  const t = gunBasi(tarih);
  const yil = t.getFullYear();
  const ay = t.getMonth();
  const gun = t.getDate();

  if (gun <= 10) {
    return { basi: new Date(yil, ay, 1), sonu: new Date(yil, ay, 10), vade: isGunu(new Date(yil, ay, 18)) };
  }
  if (gun <= 20) {
    return { basi: new Date(yil, ay, 11), sonu: new Date(yil, ay, 20), vade: isGunu(new Date(yil, ay, 28)) };
  }
  return {
    basi: new Date(yil, ay, 21),
    sonu: new Date(yil, ay + 1, 0), // ayın son günü
    vade: isGunu(new Date(yil, ay + 1, 8)),
  };
}

// Bugün dahil, sıradaki ödeme günü.
export function sonrakiOdemeGunu(simdi = new Date()) {
  const bugun = gunBasi(simdi);
  const yil = bugun.getFullYear();
  const ay = bugun.getMonth();
  const adaylar = [
    isGunu(new Date(yil, ay, 8)),
    isGunu(new Date(yil, ay, 18)),
    isGunu(new Date(yil, ay, 28)),
    isGunu(new Date(yil, ay + 1, 8)),
  ];
  return adaylar.find((a) => a >= bugun) ?? adaylar[adaylar.length - 1];
}
