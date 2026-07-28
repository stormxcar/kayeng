create table public.activity_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid not null references public.lesson_activities(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  score numeric(5,2),
  attempts integer not null default 0,
  answer jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);

create table public.activity_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid not null references public.lesson_activities(id) on delete cascade,
  answer jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  is_correct boolean,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create table public.conversation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid references public.lesson_activities(id) on delete set null,
  scenario text not null,
  persona text not null default 'friendly teacher',
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  turn_count integer not null default 0,
  feedback jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.conversation_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.conversation_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  speaker text not null check (speaker in ('learner','ai')),
  content text not null,
  created_at timestamptz not null default now()
);

create index activity_progress_user_updated_idx on public.activity_progress(user_id, updated_at desc);
create index activity_attempts_user_created_idx on public.activity_attempts(user_id, created_at desc);
create index conversation_sessions_user_started_idx on public.conversation_sessions(user_id, started_at desc);
create index conversation_turns_session_created_idx on public.conversation_turns(session_id, created_at);

alter table public.activity_progress enable row level security;
alter table public.activity_attempts enable row level security;
alter table public.conversation_sessions enable row level security;
alter table public.conversation_turns enable row level security;

create policy "users_manage_activity_progress" on public.activity_progress
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_manage_activity_attempts" on public.activity_attempts
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_manage_conversation_sessions" on public.conversation_sessions
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users_manage_conversation_turns" on public.conversation_turns
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.submit_activity(
  p_activity_id uuid,
  p_answer jsonb default '{}'::jsonb,
  p_score numeric default 100,
  p_is_correct boolean default true,
  p_duration_ms integer default null
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  target_lesson_id uuid;
  required_count integer;
  completed_count integer;
  completion_percent integer;
  lesson_completed boolean;
  lesson_minutes integer;
begin
  select lesson_id into target_lesson_id
  from public.lesson_activities
  where id = p_activity_id;

  if target_lesson_id is null then
    raise exception 'Activity not found';
  end if;

  insert into public.activity_attempts (user_id, activity_id, answer, score, is_correct, duration_ms)
  values (auth.uid(), p_activity_id, p_answer, p_score, p_is_correct, p_duration_ms);

  insert into public.activity_progress (
    user_id, activity_id, status, score, attempts, answer, started_at, completed_at
  ) values (
    auth.uid(), p_activity_id,
    case when p_score >= 60 then 'completed'::public.progress_status else 'in_progress'::public.progress_status end,
    p_score, 1, p_answer, now(),
    case when p_score >= 60 then now() else null end
  )
  on conflict (user_id, activity_id) do update set
    status = case when p_score >= 60 then 'completed'::public.progress_status else 'in_progress'::public.progress_status end,
    score = greatest(coalesce(public.activity_progress.score, 0), p_score),
    attempts = public.activity_progress.attempts + 1,
    answer = p_answer,
    started_at = coalesce(public.activity_progress.started_at, now()),
    completed_at = case when p_score >= 60 then coalesce(public.activity_progress.completed_at, now()) else public.activity_progress.completed_at end,
    updated_at = now();

  select count(*) into required_count
  from public.lesson_activities
  where lesson_id = target_lesson_id and is_required;

  select count(*) into completed_count
  from public.lesson_activities la
  join public.activity_progress ap on ap.activity_id = la.id
  where la.lesson_id = target_lesson_id
    and la.is_required
    and ap.user_id = auth.uid()
    and ap.status = 'completed';

  completion_percent := case
    when required_count = 0 then 100
    else floor((completed_count::numeric / required_count::numeric) * 100)::integer
  end;
  lesson_completed := completion_percent >= 80;

  insert into public.lesson_progress (
    user_id, lesson_id, status, percent_complete, attempts, started_at, completed_at
  ) values (
    auth.uid(), target_lesson_id,
    case when lesson_completed then 'completed'::public.progress_status else 'in_progress'::public.progress_status end,
    completion_percent, 1, now(),
    case when lesson_completed then now() else null end
  )
  on conflict (user_id, lesson_id) do update set
    status = case when lesson_completed then 'completed'::public.progress_status else 'in_progress'::public.progress_status end,
    percent_complete = completion_percent,
    attempts = public.lesson_progress.attempts + 1,
    started_at = coalesce(public.lesson_progress.started_at, now()),
    completed_at = case when lesson_completed then coalesce(public.lesson_progress.completed_at, now()) else null end,
    updated_at = now();

  if lesson_completed then
    select estimated_minutes into lesson_minutes from public.lessons where id = target_lesson_id;
    insert into public.daily_plans (user_id, plan_date, completed_minutes, completed)
    values (auth.uid(), current_date, greatest(1, lesson_minutes), false)
    on conflict (user_id, plan_date) do update set
      completed_minutes = greatest(public.daily_plans.completed_minutes, greatest(1, lesson_minutes)),
      completed = greatest(public.daily_plans.completed_minutes, greatest(1, lesson_minutes)) >= public.daily_plans.target_minutes;

    update public.streaks set
      current_streak = case
        when last_learning_date = current_date then current_streak
        when last_learning_date = current_date - 1 then current_streak + 1
        else 1
      end,
      longest_streak = greatest(longest_streak, case
        when last_learning_date = current_date then current_streak
        when last_learning_date = current_date - 1 then current_streak + 1
        else 1
      end),
      last_learning_date = current_date,
      updated_at = now()
    where user_id = auth.uid();
  end if;

  return jsonb_build_object(
    'lessonId', target_lesson_id,
    'activityCompleted', p_score >= 60,
    'completedActivities', completed_count,
    'requiredActivities', required_count,
    'percentComplete', completion_percent,
    'lessonCompleted', lesson_completed
  );
end;
$$;

grant execute on function public.submit_activity(uuid,jsonb,numeric,boolean,integer) to authenticated;

drop function if exists public.complete_lesson(uuid, integer);

