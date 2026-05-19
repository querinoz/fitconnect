-- 002_coaches.sql
create table public.coach_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  verified boolean not null default false,
  hourly_rate_cents int not null default 5500,
  sports text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.coach_profiles enable row level security;

create policy "coach_profiles_public_read" on public.coach_profiles
  for select using (true);
