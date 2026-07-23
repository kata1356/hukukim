-- Düşük puanlı değerlendirmelerde yöneticilere bildirim
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

create or replace function dusuk_puan_bildirim_olustur()
returns trigger as $$
declare
  yonetici record;
begin
  if new.puan <= 2 then
    for yonetici in select id from yoneticiler loop
      insert into bildirimler (kullanici_id, baslik, mesaj, link)
      values (
        yonetici.id,
        'Düşük puanlı değerlendirme (' || new.puan || ' yıldız)',
        new.yorum,
        '/admin/degerlendirmeler'
      );
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists bildirim_dusuk_puan on degerlendirmeler;
create trigger bildirim_dusuk_puan
  after insert on degerlendirmeler
  for each row execute function dusuk_puan_bildirim_olustur();

NOTIFY pgrst, 'reload schema';
