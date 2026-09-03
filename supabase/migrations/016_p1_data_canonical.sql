-- 016_p1_data_canonical.sql
-- P1-DATA: canonical Firebase-UID domain tables.
-- Does NOT modify migrations 001–015.
-- Legacy uuid tables (profiles, workout_sessions, readiness_scores, notifications)
-- remain for deprecation/backfill — not dropped.

--;;
create table if not exists public.data_schema_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

--;;
insert into public.data_schema_meta (key, value, updated_at)
values
  ('canonical_phase', 'P1-DATA', now()),
  ('schema_version', '016', now()),
  ('identity_path', 'firebase_uid→identity_profiles', now())
on conflict (key) do update
  set value = excluded.value,
      updated_at = excluded.updated_at;

--;;
-- Canonical Activity (one ID across Android / Web / Wear / ASCEND / Squad / Social).
-- Units (storage): distance_m meters, duration_ms ms, elevation_gain_m meters,
-- avg_heart_rate_bpm bpm, calories_kcal kcal. Timestamps: timestamptz UTC.
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  provider text not null,
  external_id text not null,
  sport text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_m numeric,
  duration_ms bigint,
  elevation_gain_m numeric,
  avg_heart_rate_bpm numeric,
  calories_kcal numeric,
  visibility text not null default 'private'
    check (visibility in ('private', 'public', 'followers')),
  telemetry jsonb not null default '{}'::jsonb,
  demo_labeled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_user_id_not_blank check (length(user_id) > 0),
  constraint activities_provider_not_blank check (length(provider) > 0),
  constraint activities_external_id_not_blank check (length(external_id) > 0),
  unique (provider, external_id)
);

--;;
alter table public.activities
  add column if not exists shareable boolean
  generated always as (upper(provider) <> 'STRAVA') stored;

--;;
create index if not exists activities_user_started_idx
  on public.activities (user_id, started_at desc);

--;;
create index if not exists activities_user_shareable_started_idx
  on public.activities (user_id, shareable, started_at desc);

--;;
-- Route points for real GPS (P2-GPS fills). Demo geometry must set demo_labeled
-- on the parent activity — never confuse with live GPS.
create table if not exists public.activity_route_points (
  id bigserial primary key,
  activity_id uuid not null references public.activities(id) on delete cascade,
  recorded_at timestamptz not null,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_m double precision,
  altitude_m double precision,
  speed_mps double precision,
  seq int not null default 0
);

--;;
create index if not exists activity_route_points_activity_seq_idx
  on public.activity_route_points (activity_id, seq);

--;;
-- Canonical readiness snapshots keyed by Firebase UID.
-- Formula lives in @fitconnect/utils (formula_version); do not silently change.
-- Legacy readiness_scores (athlete_id uuid) remains untouched.
create table if not exists public.readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  score int not null check (score between 0 and 100),
  hrv_ms numeric,
  sleep_hours numeric,
  sleep_efficiency numeric,
  strain_score numeric,
  recovery_status text
    check (recovery_status is null or recovery_status in ('green', 'amber', 'red')),
  formula_version text not null default 'utils-v1',
  source text not null default 'compute',
  captured_at timestamptz not null default now(),
  constraint readiness_snapshots_user_id_not_blank check (length(user_id) > 0)
);

--;;
create index if not exists readiness_snapshots_user_captured_idx
  on public.readiness_snapshots (user_id, captured_at desc);

--;;
-- Badge catalog (server truth). User awards are idempotent.
create table if not exists public.badge_definitions (
  id text primary key,
  name_key text not null,
  description_key text not null,
  rarity text not null default 'common',
  xp_reward int not null default 0,
  criterion jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

--;;
create table if not exists public.user_badges (
  user_id text not null,
  badge_id text not null references public.badge_definitions(id),
  earned_at timestamptz not null default now(),
  source_event_id text,
  primary key (user_id, badge_id),
  constraint user_badges_user_id_not_blank check (length(user_id) > 0)
);

--;;
create index if not exists user_badges_user_earned_idx
  on public.user_badges (user_id, earned_at desc);

--;;
-- Notifications keyed by Firebase UID (legacy notifications.user_id uuid stays).
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id text not null,
  type text not null,
  source_type text,
  source_id text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint user_notifications_recipient_not_blank check (length(recipient_id) > 0)
);

--;;
create index if not exists user_notifications_recipient_created_idx
  on public.user_notifications (recipient_id, created_at desc);

--;;
-- Cross-platform domain events (realtime / ASCEND / Squad / notifications).
create table if not exists public.domain_events (
  event_id text primary key,
  event_name text not null,
  entity_type text,
  entity_id text,
  actor_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint domain_events_event_id_not_blank check (length(event_id) > 0),
  constraint domain_events_event_name_not_blank check (length(event_name) > 0)
);

--;;
create index if not exists domain_events_actor_created_idx
  on public.domain_events (actor_id, created_at desc);

--;;
create index if not exists domain_events_entity_idx
  on public.domain_events (entity_type, entity_id);

--;;
-- Connected devices / integrations (FCM, Watch, Health Connect binding metadata).
-- Strava tokens stay in privileged StravaConnection — never here.
create table if not exists public.connected_devices (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  device_kind text not null
    check (device_kind in ('watch', 'phone', 'health_connect', 'fcm', 'other')),
  provider text,
  device_key text not null,
  label text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, device_kind, device_key),
  constraint connected_devices_user_id_not_blank check (length(user_id) > 0)
);

--;;
-- ASCEND XP event: explicit source for idempotency audits (PK already user_id+event_id).
alter table public.ascend_events
  add column if not exists source_type text;

--;;
alter table public.ascend_events
  add column if not exists source_id text;

--;;
create index if not exists ascend_events_source_idx
  on public.ascend_events (user_id, source_type, source_id)
  where source_type is not null and source_id is not null;

--;;
-- Squad contribution links last canonical activity (optional).
alter table public.squad_contributions
  add column if not exists last_activity_id uuid;

--;;
alter table public.squad_contributions
  add column if not exists last_event_id text;

--;;
-- Seed minimal badge catalog (ids stable; clients must not hardcode duplicates).
insert into public.badge_definitions (id, name_key, description_key, rarity, xp_reward, criterion)
values
  ('streak-7', 'badge.streak_7', 'badge.streak_7.desc', 'common', 200, '{"kind":"PERFORMANCE_STREAK_DAYS","threshold":7}'::jsonb),
  ('streak-30', 'badge.streak_30', 'badge.streak_30.desc', 'rare', 1000, '{"kind":"PERFORMANCE_STREAK_DAYS","threshold":30}'::jsonb),
  ('first-workout', 'badge.first_workout', 'badge.first_workout.desc', 'common', 25, '{"kind":"WORKOUTS","threshold":1}'::jsonb)
on conflict (id) do nothing;

--;;
alter table public.activities enable row level security;

--;;
alter table public.activities force row level security;

--;;
alter table public.activity_route_points enable row level security;

--;;
alter table public.activity_route_points force row level security;

--;;
alter table public.readiness_snapshots enable row level security;

--;;
alter table public.readiness_snapshots force row level security;

--;;
alter table public.badge_definitions enable row level security;

--;;
alter table public.badge_definitions force row level security;

--;;
alter table public.user_badges enable row level security;

--;;
alter table public.user_badges force row level security;

--;;
alter table public.user_notifications enable row level security;

--;;
alter table public.user_notifications force row level security;

--;;
alter table public.domain_events enable row level security;

--;;
alter table public.domain_events force row level security;

--;;
alter table public.connected_devices enable row level security;

--;;
alter table public.connected_devices force row level security;

--;;
alter table public.data_schema_meta enable row level security;

--;;
alter table public.data_schema_meta force row level security;

--;;
drop policy if exists activities_select_own_or_shareable on public.activities;

--;;
create policy activities_select_own_or_shareable
  on public.activities
  for select
  using (
    user_id = public.firebase_uid()
    or (shareable and visibility = 'public')
  );

--;;
drop policy if exists activities_insert_own on public.activities;

--;;
create policy activities_insert_own
  on public.activities
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists activities_update_own on public.activities;

--;;
create policy activities_update_own
  on public.activities
  for update
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists activities_delete_own on public.activities;

--;;
create policy activities_delete_own
  on public.activities
  for delete
  using (user_id = public.firebase_uid());

--;;
drop policy if exists activity_route_points_select on public.activity_route_points;

--;;
create policy activity_route_points_select
  on public.activity_route_points
  for select
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and (
          a.user_id = public.firebase_uid()
          or (a.shareable and a.visibility = 'public')
        )
    )
  );

--;;
drop policy if exists activity_route_points_insert_own on public.activity_route_points;

--;;
create policy activity_route_points_insert_own
  on public.activity_route_points
  for insert
  with check (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and a.user_id = public.firebase_uid()
    )
  );

--;;
drop policy if exists activity_route_points_delete_own on public.activity_route_points;

--;;
create policy activity_route_points_delete_own
  on public.activity_route_points
  for delete
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and a.user_id = public.firebase_uid()
    )
  );

--;;
drop policy if exists readiness_snapshots_select_own on public.readiness_snapshots;

--;;
create policy readiness_snapshots_select_own
  on public.readiness_snapshots
  for select
  using (user_id = public.firebase_uid());

--;;
drop policy if exists readiness_snapshots_insert_own on public.readiness_snapshots;

--;;
create policy readiness_snapshots_insert_own
  on public.readiness_snapshots
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists readiness_snapshots_delete_own on public.readiness_snapshots;

--;;
create policy readiness_snapshots_delete_own
  on public.readiness_snapshots
  for delete
  using (user_id = public.firebase_uid());

--;;
drop policy if exists badge_definitions_select_all on public.badge_definitions;

--;;
create policy badge_definitions_select_all
  on public.badge_definitions
  for select
  using (true);

--;;
drop policy if exists user_badges_select_own on public.user_badges;

--;;
create policy user_badges_select_own
  on public.user_badges
  for select
  using (user_id = public.firebase_uid());

--;;
drop policy if exists user_badges_insert_own on public.user_badges;

--;;
create policy user_badges_insert_own
  on public.user_badges
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists user_notifications_select_own on public.user_notifications;

--;;
create policy user_notifications_select_own
  on public.user_notifications
  for select
  using (recipient_id = public.firebase_uid());

--;;
drop policy if exists user_notifications_insert_own on public.user_notifications;

--;;
create policy user_notifications_insert_own
  on public.user_notifications
  for insert
  with check (recipient_id = public.firebase_uid());

--;;
drop policy if exists user_notifications_update_own on public.user_notifications;

--;;
create policy user_notifications_update_own
  on public.user_notifications
  for update
  using (recipient_id = public.firebase_uid())
  with check (recipient_id = public.firebase_uid());

--;;
drop policy if exists domain_events_select_own on public.domain_events;

--;;
create policy domain_events_select_own
  on public.domain_events
  for select
  using (actor_id = public.firebase_uid() or actor_id is null);

--;;
drop policy if exists domain_events_insert_own on public.domain_events;

--;;
create policy domain_events_insert_own
  on public.domain_events
  for insert
  with check (actor_id = public.firebase_uid());

--;;
drop policy if exists connected_devices_select_own on public.connected_devices;

--;;
create policy connected_devices_select_own
  on public.connected_devices
  for select
  using (user_id = public.firebase_uid());

--;;
drop policy if exists connected_devices_insert_own on public.connected_devices;

--;;
create policy connected_devices_insert_own
  on public.connected_devices
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists connected_devices_update_own on public.connected_devices;

--;;
create policy connected_devices_update_own
  on public.connected_devices
  for update
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists connected_devices_delete_own on public.connected_devices;

--;;
create policy connected_devices_delete_own
  on public.connected_devices
  for delete
  using (user_id = public.firebase_uid());

--;;
drop policy if exists data_schema_meta_select_authenticated on public.data_schema_meta;

--;;
create policy data_schema_meta_select_authenticated
  on public.data_schema_meta
  for select
  using (public.firebase_uid() is not null and length(public.firebase_uid()) > 0);

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update, delete on table public.activities to authenticated;
    grant select, insert, delete on table public.activity_route_points to authenticated;
    grant usage, select on sequence public.activity_route_points_id_seq to authenticated;
    grant select, insert, delete on table public.readiness_snapshots to authenticated;
    grant select on table public.badge_definitions to authenticated;
    grant select, insert on table public.user_badges to authenticated;
    grant select, insert, update on table public.user_notifications to authenticated;
    grant select, insert on table public.domain_events to authenticated;
    grant select, insert, update, delete on table public.connected_devices to authenticated;
    grant select on table public.data_schema_meta to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant select on table public.badge_definitions to anon;
  end if;
end
$grants$;
