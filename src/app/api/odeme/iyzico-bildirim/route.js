import { odemeyiIsle } from "@/lib/odemeIsle";
import { iyzicoBildirimImzasiDogru } from "@/lib/iyzico";

// iyzico işyeri bildirimi (webhook). Müşteri ödeme sonrası tarayıcısını kapatsa bile ödemenin
// işlenmesini sağlar. Merchant Panel > Ayarlar > Firma Ayarları > İşyeri Bildirimleri'ne
// https://hukukim.com/api/odeme/iyzico-bildirim adresi girilir.
// Güvenlik: gövdeden yalnızca token alınır, sonuç iyzico'dan kendi anahtarlarımızla sorgulanır; bu
// yüzden sahte bir istek hiçbir ödemeyi başarılı yapamaz. İmza (varsa) yalnızca ek kontroldür.
export async function POST(request) {
  const govde = await request.json().catch(() => null);
  const token = govde?.token;
  if (!token) return new Response("OK");

  const imza = request.headers.get("x-iyz-signature-v3");
  if (imza && !iyzicoBildirimImzasiDogru(govde, imza)) {
    console.error("iyzico bildirim imzası geçersiz.");
    return new Response("invalid signature", { status: 400 });
  }

  const sonuc = await odemeyiIsle(token);

  // 2xx dışında yanıt verirsek iyzico bildirimi tekrar gönderir.
  if (sonuc.yenidenDene || sonuc.durum === "belirsiz") {
    return new Response("retry", { status: 500 });
  }
  return new Response("OK");
}
