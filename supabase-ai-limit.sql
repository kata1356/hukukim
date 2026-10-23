-- Yapay zeka (Anthropic) çağrıları için kullanıcı başına hız sınırı kaydı.
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.
-- Tabloya yalnızca sunucu (service role) erişir; RLS açık ve politika yok.

create table if not exists ai_cagrilari (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  uc text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_cagrilari_user_zaman_idx on ai_cagrilari (user_id, created_at desc);

alter table ai_cagrilari enable row level security;

NOTIFY pgrst, 'reload schema';
