-- 035_combat_os.sql
-- Martial Arts / Combat Sports OS. Additive. Does not modify 016.
-- Catalog lives in application code (versioned). These tables store athlete-owned
-- sessions, events, measurements, ranks and competitions.
-- High-frequency IMU samples are NOT stored here — summaries and events only.

--;;
insert into public.data_schema_meta (key, value, updated_at)
values ('combat_os_version', '035', now())
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;

--;;
create table if not exists public.combat_sessions (
  id text primary key,
  user_id text not null,
  discipline_id text not null,
  session_mode text not null default 'technique',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  rounds_completed int not null default 0,
  rpe numeric,
  notes text,
  activity_id text,
  created_at timestamptz not null default now()
);

--;;
create index if not exists combat_sessions_user_idx on public.combat_sessions (user_id, started_at desc);

--;;
create table if not exists public.combat_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.combat_sessions(id) on delete cascade,
  round_index int not null,
  work_sec int not null,
  rest_sec int not null,
  completed boolean not null default false
);

--;;
create table if not exists public.combat_events (
  id text primary key,
  session_id text not null references public.combat_sessions(id) on delete cascade,
  round_index int,
  occurred_at timestamptz not null,
  kind text not null check (kind in ('strike','grappling','movement','impact_safety')),
  payload jsonb not null default '{}'::jsonb,
  classification text not null default 'DETECTED'
    check (classification in ('DETECTED','CLASSIFIED','CONFIRMED')),
  source text not null default 'MANUAL',
  confirmed_by text
);

--;;
create table if not exists public.combat_measurements (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.combat_sessions(id) on delete cascade,
  round_index int,
  metric text not null,
  value numeric,
  unit text,
  measurement_type text not null check (measurement_type in ('DIRECT','ESTIMATED','PROXY')),
  sensor text not null,
  source text not null,
  provider text not null,
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW','MISSING')),
  sampled_at timestamptz
);

--;;
create table if not exists public.athlete_combat_profiles (
  user_id text primary key,
  primary_discipline_id text,
  disciplines text[] not null default '{}',
  rank_system text,
  rank text,
  rank_source text check (rank_source is null or rank_source in ('self','coach','federation')),
  promotion_date date,
  gym text,
  coach text,
  weight_class text,
  updated_at timestamptz not null default now()
);

--;;
create table if not exists public.combat_competitions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  discipline_id text not null,
  ruleset_id text not null,
  ruleset_version text not null,
  weight_class text,
  age_class text,
  event_name text,
  outcome text,
  method text,
  score text,
  source text not null check (source in ('official','athlete','coach')),
  notes text,
  occurred_at timestamptz not null default now()
);

--;;
create table if not exists public.athlete_combat_ranks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  discipline_id text not null,
  rank_system text not null,
  rank text not null,
  source text not null check (source in ('self','coach','federation')),
  confirmed_by text,
  promotion_date date,
  unique (user_id, discipline_id, rank_system, rank, promotion_date)
);

--;;
alter table public.combat_sessions enable row level security;
alter table public.combat_sessions force row level security;
alter table public.combat_rounds enable row level security;
alter table public.combat_rounds force row level security;
alter table public.combat_events enable row level security;
alter table public.combat_events force row level security;
alter table public.combat_measurements enable row level security;
alter table public.combat_measurements force row level security;
alter table public.athlete_combat_profiles enable row level security;
alter table public.athlete_combat_profiles force row level security;
alter table public.combat_competitions enable row level security;
alter table public.combat_competitions force row level security;
alter table public.athlete_combat_ranks enable row level security;
alter table public.athlete_combat_ranks force row level security;

--;;
drop policy if exists combat_sessions_own on public.combat_sessions;
create policy combat_sessions_own on public.combat_sessions for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

drop policy if exists combat_rounds_via_session on public.combat_rounds;
create policy combat_rounds_via_session on public.combat_rounds for all
  using (exists (select 1 from public.combat_sessions s where s.id = session_id and s.user_id = public.firebase_uid()));

drop policy if exists combat_events_via_session on public.combat_events;
create policy combat_events_via_session on public.combat_events for all
  using (exists (select 1 from public.combat_sessions s where s.id = session_id and s.user_id = public.firebase_uid()));

drop policy if exists combat_measurements_via_session on public.combat_measurements;
create policy combat_measurements_via_session on public.combat_measurements for all
  using (exists (select 1 from public.combat_sessions s where s.id = session_id and s.user_id = public.firebase_uid()));

drop policy if exists athlete_combat_profiles_own on public.athlete_combat_profiles;
create policy athlete_combat_profiles_own on public.athlete_combat_profiles for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

drop policy if exists combat_competitions_own on public.combat_competitions;
create policy combat_competitions_own on public.combat_competitions for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

drop policy if exists athlete_combat_ranks_own on public.athlete_combat_ranks;
create policy athlete_combat_ranks_own on public.athlete_combat_ranks for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update, delete on public.combat_sessions to authenticated;
    grant select, insert, update, delete on public.combat_rounds to authenticated;
    grant select, insert, update, delete on public.combat_events to authenticated;
    grant select, insert, update, delete on public.combat_measurements to authenticated;
    grant select, insert, update, delete on public.athlete_combat_profiles to authenticated;
    grant select, insert, update, delete on public.combat_competitions to authenticated;
    grant select, insert, update, delete on public.athlete_combat_ranks to authenticated;
  end if;
end
$grants$;

--;;
create table if not exists public.combat_calibrations (
  user_id text not null,
  device_id text not null,
  sensor text not null,
  dominant_side text,
  placement text,
  sampling_hz numeric,
  orientation text,
  calibrated_at timestamptz not null default now(),
  primary key (user_id, device_id, sensor)
);

--;;
alter table public.combat_calibrations enable row level security;
alter table public.combat_calibrations force row level security;

--;;
drop policy if exists combat_calibrations_own on public.combat_calibrations;
create policy combat_calibrations_own on public.combat_calibrations for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

--;;
do $cal_grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update, delete on public.combat_calibrations to authenticated;
  end if;
end
$cal_grants$;
