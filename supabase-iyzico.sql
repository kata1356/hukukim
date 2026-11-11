-- iyzico entegrasyonu: ödeme kayıtlarına iyzico kimlikleri.
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

alter table odemeler add column if not exists iyzico_token text;
alter table odemeler add column if not exists iyzico_odeme_id text;

create unique index if not exists odemeler_iyzico_token_idx on odemeler (iyzico_token) where iyzico_token is not null;

NOTIFY pgrst, 'reload schema';
