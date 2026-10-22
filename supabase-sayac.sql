-- Görüşme süresi artık sunucu saatiyle takip edilir.
-- gorusme_baslangic_zamani: iki taraf da odaya girdiğinde sunucunun kaydettiği an.
-- Sayfa yenilenince ya da çıkıp tekrar girilince süre sıfırlanmaz; süre dolunca
-- sunucu odaya yeniden girişi reddeder ve Daily.co odası kapanır.
-- Yalnızca sunucu (service role) yazar; avukat/müvekkil değiştiremez
-- (randevu_korumali_alanlar tetikleyicisi zaten korur).
alter table randevu_talepleri add column if not exists gorusme_baslangic_zamani timestamptz;

NOTIFY pgrst, 'reload schema';
