alter table public.lesson_activities drop constraint if exists lesson_activities_activity_type_check;
alter table public.lesson_activities add constraint lesson_activities_activity_type_check check (activity_type in (
  'vocabulary','grammar','listening','pronunciation','speaking','roleplay','quiz',
  'multiple_choice','multiple_select','fill_blank','ordering','matching','dictation',
  'image_choice','video_checkpoint','short_answer','essay','reading'
));

create table if not exists public.placement_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_type text not null default 'quick',
  score integer not null check (score between 0 and 100),
  recommended_level text not null check (recommended_level in ('A0','A1','A2','B1','B2','C1','C2')),
  skill_scores jsonb not null default '{}'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.placement_attempts enable row level security;
create policy "users_read_placement_attempts" on public.placement_attempts for select using (user_id = auth.uid());
create policy "users_insert_placement_attempts" on public.placement_attempts for insert with check (user_id = auth.uid());
create index if not exists placement_attempts_user_created_idx on public.placement_attempts(user_id, created_at desc);

create or replace function public.submit_placement_result(
  p_score integer, p_assessment_type text default 'quick',
  p_skill_scores jsonb default '{}'::jsonb, p_answers jsonb default '[]'::jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare target_level text; target_course_slug text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_score < 0 or p_score > 100 then raise exception 'Score out of range'; end if;
  target_level := case when p_score < 25 then 'A0' when p_score < 45 then 'A1'
    when p_score < 60 then 'A2' when p_score < 75 then 'B1'
    when p_score < 90 then 'B2' else 'C1' end;
  insert into public.placement_attempts(user_id,assessment_type,score,recommended_level,skill_scores,answers)
  values(auth.uid(),left(coalesce(p_assessment_type,'quick'),60),p_score,target_level,p_skill_scores,p_answers);
  update public.profiles set cefr_level=target_level,updated_at=now() where id=auth.uid();
  select slug into target_course_slug from public.courses where status='published' and cefr_level=target_level order by sort_order limit 1;
  return jsonb_build_object('score',p_score,'recommendedLevel',target_level,'courseSlug',target_course_slug);
end; $$;
grant execute on function public.submit_placement_result(integer,text,jsonb,jsonb) to authenticated;

create or replace view public.user_unit_progress with (security_invoker=true) as
select p.id user_id,u.id unit_id,u.course_id,count(l.id) lesson_count,
  count(l.id) filter(where lp.status='completed') completed_lessons,
  coalesce(round(avg(coalesce(lp.percent_complete,0))),0)::integer percent_complete
from public.profiles p cross join public.units u
join public.lessons l on l.unit_id=u.id and l.status='published'
left join public.lesson_progress lp on lp.lesson_id=l.id and lp.user_id=p.id
where p.id=auth.uid() group by p.id,u.id,u.course_id;

create or replace view public.user_course_progress with (security_invoker=true) as
select user_id,course_id,sum(lesson_count)::integer lesson_count,
  sum(completed_lessons)::integer completed_lessons,
  coalesce(round(sum(percent_complete*lesson_count)::numeric/nullif(sum(lesson_count),0)),0)::integer percent_complete
from public.user_unit_progress group by user_id,course_id;
grant select on public.user_unit_progress,public.user_course_progress to authenticated;
