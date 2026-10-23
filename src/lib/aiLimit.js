import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";

export const AI_SAATLIK_LIMIT = 10;

// Kullanıcının son 1 saatteki AI çağrısı sınırı aşılmadıysa çağrıyı kaydeder ve true döner.
// Tablo yoksa ya da sorgu hata verirse (bkz. supabase-ai-limit.sql) özelliği kapatmamak için
// izin verilir, ama hata loglanır.
export async function aiLimitiKontrolEt(kullaniciId, uc) {
  const birSaatOnce = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("ai_cagrilari")
    .select("id", { count: "exact", head: true })
    .eq("user_id", kullaniciId)
    .gte("created_at", birSaatOnce);

  if (error) {
    console.error("AI limit sorgusu başarısız (supabase-ai-limit.sql çalıştırıldı mı?):", error.message);
    return true;
  }

  if ((count ?? 0) >= AI_SAATLIK_LIMIT) return false;

  const { error: eklemeHatasi } = await supabaseAdmin
    .from("ai_cagrilari")
    .insert({ user_id: kullaniciId, uc });
  if (eklemeHatasi) console.error("AI limit kaydı eklenemedi:", eklemeHatasi.message);

  return true;
}
