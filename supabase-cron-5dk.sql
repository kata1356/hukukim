-- Bekleyen talepleri 5 dakikada bir iptal ettiren zamanlanmış görev (Supabase pg_cron).
-- Vercel Hobby planında cron günde en fazla 1 kez çalışabildiği için, 15 dakika içinde
-- avukat tarafından üstlenilmeyen talepleri (ve ücretli olanların iadesini) zamanında
-- işlemek için /api/cron/bekleyen-talepleri-iptal-et rotasını Supabase üzerinden çağırır.
--
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştırmadan ÖNCE:
--   1) Aşağıdaki BURAYA_CRON_SECRET yazısını, Vercel'deki CRON_SECRET değişkeninin
--      değeriyle değiştir. (Bu dosyayı gizli değerle birlikte repoya KAYDETME.)
--   2) Database > Extensions bölümünden pg_cron ve pg_net uzantılarının açık olduğundan emin ol.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Gizli anahtarı düz metin olarak cron.job tablosuna yazmamak için Vault'ta saklarız.
-- Aynı isimle ikinci kez oluşturulamadığı için varsa eskisi önce silinir (dosya tekrar çalıştırılabilir).
delete from vault.secrets where name = 'hukukim_cron_secret';
select vault.create_secret('BURAYA_CRON_SECRET', 'hukukim_cron_secret');

-- Varsa eski kaydı kaldırıp yeniden oluştur (dosya birden fazla çalıştırılabilsin).
select cron.unschedule('hukukim-bekleyen-talepleri-iptal-et')
where exists (select 1 from cron.job where jobname = 'hukukim-bekleyen-talepleri-iptal-et');

select cron.schedule(
  'hukukim-bekleyen-talepleri-iptal-et',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://hukukim.com/api/cron/bekleyen-talepleri-iptal-et',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'hukukim_cron_secret')
    ),
    timeout_milliseconds := 20000
  );
  $$
);

-- Kontrol: görev kayıtlı mı ve son çalışmalar başarılı mı?
--   select jobid, jobname, schedule, active from cron.job where jobname = 'hukukim-bekleyen-talepleri-iptal-et';
--   select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;
--   select status_code, content from net._http_response order by created desc limit 5;  -- 200 beklenir, 401 ise secret yanlış
