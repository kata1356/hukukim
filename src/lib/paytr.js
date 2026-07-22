import "server-only";
import crypto from "crypto";

const PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";

function ortamDegiskeni(isim) {
  const deger = process.env[isim];
  if (!deger) throw new Error(`${isim} ortam değişkeni tanımlı değil.`);
  return deger;
}

export async function paytrTokenAl({
  merchantOid,
  userIp,
  email,
  tutarKurus,
  sepetAdi,
  adSoyad,
  telefon,
  adres,
  basariliUrl,
  basarisizUrl,
}) {
  const merchantId = ortamDegiskeni("PAYTR_MERCHANT_ID");
  const merchantKey = ortamDegiskeni("PAYTR_MERCHANT_KEY");
  const merchantSalt = ortamDegiskeni("PAYTR_MERCHANT_SALT");
  const testModu = process.env.PAYTR_TEST_MODE === "0" ? "0" : "1";

  const sepet = Buffer.from(
    JSON.stringify([[sepetAdi, (tutarKurus / 100).toFixed(2), 1]])
  ).toString("base64");

  const noTaksit = "0";
  const maxTaksit = "0";
  const paraBirimi = "TL";

  const hashStr = `${merchantId}${userIp}${merchantOid}${email}${tutarKurus}${sepet}${noTaksit}${maxTaksit}${paraBirimi}${testModu}`;
  const paytrToken = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");

  const govde = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: String(tutarKurus),
    paytr_token: paytrToken,
    user_basket: sepet,
    debug_on: "1",
    no_installment: noTaksit,
    max_installment: maxTaksit,
    user_name: adSoyad,
    user_address: adres,
    user_phone: telefon,
    merchant_ok_url: basariliUrl,
    merchant_fail_url: basarisizUrl,
    timeout_limit: "30",
    currency: paraBirimi,
    test_mode: testModu,
  });

  const yanit = await fetch(PAYTR_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: govde.toString(),
  });

  const sonuc = await yanit.json();

  if (sonuc.status !== "success") {
    return { basarili: false, hata: sonuc.reason ?? "PayTR token alınamadı." };
  }

  return { basarili: true, token: sonuc.token };
}

export function paytrBildirimHashDogrula({ merchantOid, status, totalAmount, hash }) {
  const merchantKey = ortamDegiskeni("PAYTR_MERCHANT_KEY");
  const merchantSalt = ortamDegiskeni("PAYTR_MERCHANT_SALT");

  const hesaplananHash = crypto
    .createHmac("sha256", merchantKey)
    .update(merchantOid + merchantSalt + status + totalAmount)
    .digest("base64");

  return hesaplananHash === hash;
}
