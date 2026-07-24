-- Gorusme oncesi kart dogrulama (1 TL tahsilat + otomatik iade) destegi
-- Bu dosyayi Supabase projendeki SQL Editor'e yapistirip calistir.

alter table odemeler add column if not exists muvekkil_id uuid references muvekkiller(id) on delete set null;

NOTIFY pgrst, 'reload schema';
