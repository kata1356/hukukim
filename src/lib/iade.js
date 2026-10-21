import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrIadeYap } from "@/lib/paytr";

// Talebin on odemesini (ilk basarili odeme) PayTR uzerinden iade eder.
// Odeme kaydi bulunamazsa iade edilecek bir sey yoktur, basarili sayilir.
export async function ilkOdemeyiIadeEt(randevuTalepId) {
  const { data: odeme } = await supabaseAdmin
    .from("odemeler")
    .select("merchant_oid, tutar")
    .eq("randevu_talep_id", randevuTalepId)
    .eq("durum", "basarili")
    .like("merchant_oid", "TLP%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!odeme) return { basarili: true };

  const sonuc = await paytrIadeYap({
    merchantOid: odeme.merchant_oid,
    tutarKurus: Math.round(Number(odeme.tutar) * 100),
  });

  if (sonuc.basarili) {
    // Yonetici panelinde gorunsun diye; durum kisitinda yoksa (SQL calistirilmadiysa) yok sayilir.
    await supabaseAdmin.from("odemeler").update({ durum: "iade_edildi" }).eq("merchant_oid", odeme.merchant_oid);
  }

  return sonuc;
}
