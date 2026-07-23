-- Randevu talepleri için gerçek zamanlı (realtime) güncelleme desteği
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

-- Avukat/müvekkil panelleri artık randevu_talepleri tablosundaki
-- değişiklikleri (yeni talep, kabul/red, tamamlandı) sayfa yenilenmeden
-- anlık olarak görebilsin diye bu tabloyu realtime yayınına ekliyoruz
-- (bu SQL ikinci kez çalıştırılırsa hata vermesin diye önce zaten ekli
-- mi diye kontrol ediyoruz).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'randevu_talepleri'
  ) then
    alter publication supabase_realtime add table randevu_talepleri;
  end if;
end $$;

NOTIFY pgrst, 'reload schema';
