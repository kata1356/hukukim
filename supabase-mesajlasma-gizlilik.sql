-- 1) Gerçek mesajlaşma: talebe bağlı, yalnızca talebin müvekkili ve avukatı okuyup yazabilir.
create table if not exists gorusme_mesajlari (
  id uuid primary key default gen_random_uuid(),
  talep_id uuid not null references randevu_talepleri(id) on delete cascade,
  gonderen_id uuid not null,
  metin text not null check (length(trim(metin)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists gorusme_mesajlari_talep_idx on gorusme_mesajlari (talep_id, created_at);
alter table gorusme_mesajlari enable row level security;

drop policy if exists "mesaj_select_taraflar" on gorusme_mesajlari;
create policy "mesaj_select_taraflar" on gorusme_mesajlari
  for select using (
    exists (
      select 1 from randevu_talepleri t
      where t.id = talep_id
        and (t.muvekkil_id = auth.uid() or t.avukat_id = auth.uid())
    )
  );

drop policy if exists "mesaj_insert_taraflar" on gorusme_mesajlari;
create policy "mesaj_insert_taraflar" on gorusme_mesajlari
  for insert with check (
    gonderen_id = auth.uid()
    and exists (
      select 1 from randevu_talepleri t
      where t.id = talep_id
        and t.durum = 'kabul'
        and t.gorusme_sekli = 'mesaj'
        and (
          t.muvekkil_id = auth.uid()
          or (t.avukat_id = auth.uid() and dogrulanmis_avukat_mi(auth.uid()))
        )
    )
  );

drop policy if exists "mesaj_admin_select" on gorusme_mesajlari;
create policy "mesaj_admin_select" on gorusme_mesajlari
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

-- Anlık (realtime) yayın
do $$
begin
  alter publication supabase_realtime add table gorusme_mesajlari;
exception when duplicate_object then null;
end $$;

-- 2) Müvekkil telefonu talep kaydına yazılmaz: avukat göremez, yönetici müvekkil profilinden okur.
update randevu_talepleri set muvekkil_telefon = null where muvekkil_telefon is not null;

create or replace function talep_telefon_temizle()
returns trigger as $$
begin
  new.muvekkil_telefon := null;
  return new;
end;
$$ language plpgsql;

drop trigger if exists talep_telefon_temizle_trigger on randevu_talepleri;
create trigger talep_telefon_temizle_trigger
before insert or update of muvekkil_telefon on randevu_talepleri
for each row execute function talep_telefon_temizle();

notify pgrst, 'reload schema';
