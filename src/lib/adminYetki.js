import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";

// İstekteki oturum jetonundan kullanıcıyı çözer. Dönüş: { kullanici, yonetici } ya da { hata, durum }.
export async function istekKullanicisi(request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return { hata: "Oturum bulunamadı.", durum: 401 };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { hata: "Oturum geçersiz.", durum: 401 };

  const { data: yonetici } = await supabaseAdmin
    .from("yoneticiler")
    .select("id, ad_soyad")
    .eq("id", data.user.id)
    .maybeSingle();

  return { kullanici: data.user, yonetici };
}

// Yalnızca yöneticilere izin verir.
export async function yoneticiIstegi(request) {
  const sonuc = await istekKullanicisi(request);
  if (sonuc.hata) return sonuc;
  if (!sonuc.yonetici) return { hata: "Bu işlem için yönetici yetkisi gerekir.", durum: 403 };
  return sonuc;
}
