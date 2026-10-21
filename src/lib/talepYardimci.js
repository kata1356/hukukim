import "server-only";

// "İlk görüşme" yalnızca ÖDENMİŞ bir talebi olmayan müvekkil için geçerlidir.
// Ödemeyi yarıda bırakıp dönen müvekkil hediye süreyi kaybetmez; iade edilmiş
// (iptal) ödemeli talep ise hediyeyi kullanılmış sayar (iptal-iade ile tekrar
// tekrar hediye alınamasın).
export async function ilkGorusmeMi(supabaseAdmin, muvekkilId) {
  const { count } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id", { count: "exact", head: true })
    .eq("muvekkil_id", muvekkilId)
    .eq("odeme_durumu", "odendi");

  return !count;
}
