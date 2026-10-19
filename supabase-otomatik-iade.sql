-- Odenip kimse ustlenmeyen (bekliyor) talepler icin "iptal" durumu ekler.
-- Bu durum, otomatik zaman asimi iadesi (cron) ve muvekkilin kendi talebini
-- iptal edip anlik iade almasi (manuel) icin kullanilir.
alter table randevu_talepleri drop constraint if exists randevu_talepleri_durum_check;
alter table randevu_talepleri add constraint randevu_talepleri_durum_check
  check (durum in ('bekliyor', 'kabul', 'red', 'tamamlandi', 'iptal'));
