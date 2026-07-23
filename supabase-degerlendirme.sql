-- Avukat değerlendirme (yıldız + yorum) sistemi
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

create table if not exists degerlendirmeler (
  id uuid primary key default gen_random_uuid(),
  randevu_talep_id uuid references randevu_talepleri(id) on delete cascade not null unique,
  muvekkil_id uuid references muvekkiller(id) on delete cascade not null,
  avukat_id uuid references avukatlar(id) on delete cascade not null,
  puan integer not null check (puan between 1 and 5),
  yorum text,
  created_at timestamptz default now()
);

alter table degerlendirmeler enable row level security;

-- Herkes okuyabilir (avukat kartlarında ortalama puan gösterilecek).
create policy "degerlendirme_select_all" on degerlendirmeler
  for select using (true);

-- Müvekkil, yalnızca kendi tamamlanmış randevusu için ve yalnızca bir kere
-- değerlendirme ekleyebilir (randevu_talep_id sütunu unique olduğu için
-- ikinci bir ekleme denemesi zaten veritabanı seviyesinde reddedilir).
create policy "degerlendirme_insert_own" on degerlendirmeler
  for insert
  with check (
    muvekkil_id = auth.uid()
    and exists (
      select 1 from randevu_talepleri r
      where r.id = randevu_talep_id
        and r.muvekkil_id = auth.uid()
        and r.avukat_id = avukat_id
        and r.durum = 'tamamlandi'
    )
  );

NOTIFY pgrst, 'reload schema';
