-- HUKUKIM veritabanı şeması
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

-- Avukatlar tablosu
create table if not exists avukatlar (
  id uuid references auth.users(id) on delete cascade primary key,
  ad_soyad text not null,
  email text not null,
  telefon text,
  baro_sicil_no text,
  sehir text,
  uzmanlik_alanlari text[] default '{}',
  biyografi text,
  kvkk_onay boolean not null default false,
  created_at timestamptz default now()
);

-- Müvekkiller tablosu
create table if not exists muvekkiller (
  id uuid references auth.users(id) on delete cascade primary key,
  ad_soyad text not null,
  email text not null,
  telefon text,
  sehir text,
  kvkk_onay boolean not null default false,
  created_at timestamptz default now()
);

-- Randevu talepleri tablosu
-- muvekkil_ad_soyad ve muvekkil_telefon, avukat panelinde müvekkiller
-- tablosuna erişmeden talebi görebilsin diye talep anında kopyalanır.
create table if not exists randevu_talepleri (
  id uuid primary key default gen_random_uuid(),
  muvekkil_id uuid references muvekkiller(id) on delete cascade not null,
  avukat_id uuid references avukatlar(id) on delete cascade not null,
  muvekkil_ad_soyad text not null,
  muvekkil_telefon text,
  konu text not null,
  aciklama text,
  gorusme_sekli text not null check (gorusme_sekli in ('goruntulu','yuz_yuze','mesaj')),
  tarih date not null,
  durum text not null default 'bekliyor' check (durum in ('bekliyor','kabul','red')),
  created_at timestamptz default now()
);

-- Row Level Security
alter table avukatlar enable row level security;
alter table muvekkiller enable row level security;
alter table randevu_talepleri enable row level security;

-- Avukatlar: herkes arama/listeleme için okuyabilir
create policy "avukatlar_select_all" on avukatlar
  for select using (true);

create policy "avukatlar_insert_own" on avukatlar
  for insert with check (auth.uid() = id);

create policy "avukatlar_update_own" on avukatlar
  for update using (auth.uid() = id);

-- Müvekkiller: yalnızca kendi kaydını okur/yazar
create policy "muvekkiller_select_own" on muvekkiller
  for select using (auth.uid() = id);

create policy "muvekkiller_insert_own" on muvekkiller
  for insert with check (auth.uid() = id);

create policy "muvekkiller_update_own" on muvekkiller
  for update using (auth.uid() = id);

-- Randevu talepleri: müvekkil kendi taleplerini, avukat kendine gelenleri görür
create policy "randevu_select_muvekkil" on randevu_talepleri
  for select using (auth.uid() = muvekkil_id);

create policy "randevu_select_avukat" on randevu_talepleri
  for select using (auth.uid() = avukat_id);

create policy "randevu_insert_muvekkil" on randevu_talepleri
  for insert with check (auth.uid() = muvekkil_id);

create policy "randevu_update_avukat" on randevu_talepleri
  for update using (auth.uid() = avukat_id);
