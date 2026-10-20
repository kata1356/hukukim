-- Telefon SMS doğrulaması + avukat kimlik/baro kartı belge doğrulaması

-- 1) Profil alanları
alter table muvekkiller add column if not exists telefon_dogrulandi boolean not null default false;
alter table avukatlar add column if not exists telefon_dogrulandi boolean not null default false;

alter table avukatlar add column if not exists kimlik_belge_yolu text;
alter table avukatlar add column if not exists baro_karti_yolu text;
alter table avukatlar add column if not exists belge_durumu text not null default 'yok';
alter table avukatlar add column if not exists belge_notu text;

alter table avukatlar drop constraint if exists avukatlar_belge_durumu_check;
alter table avukatlar add constraint avukatlar_belge_durumu_check
  check (belge_durumu in ('yok', 'incelemede', 'onaylandi', 'reddedildi'));

-- 2) SMS kodları. RLS açık, politika yok: yalnızca service_role (sunucu API) erişir.
create table if not exists telefon_kodlari (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  telefon text not null,
  kod_hash text not null,
  bitis timestamptz not null,
  deneme integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists telefon_kodlari_user_idx on telefon_kodlari (user_id, created_at desc);
alter table telefon_kodlari enable row level security;

-- 3) Kullanıcı oturumuyla (auth.uid() dolu) gelen güncellemelerde korunan alanlar.
--    Sunucu API'leri service_role ile çalıştığı için bu kısıtlardan etkilenmez.
create or replace function avukat_dogrulanmis_koru()
returns trigger as $$
begin
  if auth.uid() = old.id then
    new.dogrulanmis := old.dogrulanmis;
    new.telefon_dogrulandi := old.telefon_dogrulandi;
    new.belge_notu := old.belge_notu;
    -- Avukat belge durumunu yalnızca "incelemede" yapabilir; onay/ret adminindir.
    if new.belge_durumu is distinct from old.belge_durumu and new.belge_durumu <> 'incelemede' then
      new.belge_durumu := old.belge_durumu;
    end if;
    -- Onaylanmış belge yolları değiştirilemez.
    if old.belge_durumu = 'onaylandi' then
      new.kimlik_belge_yolu := old.kimlik_belge_yolu;
      new.baro_karti_yolu := old.baro_karti_yolu;
      new.belge_durumu := old.belge_durumu;
    end if;
    -- Telefon değişirse doğrulama sıfırlanır.
    if new.telefon is distinct from old.telefon then
      new.telefon_dogrulandi := false;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function muvekkil_telefon_koru()
returns trigger as $$
begin
  if auth.uid() = old.id then
    new.telefon_dogrulandi := old.telefon_dogrulandi;
    if new.telefon is distinct from old.telefon then
      new.telefon_dogrulandi := false;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists muvekkil_telefon_koru_trigger on muvekkiller;
create trigger muvekkil_telefon_koru_trigger
before update on muvekkiller
for each row execute function muvekkil_telefon_koru();

-- 4) Özel belge deposu (kimlik ve baro kartı fotoğrafları)
insert into storage.buckets (id, name, public)
values ('avukat-belgeleri', 'avukat-belgeleri', false)
on conflict (id) do nothing;

drop policy if exists "belge_sahip_yukle" on storage.objects;
create policy "belge_sahip_yukle" on storage.objects
  for insert with check (
    bucket_id = 'avukat-belgeleri'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "belge_sahip_guncelle" on storage.objects;
create policy "belge_sahip_guncelle" on storage.objects
  for update using (
    bucket_id = 'avukat-belgeleri'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "belge_sahip_gor" on storage.objects;
create policy "belge_sahip_gor" on storage.objects
  for select using (
    bucket_id = 'avukat-belgeleri'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "belge_admin_gor" on storage.objects;
create policy "belge_admin_gor" on storage.objects
  for select using (
    bucket_id = 'avukat-belgeleri'
    and exists (select 1 from yoneticiler y where y.id = auth.uid())
  );

NOTIFY pgrst, 'reload schema';
