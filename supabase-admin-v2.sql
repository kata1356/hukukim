-- Denetim kaydı (audit log) + otomatik loglama
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.
-- (supabase-admin.sql'in üzerine ekleme yapar, onu değiştirmez.)

create table if not exists denetim_kayitlari (
  id uuid primary key default gen_random_uuid(),
  yonetici_id uuid,
  yonetici_adi text not null,
  islem text not null check (islem in ('ekle', 'guncelle', 'sil')),
  hedef_tablo text not null,
  hedef_id uuid,
  onceki_veri jsonb,
  yeni_veri jsonb,
  created_at timestamptz default now()
);

alter table denetim_kayitlari enable row level security;

-- Sadece yöneticiler denetim kayıtlarını görebilir. Kayıtlar yalnızca
-- trigger üzerinden (security definer) eklenir; update/delete politikası
-- kasıtlı olarak yok, yani kayıtlar hiçbir zaman değiştirilemez/silinemez.
create policy "denetim_admin_select_all" on denetim_kayitlari
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

-- Genel amaçlı denetim fonksiyonu: bir yönetici avukatlar, muvekkiller,
-- randevu_talepleri veya yoneticiler tablosunda değişiklik yaptığında
-- otomatik olarak denetim_kayitlari'na satır ekler. Yönetici olmayan
-- kullanıcıların kendi işlemleri (ör. profil fotoğrafı güncelleme,
-- kayıt olma) loglanmaz.
create or replace function admin_denetim_kaydet()
returns trigger as $$
declare
  admin_id uuid := auth.uid();
  admin_adi text;
begin
  if admin_id is null or not exists (select 1 from yoneticiler y where y.id = admin_id) then
    if TG_OP = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  select ad_soyad into admin_adi from yoneticiler where id = admin_id;

  if TG_OP = 'DELETE' then
    insert into denetim_kayitlari (yonetici_id, yonetici_adi, islem, hedef_tablo, hedef_id, onceki_veri)
    values (admin_id, coalesce(admin_adi, 'Bilinmiyor'), 'sil', TG_TABLE_NAME, old.id, to_jsonb(old));
    return old;
  elsif TG_OP = 'UPDATE' then
    insert into denetim_kayitlari (yonetici_id, yonetici_adi, islem, hedef_tablo, hedef_id, onceki_veri, yeni_veri)
    values (admin_id, coalesce(admin_adi, 'Bilinmiyor'), 'guncelle', TG_TABLE_NAME, new.id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif TG_OP = 'INSERT' then
    insert into denetim_kayitlari (yonetici_id, yonetici_adi, islem, hedef_tablo, hedef_id, yeni_veri)
    values (admin_id, coalesce(admin_adi, 'Bilinmiyor'), 'ekle', TG_TABLE_NAME, new.id, to_jsonb(new));
    return new;
  end if;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists denetim_avukatlar on avukatlar;
create trigger denetim_avukatlar
  after update or delete on avukatlar
  for each row execute function admin_denetim_kaydet();

drop trigger if exists denetim_muvekkiller on muvekkiller;
create trigger denetim_muvekkiller
  after update or delete on muvekkiller
  for each row execute function admin_denetim_kaydet();

drop trigger if exists denetim_randevu_talepleri on randevu_talepleri;
create trigger denetim_randevu_talepleri
  after update or delete on randevu_talepleri
  for each row execute function admin_denetim_kaydet();

drop trigger if exists denetim_yoneticiler on yoneticiler;
create trigger denetim_yoneticiler
  after insert or delete on yoneticiler
  for each row execute function admin_denetim_kaydet();

NOTIFY pgrst, 'reload schema';
