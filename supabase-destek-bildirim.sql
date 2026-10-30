-- Canlı destek + yönetici bildirimleri

-- 1) Destek mesajları: her kullanıcının (avukat/müvekkil) yönetimle tek bir konuşması vardır.
create table if not exists destek_mesajlari (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  gonderen text not null check (gonderen in ('kullanici', 'admin')),
  metin text not null check (length(trim(metin)) between 1 and 1500),
  okundu boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists destek_mesajlari_kullanici_idx on destek_mesajlari (kullanici_id, created_at);
alter table destek_mesajlari enable row level security;

-- Kullanıcı yalnızca kendi konuşmasını okur. Yazma sunucu API'sinden (service role) yapılır.
drop policy if exists "destek_select_sahip" on destek_mesajlari;
create policy "destek_select_sahip" on destek_mesajlari
  for select using (kullanici_id = auth.uid());

drop policy if exists "destek_admin_select" on destek_mesajlari;
create policy "destek_admin_select" on destek_mesajlari
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

drop policy if exists "destek_admin_update" on destek_mesajlari;
create policy "destek_admin_update" on destek_mesajlari
  for update using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

do $$
begin
  alter publication supabase_realtime add table destek_mesajlari;
exception when duplicate_object then null;
end $$;

-- 2) Aynı olay için tekrar tekrar e-posta gitmesin diye kayıt. Yalnızca sunucu erişir.
create table if not exists admin_bildirim_log (
  id uuid primary key default gen_random_uuid(),
  tip text not null,
  kullanici_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists admin_bildirim_log_idx on admin_bildirim_log (tip, kullanici_id, created_at desc);
alter table admin_bildirim_log enable row level security;

-- 3) Yarım kalan kayıtlar için 10 dakikalık kontrol: mevcut cron işinin komutunu (gizli anahtar dahil)
--    kopyalayıp yalnızca adresini değiştirir; anahtarı elle yazmanız gerekmez.
do $$
declare
  eski_komut text;
begin
  select command into eski_komut from cron.job where command like '%bekleyen-talepleri-iptal-et%' limit 1;
  if eski_komut is not null then
    perform cron.unschedule(jobid) from cron.job where jobname = 'yarim-kayit-bildir';
    perform cron.schedule(
      'yarim-kayit-bildir',
      '*/10 * * * *',
      replace(eski_komut, 'bekleyen-talepleri-iptal-et', 'yarim-kayit-bildir')
    );
  else
    raise notice 'Mevcut cron işi bulunamadı; yarım kalan kayıt kontrolü zamanlanmadı.';
  end if;
end $$;

notify pgrst, 'reload schema';
