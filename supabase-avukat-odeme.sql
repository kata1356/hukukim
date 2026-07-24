-- Avukat hakedis odemesi (manuel havale/EFT takibi) destegi
-- Bu dosyayi Supabase projendeki SQL Editor'e yapistirip calistir.

-- Avukatin hakedislerinin gonderilecegi IBAN.
alter table avukatlar add column if not exists iban text;

-- Musteriden tahsil edilen bir gorusme ucretinin avukata (manuel havale ile)
-- fiilen aktarilip aktarilmadigini isaretlemek icin.
alter table randevu_talepleri add column if not exists avukata_odendi boolean not null default false;

NOTIFY pgrst, 'reload schema';
