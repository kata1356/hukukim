import "server-only";

export async function ilkGorusmeMi(supabaseAdmin, muvekkilId, haricTutulacakTalepId) {
  let sorgu = supabaseAdmin
    .from("randevu_talepleri")
    .select("id", { count: "exact", head: true })
    .eq("muvekkil_id", muvekkilId);

  if (haricTutulacakTalepId) {
    sorgu = sorgu.neq("id", haricTutulacakTalepId);
  }

  const { count } = await sorgu;
  return !count;
}
