-- Avukat doğrulama (manuel onay) desteği

alter table avukatlar add column if not exists dogrulanmis boolean not null default false;

-- Avukatların kendi "dogrulanmis" alanını değiştirmesini engeller.
-- Sadece Supabase panelinden (SQL Editor / Table Editor, service_role bağlamı) yapılan
-- güncellemeler etkili olur; auth.uid() dolu olan (kullanıcı oturumu üzerinden gelen)
-- güncellemelerde bu alan olduğu gibi korunur.
create or replace function avukat_dogrulanmis_koru()
returns trigger as $$
begin
  if auth.uid() = old.id then
    new.dogrulanmis := old.dogrulanmis;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists avukat_dogrulanmis_koru_trigger on avukatlar;

create trigger avukat_dogrulanmis_koru_trigger
before update on avukatlar
for each row execute function avukat_dogrulanmis_koru();

NOTIFY pgrst, 'reload schema';
