-- Görüşme giriş kayıtları (yalnızca meta veri: kim, hangi görüşme, ne zaman; içerik kaydedilmez)
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.
--
-- /api/video/katil her çağrıldığında (taraf odaya girmek için sunucudan izin aldığında) bir satır eklenir.
-- Kayıt eklemek yalnızca sunucudan (service role) yapılır; yalnızca yöneticiler okuyabilir.

create table if not exists gorusme_olaylari (
  id uuid primary key default gen_random_uuid(),
  randevu_talep_id uuid references randevu_talepleri(id) on delete cascade not null,
  kullanici_id uuid references auth.users(id) on delete set null,
  rol text not null check (rol in ('muvekkil', 'avukat')),
  olay text not null default 'giris',
  created_at timestamptz not null default now()
);

create index if not exists gorusme_olaylari_talep_idx on gorusme_olaylari (randevu_talep_id, created_at);

alter table gorusme_olaylari enable row level security;

create policy "gorusme_olaylari_admin_select" on gorusme_olaylari
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

NOTIFY pgrst, 'reload schema';
