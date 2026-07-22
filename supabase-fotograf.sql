-- Avukat profil fotoğrafı desteği

alter table avukatlar add column if not exists profil_fotografi_url text;

insert into storage.buckets (id, name, public)
values ('avukat-fotograflari', 'avukat-fotograflari', true)
on conflict (id) do nothing;

drop policy if exists "avukat_foto_herkese_acik" on storage.objects;
create policy "avukat_foto_herkese_acik" on storage.objects
  for select using (bucket_id = 'avukat-fotograflari');

drop policy if exists "avukat_foto_yukle" on storage.objects;
create policy "avukat_foto_yukle" on storage.objects
  for insert with check (
    bucket_id = 'avukat-fotograflari'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avukat_foto_guncelle" on storage.objects;
create policy "avukat_foto_guncelle" on storage.objects
  for update using (
    bucket_id = 'avukat-fotograflari'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

NOTIFY pgrst, 'reload schema';
