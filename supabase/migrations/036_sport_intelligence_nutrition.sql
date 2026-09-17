-- 036_sport_intelligence_nutrition.sql
-- V8.5 Sports Identity + Nutrition diary. Additive. Does not modify 001–035.

--;;
insert into public.data_schema_meta (key, value, updated_at)
values ('sport_intelligence_version', '036', now())
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;

--;;
create table if not exists public.athlete_sports_profiles (
  user_id text primary key,
  primary_sport text,
  secondary_sports text[] not null default '{}',
  sport_level text,
  training_age_years numeric,
  training_days_per_week int,
  preferred_training_days int[] not null default '{}',
  session_duration_min int,
  available_equipment text[] not null default '{}',
  training_location text,
  competitive_status text,
  competition_calendar jsonb not null default '[]'::jsonb,
  primary_goal text,
  secondary_goal text,
  updated_at timestamptz not null default now()
);

--;;
create index if not exists athlete_sports_profiles_sport_idx
  on public.athlete_sports_profiles (primary_sport)
  where primary_sport is not null;

--;;
create table if not exists public.nutrition_profiles (
  user_id text primary key,
  goal text,
  diet_pattern text,
  allergies text[] not null default '{}',
  intolerances text[] not null default '{}',
  dislikes text[] not null default '{}',
  religious_restrictions text[] not null default '{}',
  meal_frequency int,
  country_locale text not null default 'pt-PT',
  high_risk_context boolean not null default false,
  declared_medical_context boolean not null default false,
  body_mass_kg numeric,
  height_cm numeric,
  activity_level text,
  budget text,
  prep_time_min int,
  share_with_coach boolean not null default false,
  updated_at timestamptz not null default now()
);

--;;
create table if not exists public.nutrition_food_logs (
  id text primary key,
  user_id text not null,
  food_id text not null,
  food_snapshot jsonb not null,
  grams numeric not null check (grams > 0),
  slot text,
  date_iso date not null,
  confirmed_at timestamptz not null default now(),
  source text not null default 'user_confirm'
    check (source = 'user_confirm')
);

--;;
create index if not exists nutrition_food_logs_user_date_idx
  on public.nutrition_food_logs (user_id, date_iso desc);

--;;
create table if not exists public.sport_training_completions (
  id text primary key,
  user_id text not null,
  sport_id text not null,
  session_type text not null,
  title text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_sec int not null check (duration_sec >= 0),
  blocks_completed int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  training_load_label text,
  rpe numeric,
  notes text,
  sync_state text not null default 'SYNCED'
    check (sync_state in ('SYNCED', 'SYNCING', 'OFFLINE', 'QUEUED', 'CONFLICT', 'ERROR')),
  created_at timestamptz not null default now()
);

--;;
create index if not exists sport_training_completions_user_idx
  on public.sport_training_completions (user_id, completed_at desc);

--;;
alter table public.athlete_sports_profiles enable row level security;
alter table public.athlete_sports_profiles force row level security;
alter table public.nutrition_profiles enable row level security;
alter table public.nutrition_profiles force row level security;
alter table public.nutrition_food_logs enable row level security;
alter table public.nutrition_food_logs force row level security;
alter table public.sport_training_completions enable row level security;
alter table public.sport_training_completions force row level security;

--;;
drop policy if exists athlete_sports_profiles_own on public.athlete_sports_profiles;
create policy athlete_sports_profiles_own on public.athlete_sports_profiles for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

drop policy if exists nutrition_profiles_own on public.nutrition_profiles;
create policy nutrition_profiles_own on public.nutrition_profiles for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

drop policy if exists nutrition_food_logs_own on public.nutrition_food_logs;
create policy nutrition_food_logs_own on public.nutrition_food_logs for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

drop policy if exists sport_training_completions_own on public.sport_training_completions;
create policy sport_training_completions_own on public.sport_training_completions for all
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update, delete on public.athlete_sports_profiles to authenticated;
    grant select, insert, update, delete on public.nutrition_profiles to authenticated;
    grant select, insert, update, delete on public.nutrition_food_logs to authenticated;
    grant select, insert, update, delete on public.sport_training_completions to authenticated;
  end if;
  -- Server role (service) typically bypasses RLS via connection; revoke anon.
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.athlete_sports_profiles from anon;
    revoke all on public.nutrition_profiles from anon;
    revoke all on public.nutrition_food_logs from anon;
    revoke all on public.sport_training_completions from anon;
  end if;
end
$grants$;
