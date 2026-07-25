export const DAKIKA_UCRETI = 40;
export const ILK_UCRETSIZ_DAKIKA = 5;
export const AVUKAT_KOMISYON_ORANI = 0.6;

export function avukatPayiHesapla(tutar) {
  return Math.round(Number(tutar || 0) * AVUKAT_KOMISYON_ORANI);
}

export async function odemeDurumuBelirle(supabase, muvekkilId) {
  const { count } = await supabase
    .from("randevu_talepleri")
    .select("id", { count: "exact", head: true })
    .eq("muvekkil_id", muvekkilId);

  return count && count > 0 ? "gerekli" : "muaf";
}
