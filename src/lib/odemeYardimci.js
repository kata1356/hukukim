export const DAKIKA_UCRETI = 40;
export const ILK_UCRETSIZ_DAKIKA = 5;

export async function odemeDurumuBelirle(supabase, muvekkilId) {
  const { count } = await supabase
    .from("randevu_talepleri")
    .select("id", { count: "exact", head: true })
    .eq("muvekkil_id", muvekkilId);

  return count && count > 0 ? "gerekli" : "muaf";
}
