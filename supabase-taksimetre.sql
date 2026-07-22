-- Dakika bazlı (taksimetre) ücretlendirme desteği
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

-- Müvekkilin kayıtlı kartı (PayTR "utoken"), bir kere kaydedilince
-- sonraki tüm görüşmelerde tekrar kart girmesine gerek kalmaz.
alter table muvekkiller add column if not exists kart_token text;

-- Avukatın görüşme sonrası girdiği süre; ücret bundan hesaplanır.
alter table randevu_talepleri add column if not exists gorusme_suresi_dakika integer;

-- "tamamlandi": görüşme yapıldı, süre girildi (ödeme tahsil edilmiş ya da
-- edilmemiş olabilir, odeme_durumu alanına bakılır).
alter table randevu_talepleri drop constraint if exists randevu_talepleri_durum_check;
alter table randevu_talepleri add constraint randevu_talepleri_durum_check
  check (durum in ('bekliyor', 'kabul', 'red', 'tamamlandi'));

NOTIFY pgrst, 'reload schema';
