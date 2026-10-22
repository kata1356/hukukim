import "server-only";

// Netgsm REST v2 SMS gönderimi.
//   POST https://api.netgsm.com.tr/sms/rest/v2/send   (HTTP Basic: kullanıcı kodu / şifre)
// Gerekli ortam değişkenleri (Vercel):
//   NETGSM_USERCODE  : Netgsm abone/kullanıcı kodu (API kullanıcısı)
//   NETGSM_PASSWORD  : API şifresi
//   NETGSM_HEADER    : Netgsm'de onaylı mesaj başlığı (en fazla 11 karakter)
//   NETGSM_IYS_FILTER (isteğe bağlı): İYS filtresi; doğrulama kodu bilgilendirme mesajıdır.
//                      Netgsm "İYS" hatası dönerse hesabınızın ayarına göre "0" deneyin.
const NETGSM_URL = "https://api.netgsm.com.tr/sms/rest/v2/send";

// "05XXXXXXXXX" -> "5XXXXXXXXX" (Netgsm 10 haneli numara bekler).
function netgsmNumarasi(telefon) {
  return String(telefon).replace(/\D/g, "").replace(/^0/, "");
}

// Netgsm yanıt kodları: "00", "01", "02" başarılı (jobid döner); diğerleri hatadır.
const BASARILI_KODLAR = new Set(["00", "01", "02"]);

export async function smsGonder(telefon, mesaj) {
  const kullanici = process.env.NETGSM_USERCODE;
  const sifre = process.env.NETGSM_PASSWORD;
  const baslik = process.env.NETGSM_HEADER;

  if (!kullanici || !sifre || !baslik) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMS servisi yapılandırılmadı.");
    }
    console.log(`[SMS-TEST] ${telefon}: ${mesaj}`);
    return { test: true };
  }

  const govde = {
    msgheader: baslik,
    encoding: "TR",
    messages: [{ msg: mesaj, no: netgsmNumarasi(telefon) }],
  };
  if (process.env.NETGSM_IYS_FILTER) govde.iysfilter = process.env.NETGSM_IYS_FILTER;

  const yanit = await fetch(NETGSM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${kullanici}:${sifre}`).toString("base64")}`,
    },
    body: JSON.stringify(govde),
  });

  const sonuc = await yanit.json().catch(() => ({}));
  const kod = String(sonuc.code ?? "");

  if (!yanit.ok || !BASARILI_KODLAR.has(kod)) {
    // Şifre ve telefon günlüğe yazılmaz; yalnızca Netgsm'in hata kodu ve açıklaması.
    throw new Error(`Netgsm hatası (HTTP ${yanit.status}, kod ${kod || "-"}): ${sonuc.description ?? ""}`);
  }

  return { jobid: sonuc.jobid ?? null };
}
