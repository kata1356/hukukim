export async function odemeDurumuBelirle(supabase, muvekkilId) {
  const { count } = await supabase
    .from("randevu_talepleri")
    .select("id", { count: "exact", head: true })
    .eq("muvekkil_id", muvekkilId);

  return count && count > 0 ? "gerekli" : "muaf";
}
