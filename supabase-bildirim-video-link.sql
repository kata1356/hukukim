-- Görüntülü randevu kabul edilince müvekkile direkt görüşme linki gönder
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.
-- (Mevcut randevu_bildirim_olustur fonksiyonunun yerine geçer.)

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
      if new.gorusme_sekli = 'goruntulu' then
        insert into bildirimler (kullanici_id, baslik, mesaj, link)
        values (new.muvekkil_id, 'Avukatınız hazır, hemen görüşmeye başlayabilirsiniz', new.konu, '/muvekkil/panel?video=' || new.id);
      else
        insert into bildirimler (kullanici_id, baslik, mesaj, link)
        values (new.muvekkil_id, 'Randevu talebin kabul edildi', new.konu, '/muvekkil/panel#taleplerim');
      end if;
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

NOTIFY pgrst, 'reload schema';
