-- Yönetici (admin) paneli desteği
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

create table if not exists yoneticiler (
  id uuid references auth.users(id) on delete cascade primary key,
  ad_soyad text not null,
  email text not null,
  created_at timestamptz default now()
);

alter table yoneticiler enable row level security;

-- Bir kullanıcı yalnızca kendi yönetici kaydını görebilir
-- (admin paneli girişinde "bu hesap yönetici mi?" kontrolü için gerekli).
create policy "yoneticiler_select_own" on yoneticiler
  for select using (auth.uid() = id);

-- Avukatlar: yöneticiler tüm kayıtları görebilir, güncelleyebilir
-- (baro doğrulama vb.) ve kaldırabilir.
create policy "avukatlar_admin_select_all" on avukatlar
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

create policy "avukatlar_admin_update_all" on avukatlar
  for update using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

create policy "avukatlar_admin_delete_all" on avukatlar
  for delete using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

-- Müvekkiller: yöneticiler tüm kayıtları görebilir ve kaldırabilir.
create policy "muvekkiller_admin_select_all" on muvekkiller
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

create policy "muvekkiller_admin_delete_all" on muvekkiller
  for delete using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

-- Randevu talepleri: yöneticiler tüm talepleri görebilir, durumunu
-- güncelleyebilir ve kaldırabilir.
create policy "randevu_admin_select_all" on randevu_talepleri
  for select using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

create policy "randevu_admin_update_all" on randevu_talepleri
  for update using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

create policy "randevu_admin_delete_all" on randevu_talepleri
  for delete using (exists (select 1 from yoneticiler y where y.id = auth.uid()));

NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────────────────────
-- İLK YÖNETİCİYİ EKLEME
-- Bu dosyayı çalıştırdıktan sonra:
-- 1) Authentication > Users bölümünden kendi hesabını bul (yoksa oluştur)
--    ve UUID'sini kopyala. (Zaten avukat/müvekkil olarak kayıtlıysan
--    aynı hesabı admin de yapabilirsin, yeni hesap açmana gerek yok.)
-- 2) Aşağıdaki sorguyu kendi bilgilerinle doldurup ayrıca çalıştır:
--
-- insert into yoneticiler (id, ad_soyad, email)
-- values ('BURAYA-UUID-YAPISTIR', 'Ad Soyad', 'eposta@ornek.com');
-- ─────────────────────────────────────────────────────────────
