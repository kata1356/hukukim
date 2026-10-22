-- Haftalık hakediş takibi: avukata havalenin yapıldığı tarih.
-- Yönetici panelindeki "Avukat Ödemeleri" sayfası bu kolonu yazar
-- (yöneticiler için güncelleme politikası supabase-bakiye-sistemi.sql içinde zaten var).
alter table avukat_kazanclari add column if not exists odeme_tarihi timestamptz;

NOTIFY pgrst, 'reload schema';
