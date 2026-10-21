import "server-only";

// Müvekkilin ücretsiz deneme hakkı: daha önce ödenmiş ya da deneme olarak
// kullanılmış (iptal edilmemiş) bir talebi yoksa geçerlidir.
export async function ilkGorusmeMi(supabaseAdmin, muvekkilId) {
  const { count } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id", { count: "exact", head: true })
    .eq("muvekkil_id", muvekkilId)
    .or("odeme_durumu.eq.odendi,and(odeme_durumu.eq.muaf,durum.neq.iptal)");

  return !count;
}

// Telefon numarası başka bir hesapta (müvekkil ya da avukat) kayıtlı mı?
export async function telefonKullanimda(supabaseAdmin, telefon, haricId) {
  for (const tablo of ["muvekkiller", "avukatlar"]) {
    let sorgu = supabaseAdmin.from(tablo).select("id", { count: "exact", head: true }).eq("telefon", telefon);
    if (haricId) sorgu = sorgu.neq("id", haricId);
    const { count } = await sorgu;
    if (count) return true;
  }
  return false;
}

// Deneme hakkı numaraya bağlıdır: hesap silinip aynı numarayla yeniden açılsa
// bile tekrar verilmez. true = hak bu çağrıyla alındı.
export async function denemeHakkiniAl(supabaseAdmin, muvekkilId, telefon) {
  const { error } = await supabaseAdmin.from("deneme_kullanimlari").insert({ telefon, muvekkil_id: muvekkilId });
  return !error;
}

// Talep hiç eşleşmeden iptal olduysa (avukat bulunamadı) deneme hakkı geri verilir.
export async function denemeHakkiniGeriVer(supabaseAdmin, muvekkilId) {
  await supabaseAdmin.from("deneme_kullanimlari").delete().eq("muvekkil_id", muvekkilId);
}
