-- 011_workout_sessions_shareable.sql
-- Coaching `public.sessions` is a calendar table (athlete+coach) and has no
-- provider column. Fitness workouts live here so the Strava barrier can be
-- enforced as a generated column + RLS, not a UI flag.

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  external_id text not null,
  visibility text not null default 'private'
    check (visibility in ('private', 'public', 'followers')),
  sport text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_m numeric,
  created_at timestamptz not null default now(),
  unique (provider, external_id)
);

alter table public.workout_sessions
  add column if not exists shareable boolean
  generated always as (provider <> 'STRAVA') stored;

create index if not exists workout_sessions_user_shareable_started
  on public.workout_sessions (user_id, shareable, started_at desc);

alter table public.workout_sessions enable row level security;

drop policy if exists "social_feed_excludes_restricted_providers" on public.workout_sessions;
create policy "social_feed_excludes_restricted_providers"
  on public.workout_sessions for select
  using (
    auth.uid() = user_id
    or (shareable and visibility = 'public')
  );

drop policy if exists "owner_inserts_own_workouts" on public.workout_sessions;
create policy "owner_inserts_own_workouts"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "owner_updates_own_workouts" on public.workout_sessions;
create policy "owner_updates_own_workouts"
  on public.workout_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
