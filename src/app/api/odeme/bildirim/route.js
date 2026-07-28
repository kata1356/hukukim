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
    .select("muvekkil_id, randevu_talep_id")
    .maybeSingle();

  // Talep on-odemesi: gorusme henuz eslesmedi, sadece odeme_durumu
  // "odendi" olarak isaretlenir, talep havuzda gorunur hale gelir.
  // durum ("bekliyor") kasten degistirilmez.
  if (status === "success" && odeme?.randevu_talep_id) {
    await supabaseAdmin
      .from("randevu_talepleri")
      .update({ odeme_durumu: "odendi" })
      .eq("id", odeme.randevu_talep_id);
  }

  if (status === "success" && utoken && odeme?.muvekkil_id) {
    await supabaseAdmin
      .from("muvekkiller")
      .update({ kart_token: utoken })
      .eq("id", odeme.muvekkil_id);
  }

  return new Response("OK");
}
