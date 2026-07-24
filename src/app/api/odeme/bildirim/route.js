import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrBildirimHashDogrula, paytrIadeYap } from "@/lib/paytr";

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

  const { data: odeme } = await supabaseAdmin
    .from("odemeler")
    .update({
      durum: status === "success" ? "basarili" : "basarisiz",
      basarisiz_nedeni: status === "success" ? null : failedReasonMsg,
      guncellendi_at: new Date().toISOString(),
    })
    .eq("merchant_oid", merchantOid)
    .select("randevu_talep_id, muvekkil_id")
    .maybeSingle();

  if (status === "success" && odeme?.randevu_talep_id) {
    const { data: talep } = await supabaseAdmin
      .from("randevu_talepleri")
      .update({ odeme_durumu: "odendi", durum: "tamamlandi" })
      .eq("id", odeme.randevu_talep_id)
      .select("muvekkil_id")
      .maybeSingle();

    if (utoken && talep?.muvekkil_id) {
      await supabaseAdmin
        .from("muvekkiller")
        .update({ kart_token: utoken })
        .eq("id", talep.muvekkil_id);
    }
  }

  // Gorusme oncesi kart dogrulama akisi: randevu_talep_id yok, sadece
  // muvekkil_id var. Karti kaydedip tahsil edilen kucuk tutari hemen iade et.
  if (status === "success" && !odeme?.randevu_talep_id && odeme?.muvekkil_id) {
    if (utoken) {
      await supabaseAdmin
        .from("muvekkiller")
        .update({ kart_token: utoken })
        .eq("id", odeme.muvekkil_id);
    }

    if (totalAmount) {
      await paytrIadeYap({ merchantOid, tutarKurus: Number(totalAmount) });
    }
  }

  return new Response("OK");
}
