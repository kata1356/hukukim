import "server-only";
import crypto from "crypto";

// iyzico Ödeme Formu (Checkout Form) istemcisi. Resmi doküman: https://docs.iyzico.com
// Gerekli ortam değişkenleri (Vercel):
//   IYZICO_API_KEY    : API anahtarı
//   IYZICO_SECRET_KEY : Güvenlik anahtarı
//   IYZICO_CANLI      : "1" ise canlı (api.iyzipay.com); yoksa sandbox (sandbox-api.iyzipay.com)

export const IYZICO_CANLI = process.env.IYZICO_CANLI === "1";
const TABAN_ADRES = IYZICO_CANLI ? "https://api.iyzipay.com" : "https://sandbox-api.iyzipay.com";

function ortamDegiskeni(isim) {
  const deger = process.env[isim];
  if (!deger) throw new Error(`${isim} ortam değişkeni tanımlı değil.`);
  return deger;
}

// IYZWSv2: HMAC-SHA256(randomKey + uriPath + body, secretKey) -> hex; sonra base64("apiKey:..&randomKey:..&signature:..").
function yetkiBasliklari(yol, govdeMetni) {
  const apiKey = ortamDegiskeni("IYZICO_API_KEY");
  const secretKey = ortamDegiskeni("IYZICO_SECRET_KEY");
  const rastgele = `${Date.now()}${crypto.randomInt(100000, 999999)}`;
  const imza = crypto.createHmac("sha256", secretKey).update(rastgele + yol + govdeMetni).digest("hex");
  const paket = Buffer.from(`apiKey:${apiKey}&randomKey:${rastgele}&signature:${imza}`).toString("base64");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `IYZWSv2 ${paket}`,
    "x-iyzi-rnd": rastgele,
  };
}

async function iyzicoIstek(yol, govde) {
  const govdeMetni = JSON.stringify(govde);
  const yanit = await fetch(`${TABAN_ADRES}${yol}`, {
    method: "POST",
    headers: yetkiBasliklari(yol, govdeMetni),
    body: govdeMetni,
  });
  return yanit.json().catch(() => ({}));
}

function fiyat(tutarKurus) {
  return (tutarKurus / 100).toFixed(2);
}

// "05XXXXXXXXX" -> "+905XXXXXXXXX"
function gsmNumarasi(telefon) {
  const rakamlar = String(telefon ?? "").replace(/\D/g, "");
  if (rakamlar.length === 11 && rakamlar.startsWith("0")) return `+9${rakamlar}`;
  if (rakamlar.length === 10) return `+90${rakamlar}`;
  if (rakamlar.startsWith("90")) return `+${rakamlar}`;
  return "+905000000000";
}

function adSoyadAyir(adSoyad) {
  const parcalar = String(adSoyad ?? "").trim().split(/\s+/).filter(Boolean);
  if (parcalar.length < 2) return { ad: parcalar[0] || "Müşteri", soyad: "-" };
  return { ad: parcalar.slice(0, -1).join(" "), soyad: parcalar[parcalar.length - 1] };
}

// Ödeme formunu başlatır. Başarılıysa { token, icerik } döner; icerik, iyzico'nun ödeme formunu
// çizen HTML/script parçasıdır (IyzicoOdemeFormu bileşeni bunu çerçeve içinde gösterir).
export async function iyzicoOdemeBaslat({
  siparisNo,
  userIp,
  kullaniciId,
  email,
  adSoyad,
  telefon,
  tutarKurus,
  sepetAdi,
  donusAdresi,
}) {
  const { ad, soyad } = adSoyadAyir(adSoyad);
  const tutar = fiyat(tutarKurus);
  const adres = "Belirtilmedi";
  const sonuc = await iyzicoIstek("/payment/iyzipos/checkoutform/initialize/auth/ecom", {
    locale: "tr",
    conversationId: siparisNo,
    price: tutar,
    paidPrice: tutar,
    currency: "TRY",
    basketId: siparisNo,
    paymentGroup: "PRODUCT",
    callbackUrl: donusAdresi,
    enabledInstallments: [1],
    buyer: {
      id: String(kullaniciId ?? "misafir").slice(0, 64),
      name: ad,
      surname: soyad,
      gsmNumber: gsmNumarasi(telefon),
      email,
      // Kimlik numarası toplanmıyor; iyzico bu alanı zorunlu tuttuğu için yer tutucu gönderilir.
      identityNumber: "11111111111",
      registrationAddress: adres,
      ip: userIp,
      city: "Istanbul",
      country: "Turkey",
    },
    shippingAddress: { contactName: adSoyad || "Müşteri", city: "Istanbul", country: "Turkey", address: adres },
    billingAddress: { contactName: adSoyad || "Müşteri", city: "Istanbul", country: "Turkey", address: adres },
    basketItems: [
      {
        id: siparisNo,
        name: sepetAdi,
        category1: "Hukuki Danışmanlık",
        itemType: "VIRTUAL",
        price: tutar,
      },
    ],
  });

  if (sonuc.status !== "success" || !sonuc.token || !sonuc.checkoutFormContent) {
    // Anahtarların kendisi değil, yalnızca ortam, hata kodu ve uzunlukları (teşhis için) bildirilir.
    const ayrinti = `${IYZICO_CANLI ? "canlı" : "sandbox"} ortam, kod ${sonuc.errorCode ?? "-"}, anahtar uzunluğu ${
      (process.env.IYZICO_API_KEY ?? "").length
    }/${(process.env.IYZICO_SECRET_KEY ?? "").length}`;
    console.error("iyzico ödeme formu başlatılamadı:", sonuc.errorMessage, ayrinti);
    return { basarili: false, hata: sonuc.errorMessage ?? "iyzico ödeme formu başlatılamadı.", ayrinti };
  }

  // Doküman "Base64" diyor, uygulamada çoğunlukla düz HTML dönüyor: ikisini de karşıla.
  let icerik = String(sonuc.checkoutFormContent);
  if (!icerik.trimStart().startsWith("<")) {
    try {
      icerik = Buffer.from(icerik, "base64").toString("utf8");
    } catch {
      // düz metin olarak bırak
    }
  }

  return { basarili: true, token: sonuc.token, icerik };
}

// Ödeme sonucunu iyzico'dan sorgular. İstemciden gelen hiçbir değere güvenilmez; sonuç her zaman
// buradan (kendi API anahtarlarımızla) alınır.
export async function iyzicoOdemeSorgula(token) {
  const sonuc = await iyzicoIstek("/payment/iyzipos/checkoutform/auth/ecom/detail", {
    locale: "tr",
    token,
  });

  const islemler = Array.isArray(sonuc.itemTransactions) ? sonuc.itemTransactions : [];
  const basarili = sonuc.status === "success" && String(sonuc.paymentStatus).toUpperCase() === "SUCCESS";

  return {
    basarili,
    istekBasarili: sonuc.status === "success",
    odemeId: sonuc.paymentId ? String(sonuc.paymentId) : null,
    odenenTutar: Number(sonuc.paidPrice ?? sonuc.price ?? 0),
    siparisNo: sonuc.basketId ?? sonuc.conversationId ?? null,
    hataMesaji: sonuc.errorMessage ?? null,
    islemSayisi: islemler.length,
  };
}

// V2 iade: ödeme kimliği ve tutar yeterli (kırılım iyzico tarafından seçilir).
export async function iyzicoIadeYap({ odemeId, tutar, userIp }) {
  if (!odemeId) return { basarili: false, hata: "iyzico ödeme kimliği yok." };
  const sonuc = await iyzicoIstek("/v2/payment/refund", {
    locale: "tr",
    paymentId: String(odemeId),
    price: Number(tutar).toFixed(2),
    ip: userIp ?? "85.34.78.112",
  });

  if (sonuc.status !== "success") {
    return { basarili: false, hata: sonuc.errorMessage ?? "iyzico iade işlemi başarısız." };
  }
  return { basarili: true };
}

// Webhook imzası (X-IYZ-SIGNATURE-V3, HPP/CF biçimi). Yalnızca ek güvence: asıl doğrulama,
// token ile iyzicoOdemeSorgula çağrısıdır.
export function iyzicoBildirimImzasiDogru(govde, gelenImza) {
  if (typeof gelenImza !== "string" || !gelenImza) return false;
  const secretKey = ortamDegiskeni("IYZICO_SECRET_KEY");
  const anahtar = [
    secretKey,
    govde.iyziEventType,
    govde.iyziPaymentId,
    govde.token,
    govde.paymentConversationId,
    govde.status,
  ].join("");
  const beklenen = crypto.createHmac("sha256", secretKey).update(anahtar).digest("hex");
  const a = Buffer.from(beklenen);
  const b = Buffer.from(gelenImza.toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
