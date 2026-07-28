create extension if not exists pgcrypto;

create type public.app_role as enum ('learner', 'teacher', 'content_editor', 'reviewer', 'support', 'admin');
create type public.content_status as enum ('draft', 'review', 'approved', 'published', 'archived');
create type public.progress_status as enum ('not_started', 'in_progress', 'completed');
create type public.recording_status as enum ('pending', 'uploaded', 'processing', 'completed', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role public.app_role not null default 'learner',
  cefr_level text not null default 'A0' check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  occupation text,
  daily_goal_minutes integer not null default 15 check (daily_goal_minutes between 5 and 180),
  learning_goal text,
  preferred_accent text not null default 'american' check (preferred_accent in ('american','british')),
  reminder_time time,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cefr_level text not null check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  status public.content_status not null default 'draft',
  cover_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  estimated_minutes integer not null default 15,
  xp_reward integer not null default 20,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(unit_id, slug)
);

create table public.lesson_activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  activity_type text not null check (activity_type in ('vocabulary','grammar','listening','pronunciation','speaking','roleplay','quiz')),
  title text not null,
  instructions text,
  content jsonb not null default '{}'::jsonb,
  is_required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  percent_complete integer not null default 0 check (percent_complete between 0 and 100),
  score numeric(5,2),
  attempts integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_date date not null default current_date,
  target_minutes integer not null default 15,
  completed_minutes integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  unique(user_id, plan_date)
);

create table public.streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_learning_date date,
  updated_at timestamptz not null default now()
);

create table public.audio_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  activity_id uuid references public.lesson_activities(id) on delete set null,
  storage_path text not null unique,
  mime_type text not null,
  duration_ms integer,
  reference_text text,
  status public.recording_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.speaking_assessments (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null unique references public.audio_recordings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'azure',
  pronunciation_score numeric(5,2),
  fluency_score numeric(5,2),
  completeness_score numeric(5,2),
  prosody_score numeric(5,2),
  grammar_score numeric(5,2),
  vocabulary_score numeric(5,2),
  overall_score numeric(5,2),
  transcript text,
  word_results jsonb not null default '[]'::jsonb,
  feedback jsonb not null default '{}'::jsonb,
  confidence numeric(5,4),
  created_at timestamptz not null default now()
);

create index lessons_unit_sort_idx on public.lessons(unit_id, sort_order);
create index activities_lesson_sort_idx on public.lesson_activities(lesson_id, sort_order);
create index progress_user_updated_idx on public.lesson_progress(user_id, updated_at desc);
create index recordings_user_created_idx on public.audio_recordings(user_id, created_at desc);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_activities enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.daily_plans enable row level security;
alter table public.streaks enable row level security;
alter table public.audio_recordings enable row level security;
alter table public.speaking_assessments enable row level security;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "published_courses_read" on public.courses for select using (status = 'published' or public.is_admin());
create policy "published_units_read" on public.units for select using (
  exists(select 1 from public.courses c where c.id = course_id and (c.status = 'published' or public.is_admin()))
);
create policy "published_lessons_read" on public.lessons for select using (status = 'published' or public.is_admin());
create policy "published_activities_read" on public.lesson_activities for select using (
  exists(select 1 from public.lessons l where l.id = lesson_id and (l.status = 'published' or public.is_admin()))
);
create policy "admins_manage_courses" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "admins_manage_units" on public.units for all using (public.is_admin()) with check (public.is_admin());
create policy "admins_manage_lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "admins_manage_activities" on public.lesson_activities for all using (public.is_admin()) with check (public.is_admin());
create policy "users_manage_enrollments" on public.enrollments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_manage_progress" on public.lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_manage_daily_plans" on public.daily_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_read_streak" on public.streaks for select using (user_id = auth.uid());
create policy "users_update_streak" on public.streaks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_manage_recordings" on public.audio_recordings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_read_assessments" on public.speaking_assessments for select using (user_id = auth.uid());

create or replace function public.save_speaking_assessment(
  p_recording_id uuid,
  p_transcript text,
  p_pronunciation_score numeric,
  p_fluency_score numeric,
  p_completeness_score numeric,
  p_prosody_score numeric,
  p_word_results jsonb,
  p_feedback jsonb
) returns public.speaking_assessments
language plpgsql security definer set search_path = public
as $$
declare saved public.speaking_assessments;
begin
  if not exists (
    select 1 from public.audio_recordings
    where id = p_recording_id and user_id = auth.uid()
  ) then
    raise exception 'Recording not found';
  end if;

  insert into public.speaking_assessments (
    recording_id, user_id, transcript, pronunciation_score, fluency_score,
    completeness_score, prosody_score, overall_score, word_results, feedback
  ) values (
    p_recording_id, auth.uid(), p_transcript, p_pronunciation_score, p_fluency_score,
    p_completeness_score, p_prosody_score, p_pronunciation_score, p_word_results, p_feedback
  )
  on conflict (recording_id) do update set
    transcript = excluded.transcript,
    pronunciation_score = excluded.pronunciation_score,
    fluency_score = excluded.fluency_score,
    completeness_score = excluded.completeness_score,
    prosody_score = excluded.prosody_score,
    overall_score = excluded.overall_score,
    word_results = excluded.word_results,
    feedback = excluded.feedback
  returning * into saved;

  update public.audio_recordings set status = 'completed' where id = p_recording_id;
  return saved;
end;
$$;

grant execute on function public.save_speaking_assessment(uuid,text,numeric,numeric,numeric,numeric,jsonb,jsonb) to authenticated;

create or replace function public.complete_lesson(p_lesson_id uuid, p_minutes integer default 15)
returns void language plpgsql security definer set search_path = public
as $$
declare previous_date date;
begin
  insert into public.lesson_progress (
    user_id, lesson_id, status, percent_complete, attempts, started_at, completed_at
  ) values (
    auth.uid(), p_lesson_id, 'completed', 100, 1, now(), now()
  )
  on conflict (user_id, lesson_id) do update set
    status = 'completed', percent_complete = 100,
    attempts = public.lesson_progress.attempts + 1,
    completed_at = now(), updated_at = now();

  insert into public.daily_plans (user_id, plan_date, completed_minutes, completed)
  values (auth.uid(), current_date, greatest(1, p_minutes), false)
  on conflict (user_id, plan_date) do update set
    completed_minutes = public.daily_plans.completed_minutes + greatest(1, p_minutes),
    completed = public.daily_plans.completed_minutes + greatest(1, p_minutes) >= public.daily_plans.target_minutes;

  select last_learning_date into previous_date from public.streaks where user_id = auth.uid();
  update public.streaks set
    current_streak = case
      when previous_date = current_date then current_streak
      when previous_date = current_date - 1 then current_streak + 1
      else 1
    end,
    longest_streak = greatest(longest_streak, case
      when previous_date = current_date then current_streak
      when previous_date = current_date - 1 then current_streak + 1
      else 1
    end),
    last_learning_date = current_date,
    updated_at = now()
  where user_id = auth.uid();
end;
$$;

grant execute on function public.complete_lesson(uuid,integer) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaking-recordings', 'speaking-recordings', false, 15728640, array['audio/webm','audio/mp4','audio/mpeg','audio/wav','audio/x-m4a'])
on conflict (id) do nothing;

create policy "users_upload_own_recordings" on storage.objects for insert to authenticated
with check (bucket_id = 'speaking-recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users_read_own_recordings" on storage.objects for select to authenticated
using (bucket_id = 'speaking-recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users_delete_own_recordings" on storage.objects for delete to authenticated
using (bucket_id = 'speaking-recordings' and (storage.foldername(name))[1] = auth.uid()::text);

do $$
declare
  course_uuid uuid := gen_random_uuid();
  unit_uuid uuid := gen_random_uuid();
  lesson_one uuid := gen_random_uuid();
  lesson_two uuid := gen_random_uuid();
begin
  insert into public.courses (id, slug, title, description, cefr_level, status, sort_order)
  values (course_uuid, 'giao-tiep-a1', 'Tiếng Anh giao tiếp A1', 'Xây nền phản xạ giao tiếp qua các tình huống hằng ngày.', 'A1', 'published', 1);
  insert into public.units (id, course_id, title, description, sort_order)
  values (unit_uuid, course_uuid, 'Làm quen và giới thiệu bản thân', 'Chào hỏi, giới thiệu và duy trì một cuộc trò chuyện ngắn.', 1);
  insert into public.lessons (id, unit_id, slug, title, description, estimated_minutes, status, sort_order)
  values
    (lesson_one, unit_uuid, 'chao-hoi-tu-nhien', 'Chào hỏi tự nhiên', 'Chọn lời chào phù hợp với từng thời điểm.', 10, 'published', 1),
    (lesson_two, unit_uuid, 'gioi-thieu-ban-than', 'Giới thiệu bản thân', 'Nói về tên, công việc và sở thích.', 15, 'published', 2);
  insert into public.lesson_activities (lesson_id, activity_type, title, instructions, content, sort_order)
  values
    (lesson_one, 'vocabulary', 'Lời chào hằng ngày', 'Nghe và chọn lời chào phù hợp.', '{"words":["Hello","Good morning","Nice to meet you"]}', 1),
    (lesson_two, 'speaking', 'Tell me about yourself', 'Giới thiệu tên, công việc và một sở thích.', '{"referenceText":"My name is Minh. I work as a designer. In my free time, I enjoy reading."}', 1),
    (lesson_two, 'roleplay', 'Gặp đồng nghiệp mới', 'Trò chuyện cùng Maya trong ba lượt.', '{"persona":"friendly coworker","turns":3}', 2);
end $$;
