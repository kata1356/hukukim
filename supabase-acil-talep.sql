-- Acil avukat talebi desteği

alter table randevu_talepleri add column if not exists acil boolean not null default false;

NOTIFY pgrst, 'reload schema';
