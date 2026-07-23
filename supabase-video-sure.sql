-- Görüntülü görüşme için otomatik süre takibi
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

alter table randevu_talepleri add column if not exists video_baslangic_zamani timestamptz;

NOTIFY pgrst, 'reload schema';
