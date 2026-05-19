-- 004_sessions.sql
create type public.session_status as enum ('scheduled', 'live', 'completed', 'cancelled');

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete_profiles(id),
  coach_id uuid not null references public.coach_profiles(id),
  starts_at timestamptz not null,
  ends_at timestamptz,
  sport text not null,
  mode text not null check (mode in ('online', 'in-person', 'hybrid')),
  status public.session_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.sessions enable row level security;
