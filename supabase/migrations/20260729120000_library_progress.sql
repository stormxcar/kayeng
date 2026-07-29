create table if not exists public.library_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_key text not null check (content_key ~ '^(video|podcast|story|dialogue)/[a-z0-9-]+$'),
  created_at timestamptz not null default now(),
  primary key (user_id, content_key)
);

create table if not exists public.library_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_key text not null check (content_key ~ '^(video|podcast|story|dialogue)/[a-z0-9-]+$'),
  completed boolean not null default false,
  score integer check (score between 0 and 100),
  playback_seconds integer not null default 0 check (playback_seconds >= 0),
  last_opened_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, content_key)
);

alter table public.library_bookmarks enable row level security;
alter table public.library_progress enable row level security;

create policy "Users manage their library bookmarks"
on public.library_bookmarks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage their library progress"
on public.library_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists library_progress_user_opened_idx
on public.library_progress (user_id, last_opened_at desc);
