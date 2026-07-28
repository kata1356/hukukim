-- Paket bazli fiyatlandirma + Marti tarzi eslesme sistemi
-- Bu dosyayi Supabase projendeki SQL Editor'e yapistirip calistir.
-- (Onceki oturumdaki cuzdan/bakiye sistemi tablolarina (muvekkil_bakiyeleri)
--  artik gerek yok ama veri kaybi olmasin diye burada silmiyoruz.)

alter table randevu_talepleri add column if not exists paket_dakika integer;
alter table randevu_talepleri add column if not exists paket_tutari numeric;

NOTIFY pgrst, 'reload schema';
