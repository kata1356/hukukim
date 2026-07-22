-- PayTR ödeme kayıtları
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

create table if not exists odemeler (
  id uuid primary key default gen_random_uuid(),
  merchant_oid text not null unique,
  ad_soyad text,
  email text,
  tutar numeric not null,
  test_modu boolean not null default true,
  durum text not null default 'basladi' check (durum in ('basladi', 'basarili', 'basarisiz')),
  basarisiz_nedeni text,
  created_at timestamptz default now(),
  guncellendi_at timestamptz default now()
);

alter table odemeler enable row level security;

-- Yalnızca yöneticiler ödeme kayıtlarını görebilir. Yazma işlemleri
-- yalnızca sunucu tarafında (service_role ile /api/odeme rotaları
-- üzerinden) yapılır, bu yüzden insert/update politikası tanımlanmadı.
create policy "odemeler_admin_select_all" on odemeler
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

NOTIFY pgrst, 'reload schema';
