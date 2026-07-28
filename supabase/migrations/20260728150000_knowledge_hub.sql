create extension if not exists pg_trgm;

create table if not exists public.dictionary_entries (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  phonetic text,
  definition text,
  vietnamese_definition text,
  payload jsonb not null default '{}'::jsonb,
  source text not null default 'dictionaryapi.dev',
  license text,
  fetched_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word text not null,
  phonetic text,
  definition text,
  source text,
  mastery integer not null default 0 check (mastery between 0 and 100),
  next_review_at timestamptz not null default now(),
  interval_days integer not null default 0,
  ease_factor numeric(4,2) not null default 2.50,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, word)
);

create table if not exists public.dictionary_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.grammar_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  cefr_level text not null,
  summary text,
  explanation_vi text,
  formula text,
  examples jsonb not null default '[]'::jsonb,
  common_errors jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dictionary_entries_word_trgm_idx on public.dictionary_entries using gin (word gin_trgm_ops);
create index if not exists user_vocabulary_review_idx on public.user_vocabulary(user_id, next_review_at);
create index if not exists dictionary_history_user_idx on public.dictionary_search_history(user_id, created_at desc);

alter table public.dictionary_entries enable row level security;
alter table public.user_vocabulary enable row level security;
alter table public.dictionary_search_history enable row level security;
alter table public.grammar_topics enable row level security;

create policy "dictionary_public_read" on public.dictionary_entries for select using (true);
create policy "admins_manage_dictionary" on public.dictionary_entries for all using (public.is_admin()) with check (public.is_admin());
create policy "users_manage_vocabulary" on public.user_vocabulary for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_manage_search_history" on public.dictionary_search_history for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "grammar_published_read" on public.grammar_topics for select using (status = 'published' or public.is_admin());
create policy "admins_manage_grammar" on public.grammar_topics for all using (public.is_admin()) with check (public.is_admin());
