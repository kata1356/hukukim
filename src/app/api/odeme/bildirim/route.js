import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrBildirimHashDogrula, paytrIadeYap } from "@/lib/paytr";
import { GORUSME_PAKETLERI } from "@/lib/odemeYardimci";

const EK_SURE_PAKETI = GORUSME_PAKETLERI[0];

// PayTR "OK" dışında bir yanıt alırsa bildirimi tekrar gönderir. Yan etkilerden
// biri başarısız olursa ödeme kaydını geri "basladi"ya çekip 500 dönüyoruz ki
// bir sonraki deneme işlemi baştan, tek seferlik olarak yeniden yapsın.
async function yanEtkisiBasarisiz(merchantOid, ayrinti) {
  console.error("PayTR bildirim yan etkisi başarısız:", merchantOid, ayrinti);
  await supabaseAdmin.from("odemeler").update({ durum: "basladi" }).eq("merchant_oid", merchantOid);
  return new Response("PAYTR notification retry", { status: 500 });
}

export async function POST(request) {
  const formVerisi = await request.formData();
  const merchantOid = formVerisi.get("merchant_oid");
  const status = formVerisi.get("status");
  const totalAmount = formVerisi.get("total_amount");
  const hash = formVerisi.get("hash");
  const failedReasonMsg = formVerisi.get("failed_reason_msg");
  const utoken = formVerisi.get("utoken");

  const gecerliMi = paytrBildirimHashDogrula({ merchantOid, status, totalAmount, hash });

  if (!gecerliMi) {
    return new Response("PAYTR notification failed: bad hash", { status: 400 });
  }

  // Atomik kosullu guncelleme: PayTR ayni bildirimi birden fazla kez
  // gonderebilir. "basarili" durumundan tekrar "basarili"ya gecisi WHERE
  // kosuluyla engelleyerek, ek sure ve iade gibi tek seferlik yan etkilerin
  // sadece ILK basarili bildirimde calismasini garanti ediyoruz.
  const { data: odeme, error: odemeHatasi } = await supabaseAdmin
    .from("odemeler")
    .update({
      durum: status === "success" ? "basarili" : "basarisiz",
      basarisiz_nedeni: status === "success" ? null : failedReasonMsg,
      guncellendi_at: new Date().toISOString(),
    })
    .eq("merchant_oid", merchantOid)
    .neq("durum", "basarili")
    .select("muvekkil_id, randevu_talep_id, tutar")
    .maybeSingle();

  if (odemeHatasi) {
    console.error("PayTR bildirim odeme guncelleme hatasi:", odemeHatasi);
    return new Response("PAYTR notification retry", { status: 500 });
  }

  // Bu bildirim daha once islenmis (tekrar gonderim) ya da bilinmeyen siparis.
  if (!odeme) {
    return new Response("OK");
  }

  const ekSureMi = String(merchantOid).startsWith("EKS");

  if (status === "success" && odeme.randevu_talep_id) {
    const { data: talep, error: talepHatasi } = await supabaseAdmin
      .from("randevu_talepleri")
      .select("durum, paket_dakika, paket_tutari, odeme_tutari")
      .eq("id", odeme.randevu_talep_id)
      .maybeSingle();

    if (talepHatasi) return yanEtkisiBasarisiz(merchantOid, talepHatasi);

    if (ekSureMi) {
      // Gorusme sirasinda satin alinan ek sure: paket dakikasini ve tutarini
      // mevcut talebin uzerine ekle. Gorusme bu arada bittiyse iade et.
      if (talep?.durum === "kabul") {
        const { error } = await supabaseAdmin
          .from("randevu_talepleri")
          .update({
            paket_dakika: Number(talep.paket_dakika || 0) + EK_SURE_PAKETI.dakika,
            paket_tutari: Number(talep.paket_tutari || 0) + EK_SURE_PAKETI.tutar,
            odeme_tutari: Number(talep.odeme_tutari || 0) + EK_SURE_PAKETI.tutar,
          })
          .eq("id", odeme.randevu_talep_id);

        if (error) return yanEtkisiBasarisiz(merchantOid, error);
      } else {
        await paytrIadeYap({
          merchantOid,
          tutarKurus: Math.round(Number(odeme.tutar) * 100),
        });
      }
    } else if (talep?.durum === "bekliyor") {
      // Talep on-odemesi: gorusme henuz eslesmedi, sadece odeme_durumu
      // "odendi" olarak isaretlenir, talep havuzda gorunur hale gelir.
      // durum ("bekliyor") kasten degistirilmez.
      const { error } = await supabaseAdmin
        .from("randevu_talepleri")
        .update({ odeme_durumu: "odendi" })
        .eq("id", odeme.randevu_talep_id);

      if (error) return yanEtkisiBasarisiz(merchantOid, error);
    } else {
      // Muvekkil odemeyi talep zaman asimi/iptal sonrasi tamamladi: talep
      // artik gecersiz, parayi otomatik iade et.
      const { basarili } = await paytrIadeYap({
        merchantOid,
        tutarKurus: Math.round(Number(odeme.tutar) * 100),
      });
      if (!basarili) return yanEtkisiBasarisiz(merchantOid, "gec odeme iadesi basarisiz");
    }
  }

  if (status === "success" && utoken && odeme.muvekkil_id) {
    await supabaseAdmin.from("muvekkiller").update({ kart_token: utoken }).eq("id", odeme.muvekkil_id);
  }

  return new Response("OK");
}
