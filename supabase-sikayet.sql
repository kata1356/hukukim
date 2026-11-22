-- Şikayet / mağduriyet bildirimi (müvekkil ve avukat, görüşme bazlı)
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.
--
-- Her görüşmenin kimliği randevu_talepleri.id'dir. Şikayet, bu kimliğe bağlanır; böylece
-- "hangi görüşme, kim kiminle görüşmüş" sonradan incelenebilir.
-- Kayıt eklemek yalnızca /api/sikayet (service role) üzerinden yapılır; kullanıcılar tabloya doğrudan erişemez.

create table if not exists sikayetler (
  id uuid primary key default gen_random_uuid(),
  randevu_talep_id uuid references randevu_talepleri(id) on delete cascade not null,
  sikayet_eden_id uuid references auth.users(id) on delete cascade not null,
  sikayet_eden_rol text not null check (sikayet_eden_rol in ('muvekkil', 'avukat')),
  sikayet_edilen_id uuid references auth.users(id) on delete set null,
  kategori text not null,
  aciklama text not null check (char_length(aciklama) between 10 and 2000),
  durum text not null default 'acik' check (durum in ('acik', 'incelemede', 'cozuldu', 'reddedildi')),
  admin_notu text,
  created_at timestamptz not null default now(),
  guncellendi_at timestamptz
);

create index if not exists sikayetler_talep_idx on sikayetler (randevu_talep_id);
create index if not exists sikayetler_durum_idx on sikayetler (durum, created_at desc);

alter table sikayetler enable row level security;

-- Yöneticiler tüm şikayetleri görebilir ve durumunu/notunu güncelleyebilir.
create policy "sikayetler_admin_select" on sikayetler
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

create policy "sikayetler_admin_update" on sikayetler
  for update using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

NOTIFY pgrst, 'reload schema';
