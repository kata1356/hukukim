-- On-odemeli bakiye (cuzdan) sistemi
-- Bu dosyayi Supabase projendeki SQL Editor'e yapistirip calistir.

-- Muvekkilin on-odemeli bakiyesi (tek satir, guncel tutar).
create table if not exists muvekkil_bakiyeleri (
  muvekkil_id uuid primary key references muvekkiller(id) on delete cascade,
  bakiye_miktari numeric not null default 0,
  son_guncelleme timestamptz not null default now()
);

alter table muvekkil_bakiyeleri enable row level security;

drop policy if exists "bakiye_select_own" on muvekkil_bakiyeleri;
create policy "bakiye_select_own" on muvekkil_bakiyeleri
  for select using (auth.uid() = muvekkil_id);

-- Avukatin gorusme basina kazanc kaydi (dakika dusumleri gorusme
-- bitince buraya tek satir olarak islenir).
create table if not exists avukat_kazanclari (
  id uuid primary key default gen_random_uuid(),
  avukat_id uuid not null references avukatlar(id) on delete cascade,
  randevu_talep_id uuid references randevu_talepleri(id) on delete set null,
  muvekkil_ad_soyad text,
  kazanilan_miktar numeric not null,
  avukata_odendi boolean not null default false,
  tarih timestamptz not null default now()
);

alter table avukat_kazanclari enable row level security;

drop policy if exists "kazanc_select_own" on avukat_kazanclari;
create policy "kazanc_select_own" on avukat_kazanclari
  for select using (auth.uid() = avukat_id);

drop policy if exists "kazanc_admin_select_all" on avukat_kazanclari;
create policy "kazanc_admin_select_all" on avukat_kazanclari
  for select using (exists (select 1 from yoneticiler where id = auth.uid()));

drop policy if exists "kazanc_admin_update_all" on avukat_kazanclari;
create policy "kazanc_admin_update_all" on avukat_kazanclari
  for update using (exists (select 1 from yoneticiler where id = auth.uid()));

-- Gorusme sirasinda dakika basina bakiyeden dusum yapan atomik fonksiyon.
-- Bakiye 0'in altina inmez (kalan tutar ne ise o kadar duser).
create or replace function bakiye_dakika_dus(p_muvekkil_id uuid, p_tutar numeric)
returns table (yeni_bakiye numeric, dusulen_tutar numeric)
language plpgsql
security definer
as $$
declare
  v_onceki_bakiye numeric;
  v_yeni_bakiye numeric;
begin
  insert into muvekkil_bakiyeleri (muvekkil_id, bakiye_miktari, son_guncelleme)
  values (p_muvekkil_id, 0, now())
  on conflict (muvekkil_id) do nothing;

  select bakiye_miktari into v_onceki_bakiye
  from muvekkil_bakiyeleri
  where muvekkil_id = p_muvekkil_id
  for update;

  update muvekkil_bakiyeleri
  set bakiye_miktari = greatest(v_onceki_bakiye - p_tutar, 0),
      son_guncelleme = now()
  where muvekkil_id = p_muvekkil_id
  returning bakiye_miktari into v_yeni_bakiye;

  return query select v_yeni_bakiye, (v_onceki_bakiye - v_yeni_bakiye);
end;
$$;

-- Bakiye yuklemesi (top-up) icin atomik ekleme fonksiyonu.
create or replace function bakiye_ekle(p_muvekkil_id uuid, p_tutar numeric)
returns numeric
language plpgsql
security definer
as $$
declare
  v_yeni_bakiye numeric;
begin
  insert into muvekkil_bakiyeleri (muvekkil_id, bakiye_miktari, son_guncelleme)
  values (p_muvekkil_id, p_tutar, now())
  on conflict (muvekkil_id) do update
    set bakiye_miktari = muvekkil_bakiyeleri.bakiye_miktari + excluded.bakiye_miktari,
        son_guncelleme = now()
  returning bakiye_miktari into v_yeni_bakiye;

  return v_yeni_bakiye;
end;
$$;

NOTIFY pgrst, 'reload schema';
