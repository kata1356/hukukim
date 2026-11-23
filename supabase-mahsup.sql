-- Hakediş mahsup / düzeltme kayıtları.
-- İade, itiraz (chargeback) ya da hatalı ödeme sonrası avukatın bir sonraki hakedişinden düşülecek
-- tutarlar avukat_kazanclari tablosuna EKSİ tutarlı satır olarak yazılır; haftalık toplamda otomatik
-- düşer. Satırı yalnızca yöneticiler ekleyebilir; avukat kendi satırlarını okur (açıklamasıyla birlikte).
alter table avukat_kazanclari add column if not exists aciklama text;

drop policy if exists "kazanc_admin_insert" on avukat_kazanclari;
create policy "kazanc_admin_insert" on avukat_kazanclari
  for insert with check (exists (select 1 from yoneticiler where id = auth.uid()));

NOTIFY pgrst, 'reload schema';
