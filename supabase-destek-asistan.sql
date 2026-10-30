-- Destek asistanı: bot ve karşılama mesajı türleri + yanıtsız mesaj takibi (10 dakikada bir)

alter table destek_mesajlari drop constraint if exists destek_mesajlari_gonderen_check;
alter table destek_mesajlari add constraint destek_mesajlari_gonderen_check
  check (gonderen in ('kullanici', 'admin', 'asistan', 'sistem'));

do $$
declare
  eski_komut text;
begin
  select command into eski_komut from cron.job where command like '%bekleyen-talepleri-iptal-et%' limit 1;
  if eski_komut is not null then
    perform cron.unschedule(jobid) from cron.job where jobname = 'destek-takip';
    perform cron.schedule(
      'destek-takip',
      '*/10 * * * *',
      replace(eski_komut, 'bekleyen-talepleri-iptal-et', 'destek-takip')
    );
  else
    raise notice 'Mevcut cron işi bulunamadı; destek takibi zamanlanmadı.';
  end if;
end $$;

notify pgrst, 'reload schema';
