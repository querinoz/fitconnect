-- 003_athletes.sql
create table public.athlete_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  coach_id uuid references public.coach_profiles(id),
  sports text[] not null default '{}',
  goal_90d text,
  created_at timestamptz not null default now()
);

alter table public.athlete_profiles enable row level security;

create policy "athlete_profiles_own" on public.athlete_profiles
  for select using (auth.uid() = id);
