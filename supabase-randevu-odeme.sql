-- Randevu ödemesi desteği
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

alter table randevu_talepleri add column if not exists odeme_durumu text not null default 'gerekli' check (odeme_durumu in ('gerekli', 'odendi', 'muaf'));
alter table randevu_talepleri add column if not exists odeme_tutari numeric not null default 199;

alter table odemeler add column if not exists randevu_talep_id uuid references randevu_talepleri(id) on delete set null;

-- Müvekkil, kendi talebinin ödeme durumunu güncelleyebilsin diye ekstra bir
-- politikaya gerek yok: mevcut "randevu_update_avukat" politikası sadece
-- avukat_id eşleşen satırları kapsıyor. Ödeme durumunu yalnızca webhook
-- (service_role ile /api/odeme/bildirim) günceller, bu yüzden ayrı bir
-- update politikası eklemiyoruz.

NOTIFY pgrst, 'reload schema';
