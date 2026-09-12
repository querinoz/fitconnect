-- 017_strength_workout_engine.sql
-- Strength training domain: plans, execution, body weight, progression state.
-- Does NOT modify migrations 001–016.
-- Links completed sessions to public.activities via activity_id.
-- Re-runnable: every policy is dropped-if-exists first and grants are guarded by
-- role existence, so a partial prior apply no longer blocks the 017-021 chain.

--;;
insert into public.data_schema_meta (key, value, updated_at)
values ('strength_schema_version', '017', now())
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;

--;;
create table if not exists public.exercises (
  id text primary key,
  user_id text,
  name text not null,
  category text not null default 'strength',
  primary_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  equipment text[] not null default '{}',
  mode text not null default 'REPS'
    check (mode in ('REPS','TIME','DISTANCE','DURATION_SPEED','BODYWEIGHT','WEIGHTED_BODYWEIGHT')),
  side_aware boolean not null default false,
  weighted boolean not null default true,
  instructions text,
  media_url text,
  media_license text,
  is_custom boolean not null default false,
  source text not null default 'builtin'
    check (source in ('builtin','custom','imported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_builtin_no_user check (is_custom = true or user_id is null),
  constraint exercises_custom_has_user check (is_custom = false or user_id is not null)
);

--;;
create index if not exists exercises_user_custom_idx on public.exercises (user_id) where is_custom;

--;;
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  coach_id text,
  title text not null,
  progression_rule text not null default 'DOUBLE_PROGRESSION',
  timezone text not null default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--;;
create table if not exists public.training_routines (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  title text not null,
  sort_order int not null default 0,
  exclude_from_progression boolean not null default false,
  created_at timestamptz not null default now()
);

--;;
create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.training_routines(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  sequence int not null default 0,
  superset_group_id text,
  progression_rule text,
  target_sets int not null default 3,
  target_reps_min int not null default 6,
  target_reps_max int not null default 8,
  target_weight_kg numeric,
  target_time_sec int,
  rest_sec int not null default 90,
  side_mode text not null default 'none'
    check (side_mode in ('none','per_side','alternating'))
);

--;;
create table if not exists public.workout_occurrences (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  routine_id uuid references public.training_routines(id),
  scheduled_date date not null,
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','skipped','cancelled','rescheduled')),
  rescheduled_from date,
  created_at timestamptz not null default now(),
  unique (plan_id, scheduled_date, routine_id)
);

--;;
create table if not exists public.strength_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  occurrence_id uuid references public.workout_occurrences(id),
  activity_id uuid references public.activities(id),
  status text not null default 'IDLE'
    check (status in ('IDLE','PREP','ACTIVE','PAUSED','FINISHED','CANCELLED')),
  started_at timestamptz,
  paused_at timestamptz,
  resumed_at timestamptz,
  completed_at timestamptz,
  duration_ms bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--;;
create table if not exists public.strength_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.strength_sessions(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  sequence int not null,
  set_type text not null default 'working'
    check (set_type in ('warmup','working','dropset','amrap')),
  superset_group_id text,
  side_mode text not null default 'none',
  target_reps int,
  actual_reps int,
  target_weight_kg numeric,
  actual_weight_kg numeric,
  target_time_sec int,
  actual_time_sec int,
  target_distance_m numeric,
  actual_distance_m numeric,
  rpe numeric,
  rir smallint,
  effort_scale text check (effort_scale is null or effort_scale in ('rpe','rir')),
  is_failed boolean not null default false,
  completed_at timestamptz,
  unique (session_id, sequence)
);

--;;
create table if not exists public.body_weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  weight_kg numeric not null check (weight_kg > 0),
  goal_kg numeric,
  recorded_at timestamptz not null default now(),
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

--;;
create index if not exists body_weight_user_recorded_idx
  on public.body_weight_entries (user_id, recorded_at desc);

--;;
create table if not exists public.progression_states (
  user_id text not null,
  exercise_id text not null references public.exercises(id),
  stall_count int not null default 0,
  last_target_weight_kg numeric,
  last_target_reps int,
  progression_rule text not null default 'DOUBLE_PROGRESSION',
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

--;;
-- RLS
alter table public.exercises enable row level security;
alter table public.exercises force row level security;
alter table public.training_plans enable row level security;
alter table public.training_plans force row level security;
alter table public.training_routines enable row level security;
alter table public.training_routines force row level security;
alter table public.routine_exercises enable row level security;
alter table public.routine_exercises force row level security;
alter table public.workout_occurrences enable row level security;
alter table public.workout_occurrences force row level security;
alter table public.strength_sessions enable row level security;
alter table public.strength_sessions force row level security;
alter table public.strength_sets enable row level security;
alter table public.strength_sets force row level security;
alter table public.body_weight_entries enable row level security;
alter table public.body_weight_entries force row level security;
alter table public.progression_states enable row level security;
alter table public.progression_states force row level security;

--;;
drop policy if exists exercises_select on public.exercises;

create policy exercises_select on public.exercises for select using (
  is_custom = false or user_id = firebase_uid()
);

drop policy if exists exercises_insert on public.exercises;

create policy exercises_insert on public.exercises for insert with check (
  is_custom = true and user_id = firebase_uid()
);

drop policy if exists exercises_update on public.exercises;

create policy exercises_update on public.exercises for update using (
  is_custom = true and user_id = firebase_uid()
);

--;;
drop policy if exists training_plans_own on public.training_plans;

create policy training_plans_own on public.training_plans for all using (
  user_id = firebase_uid()
) with check (user_id = firebase_uid());

--;;
drop policy if exists training_routines_via_plan on public.training_routines;

create policy training_routines_via_plan on public.training_routines for all using (
  exists (
    select 1 from public.training_plans p
    where p.id = plan_id and p.user_id = firebase_uid()
  )
);

--;;
drop policy if exists routine_exercises_via_plan on public.routine_exercises;

create policy routine_exercises_via_plan on public.routine_exercises for all using (
  exists (
    select 1 from public.training_routines r
    join public.training_plans p on p.id = r.plan_id
    where r.id = routine_id and p.user_id = firebase_uid()
  )
);

--;;
drop policy if exists workout_occurrences_via_plan on public.workout_occurrences;

create policy workout_occurrences_via_plan on public.workout_occurrences for all using (
  exists (
    select 1 from public.training_plans p
    where p.id = plan_id and p.user_id = firebase_uid()
  )
);

--;;
drop policy if exists strength_sessions_own on public.strength_sessions;

create policy strength_sessions_own on public.strength_sessions for all using (
  user_id = firebase_uid()
) with check (user_id = firebase_uid());

--;;
drop policy if exists strength_sets_via_session on public.strength_sets;

create policy strength_sets_via_session on public.strength_sets for all using (
  exists (
    select 1 from public.strength_sessions s
    where s.id = session_id and s.user_id = firebase_uid()
  )
);

--;;
drop policy if exists body_weight_own on public.body_weight_entries;

create policy body_weight_own on public.body_weight_entries for all using (
  user_id = firebase_uid()
) with check (user_id = firebase_uid());

--;;
drop policy if exists progression_states_own on public.progression_states;

create policy progression_states_own on public.progression_states for all using (
  user_id = firebase_uid()
) with check (user_id = firebase_uid());

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select on public.exercises to authenticated;
    grant all on public.training_plans to authenticated;
    grant all on public.training_routines to authenticated;
    grant all on public.routine_exercises to authenticated;
    grant all on public.workout_occurrences to authenticated;
    grant all on public.strength_sessions to authenticated;
    grant all on public.strength_sets to authenticated;
    grant all on public.body_weight_entries to authenticated;
    grant all on public.progression_states to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant select on public.exercises to anon;
  end if;
end
$grants$;
