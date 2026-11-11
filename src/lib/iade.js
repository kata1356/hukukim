import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { iyzicoIadeYap } from "@/lib/iyzico";

// Talebin on odemesini (ilk basarili odeme) iyzico uzerinden iade eder.
// Odeme kaydi bulunamazsa iade edilecek bir sey yoktur, basarili sayilir.
export async function ilkOdemeyiIadeEt(randevuTalepId) {
  const { data: odeme } = await supabaseAdmin
    .from("odemeler")
    .select("merchant_oid, tutar, iyzico_odeme_id")
    .eq("randevu_talep_id", randevuTalepId)
    .eq("durum", "basarili")
    .like("merchant_oid", "TLP%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!odeme) return { basarili: true };

  const sonuc = await iyzicoIadeYap({
    odemeId: odeme.iyzico_odeme_id,
    tutar: Number(odeme.tutar),
  });

  if (sonuc.basarili) {
    // Yonetici panelinde gorunsun diye; durum kisitinda yoksa (SQL calistirilmadiysa) yok sayilir.
    await supabaseAdmin.from("odemeler").update({ durum: "iade_edildi" }).eq("merchant_oid", odeme.merchant_oid);
  }

  return sonuc;
}
