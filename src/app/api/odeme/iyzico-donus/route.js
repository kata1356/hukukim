import { NextResponse } from "next/server";
import { odemeyiIsle, donusAdresiBul } from "@/lib/odemeIsle";
import { ODEME_DONUS_ADRESI } from "@/lib/site";

// iyzico ödeme sonrası tarayıcıyı buraya yönlendirir (token ile). Sonucu iyzico'dan kendimiz sorgular,
// kaydı işler ve kullanıcıyı başarılı/başarısız sayfasına geçiririz. Ödeme formu bir çerçeve (iframe)
// içinde açıldığı için yönlendirme de o çerçevenin içinde olur.
async function isle(token) {
  let sonuc = await odemeyiIsle(token);
  // Yan etki hatasında bir kez daha dene; yine olmazsa webhook (15 dk'da bir tekrar) tamamlar.
  if (sonuc.yenidenDene) sonuc = await odemeyiIsle(token);

  if (sonuc.durum === "bilinmiyor" || sonuc.durum === "belirsiz") {
    return NextResponse.redirect(`${ODEME_DONUS_ADRESI}/odeme/basarisiz`, 303);
  }

  return NextResponse.redirect(
    donusAdresiBul({
      merchantOid: sonuc.merchantOid,
      randevuTalepId: sonuc.randevuTalepId,
      basarili: sonuc.durum === "basarili",
    }),
    303
  );
}

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  return isle(form?.get("token"));
}

export async function GET(request) {
  return isle(new URL(request.url).searchParams.get("token"));
}
