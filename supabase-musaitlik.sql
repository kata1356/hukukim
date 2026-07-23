-- Avukat müsaitlik takvimi (kapalı günler)
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

create table if not exists avukat_kapali_gunler (
  id uuid primary key default gen_random_uuid(),
  avukat_id uuid references avukatlar(id) on delete cascade not null,
  tarih date not null,
  created_at timestamptz default now(),
  unique (avukat_id, tarih)
);

alter table avukat_kapali_gunler enable row level security;

-- Herkes okuyabilir (müvekkil randevu talebi gönderirken avukatın
-- kapalı günlerini görüp o günü seçmesin diye).
create policy "kapali_gunler_select_all" on avukat_kapali_gunler
  for select using (true);

-- Avukat yalnızca kendi kapalı günlerini ekleyebilir/kaldırabilir.
create policy "kapali_gunler_insert_own" on avukat_kapali_gunler
  for insert with check (avukat_id = auth.uid());

create policy "kapali_gunler_delete_own" on avukat_kapali_gunler
  for delete using (avukat_id = auth.uid());

NOTIFY pgrst, 'reload schema';
