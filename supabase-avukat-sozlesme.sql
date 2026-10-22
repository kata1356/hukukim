-- Avukat Hizmet Sözleşmesi onayı.
-- avukatlar.sozlesme_surumu / sozlesme_onay_zamani: avukatın onayladığı son sürüm.
-- avukat_sozlesme_onaylari: her onayın değiştirilemez kaydı (sürüm, zaman, IP, tarayıcı).
-- Onayı yalnızca sunucu (service role) yazar; avukat kendi satırında bu alanları değiştiremez.

alter table avukatlar add column if not exists sozlesme_surumu text;
alter table avukatlar add column if not exists sozlesme_onay_zamani timestamptz;

create table if not exists avukat_sozlesme_onaylari (
  id uuid primary key default gen_random_uuid(),
  avukat_id uuid not null,
  surum text not null,
  ip text,
  user_agent text,
  onay_zamani timestamptz not null default now()
);

create index if not exists avukat_sozlesme_onaylari_avukat_idx on avukat_sozlesme_onaylari (avukat_id, onay_zamani desc);
alter table avukat_sozlesme_onaylari enable row level security;

-- Avukat kendi satırını güncellerken sözleşme alanlarını değiştiremez.
create or replace function avukat_sozlesme_koru()
returns trigger as $$
begin
  if auth.uid() is not null and not exists (select 1 from yoneticiler y where y.id = auth.uid()) then
    new.sozlesme_surumu := old.sozlesme_surumu;
    new.sozlesme_onay_zamani := old.sozlesme_onay_zamani;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists avukat_sozlesme_koru_trigger on avukatlar;
create trigger avukat_sozlesme_koru_trigger
before update on avukatlar
for each row execute function avukat_sozlesme_koru();

NOTIFY pgrst, 'reload schema';
