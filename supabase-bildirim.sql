-- Uygulama içi bildirim sistemi
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

create table if not exists bildirimler (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid references auth.users(id) on delete cascade not null,
  baslik text not null,
  mesaj text,
  link text,
  okundu boolean not null default false,
  created_at timestamptz default now()
);

alter table bildirimler enable row level security;

-- Kullanıcı yalnızca kendi bildirimlerini okuyabilir ve
-- "okundu" durumunu güncelleyebilir. Ekleme işlemi yalnızca
-- aşağıdaki trigger üzerinden (security definer) yapılır.
create policy "bildirim_select_own" on bildirimler
  for select using (kullanici_id = auth.uid());

create policy "bildirim_update_own" on bildirimler
  for update using (kullanici_id = auth.uid());

-- Randevu talepleri üzerindeki değişikliklere göre otomatik bildirim
-- oluşturan fonksiyon.
create or replace function randevu_bildirim_olustur()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.avukat_id is not null then
      insert into bildirimler (kullanici_id, baslik, mesaj, link)
      values (new.avukat_id, 'Yeni randevu talebi', new.konu, '/avukat/panel#talepler');
    end if;
    return new;
  end if;

  if TG_OP = 'UPDATE' and old.durum is distinct from new.durum then
    if new.durum = 'kabul' then
      insert into bildirimler (kullanici_id, baslik, mesaj, link)
      values (new.muvekkil_id, 'Randevu talebin kabul edildi', new.konu, '/muvekkil/panel#taleplerim');
    elsif new.durum = 'red' then
      insert into bildirimler (kullanici_id, baslik, mesaj, link)
      values (new.muvekkil_id, 'Randevu talebin reddedildi', new.konu, '/muvekkil/panel#taleplerim');
    elsif new.durum = 'tamamlandi' then
      insert into bildirimler (kullanici_id, baslik, mesaj, link)
      values (new.muvekkil_id, 'Görüşmen tamamlandı', new.konu, '/muvekkil/panel#taleplerim');
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists bildirim_randevu_talepleri on randevu_talepleri;
create trigger bildirim_randevu_talepleri
  after insert or update on randevu_talepleri
  for each row execute function randevu_bildirim_olustur();

-- Realtime: müvekkil/avukat panelindeki bildirim zili, yeni bildirim
-- eklendiğinde sayfayı yenilemeden anlık güncellensin diye bu tabloyu
-- realtime yayınına ekliyoruz (bu SQL ikinci kez çalıştırılırsa hata
-- vermesin diye önce zaten ekli mi diye kontrol ediyoruz).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'bildirimler'
  ) then
    alter publication supabase_realtime add table bildirimler;
  end if;
end $$;

NOTIFY pgrst, 'reload schema';
