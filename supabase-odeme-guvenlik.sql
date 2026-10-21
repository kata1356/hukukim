-- Ödeme güvenliği:
--   * Müvekkil talebi yalnızca sunucu üzerinden (ödeme akışıyla) oluşturabilir;
--     tarayıcıdan doğrudan "ödendi" talep eklenemez.
--   * Avukat ödenmemiş talepleri göremez ve üstlenemez.
--   * Avukat, talepte yalnızca üstlenme/kabul/red yapabilir; ödeme tutarı,
--     süre, müvekkil vb. alanları değiştiremez (kazancı şişiremez).
-- Sunucu (service role) ve yöneticiler bu kısıttan muaftır.

-- 0) Aynı numaralı iki test avukatından yenisinin telefonunu boşalt (tekil kısıt için).
update avukatlar set telefon = null where id = '043bc413-26de-41eb-9686-9d583721de86';

-- 1) Müvekkil doğrudan talep ekleyemesin (sunucu service role ile ekler).
drop policy if exists "randevu_insert_muvekkil" on randevu_talepleri;

-- 2) Açık havuz ve üstlenme: yalnızca ödenmiş (veya muaf) talepler.
drop policy if exists "randevu_select_acik_havuz" on randevu_talepleri;
create policy "randevu_select_acik_havuz" on randevu_talepleri
  for select using (
    tur = 'genel'
    and avukat_id is null
    and odeme_durumu in ('odendi', 'muaf')
    and dogrulanmis_avukat_mi(auth.uid())
  );

drop policy if exists "randevu_claim_avukat" on randevu_talepleri;
create policy "randevu_claim_avukat" on randevu_talepleri
  for update using (
    dogrulanmis_avukat_mi(auth.uid())
    and (
      auth.uid() = avukat_id
      or (avukat_id is null and tur = 'genel' and odeme_durumu in ('odendi', 'muaf'))
    )
  )
  with check (auth.uid() = avukat_id);

-- 3) Avukat yalnızca durum/avukat_id değiştirebilir.
create or replace function randevu_korumali_alanlar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (auth.uid() boş) ve yöneticiler serbest.
  if auth.uid() is null or exists (select 1 from yoneticiler y where y.id = auth.uid()) then
    return new;
  end if;

  if (to_jsonb(new) - 'durum' - 'avukat_id' - 'updated_at')
     is distinct from (to_jsonb(old) - 'durum' - 'avukat_id' - 'updated_at') then
    raise exception 'Bu alanlar değiştirilemez.';
  end if;

  if new.avukat_id is distinct from old.avukat_id
     and not (old.avukat_id is null and new.avukat_id = auth.uid()) then
    raise exception 'Talep başka bir avukata atanamaz.';
  end if;

  if new.durum is distinct from old.durum
     and not (old.durum = 'bekliyor' and new.durum in ('kabul', 'red')) then
    raise exception 'Bu durum değişikliğine izin yok.';
  end if;

  return new;
end;
$$;

drop trigger if exists randevu_korumali_alanlar_trigger on randevu_talepleri;
create trigger randevu_korumali_alanlar_trigger
  before update on randevu_talepleri
  for each row execute function randevu_korumali_alanlar();

-- 4) İade edilen ödemeler yönetici panelinde ayrı görünsün.
alter table odemeler drop constraint if exists odemeler_durum_check;
alter table odemeler
  add constraint odemeler_durum_check
  check (durum in ('basladi', 'basarili', 'basarisiz', 'iade_edildi'));

-- 5) Bir telefon numarası yalnızca bir hesapta kullanılabilir.
-- (Aynı numaralı kayıtlar zaten varsa bu iki satır hata verir; önce mükerrerleri düzelt.)
create unique index if not exists muvekkiller_telefon_tekil on muvekkiller (telefon) where telefon is not null and telefon <> '';
create unique index if not exists avukatlar_telefon_tekil on avukatlar (telefon) where telefon is not null and telefon <> '';

-- 6) Ücretsiz deneme hakkı numaraya bağlıdır: hesap silinip aynı numarayla yeniden
-- açılsa bile tekrar verilmez. Yalnızca sunucu (service role) erişir.
create table if not exists deneme_kullanimlari (
  telefon text primary key,
  muvekkil_id uuid,
  created_at timestamptz not null default now()
);
alter table deneme_kullanimlari enable row level security;

NOTIFY pgrst, 'reload schema';
