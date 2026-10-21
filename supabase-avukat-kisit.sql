-- Doğrulanmamış avukat kısıtı:
-- Kimlik/baro kartı onaylanana kadar (dogrulanmis = false) avukat
--   * açık havuzdaki talepleri göremez ve üstlenemez,
--   * kendisine atanmış talepleri göremez/güncelleyemez,
--   * müvekkillerin gördüğü avukat listesinde yer almaz,
--   * müvekkil tarafından doğrudan randevu talebi alamaz.
-- Bu kurallar veritabanında uygulanır; arayüzü atlatmak işe yaramaz.

create or replace function dogrulanmis_avukat_mi(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from avukatlar a where a.id = uid and a.dogrulanmis = true);
$$;

-- Avukat listesi: yalnızca doğrulanmışlar (kendi kaydı ve yöneticiler hariç).
drop policy if exists "avukatlar_select_all" on avukatlar;
drop policy if exists "avukatlar_select_dogrulanmis" on avukatlar;
create policy "avukatlar_select_dogrulanmis" on avukatlar
  for select using (dogrulanmis = true or auth.uid() = id);

-- Avukata atanmış talepler
drop policy if exists "randevu_select_avukat" on randevu_talepleri;
create policy "randevu_select_avukat" on randevu_talepleri
  for select using (auth.uid() = avukat_id and dogrulanmis_avukat_mi(auth.uid()));

-- Açık havuz
drop policy if exists "randevu_select_acik_havuz" on randevu_talepleri;
create policy "randevu_select_acik_havuz" on randevu_talepleri
  for select using (
    tur = 'genel'
    and avukat_id is null
    and dogrulanmis_avukat_mi(auth.uid())
  );

-- Talep üstlenme / güncelleme
drop policy if exists "randevu_claim_avukat" on randevu_talepleri;
create policy "randevu_claim_avukat" on randevu_talepleri
  for update using (
    dogrulanmis_avukat_mi(auth.uid())
    and (
      auth.uid() = avukat_id
      or (avukat_id is null and tur = 'genel')
    )
  )
  with check (auth.uid() = avukat_id);

-- Müvekkil, doğrulanmamış bir avukata doğrudan talep gönderemez.
drop policy if exists "randevu_insert_muvekkil" on randevu_talepleri;
create policy "randevu_insert_muvekkil" on randevu_talepleri
  for insert with check (
    auth.uid() = muvekkil_id
    and (avukat_id is null or dogrulanmis_avukat_mi(avukat_id))
  );

NOTIFY pgrst, 'reload schema';
