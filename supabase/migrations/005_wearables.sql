-- 005_wearables.sql
create table public.hrv_readings (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete_profiles(id),
  captured_at timestamptz not null,
  hrv_ms numeric(6,2) not null,
  resting_hr int,
  source text not null default 'manual'
);

create table public.readiness_scores (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete_profiles(id),
  score int not null check (score between 0 and 100),
  hrv_component int,
  sleep_component int,
  strain_component int,
  captured_at timestamptz not null default now()
);

alter table public.hrv_readings enable row level security;
alter table public.readiness_scores enable row level security;
