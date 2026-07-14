-- Genel talep (açık havuz) desteği için şema güncellemesi

alter table randevu_talepleri alter column avukat_id drop not null;

alter table randevu_talepleri add column if not exists tur text not null default 'direkt';
alter table randevu_talepleri add column if not exists hedef_sehir text;
alter table randevu_talepleri add column if not exists hedef_uzmanlik_alani text;

alter table randevu_talepleri
  add constraint randevu_tur_check check (tur in ('direkt', 'genel'));

alter table randevu_talepleri
  add constraint randevu_tur_avukat_check check (
    (tur = 'direkt' and avukat_id is not null)
    or
    (tur = 'genel' and hedef_sehir is not null and hedef_uzmanlik_alani is not null)
  );

drop policy if exists "randevu_update_avukat" on randevu_talepleri;

create policy "randevu_select_acik_havuz" on randevu_talepleri
  for select using (
    tur = 'genel'
    and avukat_id is null
    and exists (select 1 from avukatlar a where a.id = auth.uid())
  );

create policy "randevu_claim_avukat" on randevu_talepleri
  for update using (
    auth.uid() = avukat_id
    or (
      avukat_id is null
      and tur = 'genel'
      and exists (select 1 from avukatlar a where a.id = auth.uid())
    )
  )
  with check (auth.uid() = avukat_id);

NOTIFY pgrst, 'reload schema';
