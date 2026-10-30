-- Gönderilen e-postaların kaydı (yönetici panelinde görüntülenir). İçerik saklanmaz.
create table if not exists eposta_kayitlari (
  id uuid primary key default gen_random_uuid(),
  alici_email text not null,
  alici_id uuid,
  tur text not null default 'diger',
  konu text,
  durum text not null default 'gonderildi' check (durum in ('gonderildi', 'hata', 'atlandi')),
  resend_id text,
  teslim_durumu text,
  hata text,
  created_at timestamptz not null default now()
);

create index if not exists eposta_kayitlari_zaman_idx on eposta_kayitlari (created_at desc);
create index if not exists eposta_kayitlari_tur_idx on eposta_kayitlari (tur, alici_email, created_at desc);
alter table eposta_kayitlari enable row level security;

drop policy if exists "eposta_admin_select" on eposta_kayitlari;
create policy "eposta_admin_select" on eposta_kayitlari
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

notify pgrst, 'reload schema';
