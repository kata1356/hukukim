import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// İstekteki Bearer token'dan avukatı doğrular. Başarılıysa { avukat }, değilse { hata, durum } döner.
export async function avukatiDogrula(request, { dogrulanmisGerekli = true } = {}) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");
  if (!token) return { hata: "Oturum bulunamadı.", durum: 401 };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { hata: "Oturum geçersiz.", durum: 401 };

  const { data: avukat } = await supabaseAdmin
    .from("avukatlar")
    .select("id, ad_soyad, sehir, uzmanlik_alanlari, dogrulanmis")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!avukat) return { hata: "Avukat hesabı bulunamadı.", durum: 403 };
  if (dogrulanmisGerekli && !avukat.dogrulanmis) {
    return { hata: "Bu özellik doğrulanmış avukatlara açıktır.", durum: 403 };
  }
  return { avukat };
}
