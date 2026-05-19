-- 006_programs.sql
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles(id),
  title text not null,
  sport text not null,
  level text not null,
  duration_weeks int not null,
  price_cents int not null,
  created_at timestamptz not null default now()
);

create table public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id),
  athlete_id uuid not null references public.athlete_profiles(id),
  enrolled_at timestamptz not null default now(),
  progress_pct int not null default 0
);

alter table public.programs enable row level security;
alter table public.program_enrollments enable row level security;
