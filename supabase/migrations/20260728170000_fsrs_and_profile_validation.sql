alter table public.user_vocabulary add column if not exists fsrs_card jsonb;
alter table public.user_vocabulary add column if not exists last_rating smallint check (last_rating between 1 and 4);
alter table public.user_vocabulary add column if not exists last_reviewed_at timestamptz;

alter table public.profiles drop constraint if exists profiles_display_name_length;
alter table public.profiles add constraint profiles_display_name_length
  check (display_name is null or char_length(btrim(display_name)) between 2 and 50);
alter table public.profiles drop constraint if exists profiles_learning_goal_length;
alter table public.profiles add constraint profiles_learning_goal_length
  check (learning_goal is null or char_length(learning_goal) <= 300);
alter table public.profiles drop constraint if exists profiles_occupation_length;
alter table public.profiles add constraint profiles_occupation_length
  check (occupation is null or char_length(occupation) <= 60);
