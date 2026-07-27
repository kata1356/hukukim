import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrBildirimHashDogrula } from "@/lib/paytr";

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
    .select("muvekkil_id, tutar")
    .maybeSingle();

  // Bakiye yukleme (top-up) akisi: merchant_oid "BKY" ile basliyor,
  // odeme.tutar kadari muvekkilin bakiyesine ekleniyor.
  if (status === "success" && String(merchantOid).startsWith("BKY") && odeme?.muvekkil_id) {
    await supabaseAdmin.rpc("bakiye_ekle", {
      p_muvekkil_id: odeme.muvekkil_id,
      p_tutar: odeme.tutar,
    });

    if (utoken) {
      await supabaseAdmin
        .from("muvekkiller")
        .update({ kart_token: utoken })
        .eq("id", odeme.muvekkil_id);
    }
  }

  return new Response("OK");
}
