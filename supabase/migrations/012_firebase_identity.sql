-- 012_firebase_identity.sql
-- Canonical FitConnect identity for Firebase Auth + Supabase RLS.
-- Firebase UID is text (not uuid). Do NOT use auth.uid() for these tables.
-- Legacy public.profiles (uuid → auth.users) remains unused by this identity path.
--
-- Statements are separated by --;; so tests can apply them on vanilla Postgres.

--;;
create or replace function public.firebase_uid()
returns text
language plpgsql
stable
security invoker
as $$
declare
  from_setting text;
  from_jwt text;
begin
  from_setting := nullif(current_setting('request.jwt.claim.sub', true), '');
  if from_setting is not null then
    return from_setting;
  end if;
  begin
    from_jwt := nullif(auth.jwt() ->> 'sub', '');
  exception
    when undefined_function then
      from_jwt := null;
    when others then
      from_jwt := null;
  end;
  return from_jwt;
end;
$$;

--;;
create table if not exists public.identity_profiles (
  id text primary key,
  email text,
  display_name text,
  avatar_url text,
  locale text,
  timezone text,
  accent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint identity_profiles_id_not_blank check (length(id) > 0)
);

--;;
create table if not exists public.user_roles (
  uid text primary key references public.identity_profiles(id) on delete cascade,
  role public.user_role not null,
  assigned_at timestamptz not null default now(),
  constraint user_roles_no_client_admin check (role in ('athlete', 'coach', 'admin'))
);

--;;
create table if not exists public.user_preferences (
  uid text primary key references public.identity_profiles(id) on delete cascade,
  locale text,
  timezone text,
  accent text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

--;;
create table if not exists public.onboarding_state (
  uid text primary key references public.identity_profiles(id) on delete cascade,
  role public.user_role,
  step int not null default 0,
  completed boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

--;;
create index if not exists identity_profiles_email_idx on public.identity_profiles (email);

--;;
alter table public.identity_profiles enable row level security;

--;;
alter table public.identity_profiles force row level security;

--;;
alter table public.user_roles enable row level security;

--;;
alter table public.user_roles force row level security;

--;;
alter table public.user_preferences enable row level security;

--;;
alter table public.user_preferences force row level security;

--;;
alter table public.onboarding_state enable row level security;

--;;
alter table public.onboarding_state force row level security;

--;;
drop policy if exists identity_profiles_select_own on public.identity_profiles;

--;;
create policy identity_profiles_select_own
  on public.identity_profiles
  for select
  using (id = public.firebase_uid());

--;;
drop policy if exists identity_profiles_insert_own on public.identity_profiles;

--;;
create policy identity_profiles_insert_own
  on public.identity_profiles
  for insert
  with check (id = public.firebase_uid());

--;;
drop policy if exists identity_profiles_update_own on public.identity_profiles;

--;;
create policy identity_profiles_update_own
  on public.identity_profiles
  for update
  using (id = public.firebase_uid())
  with check (id = public.firebase_uid());

--;;
drop policy if exists user_roles_select_own on public.user_roles;

--;;
create policy user_roles_select_own
  on public.user_roles
  for select
  using (uid = public.firebase_uid());

--;;
drop policy if exists user_roles_insert_own on public.user_roles;

--;;
create policy user_roles_insert_own
  on public.user_roles
  for insert
  with check (
    uid = public.firebase_uid()
    and role in ('athlete', 'coach')
  );

--;;
drop policy if exists user_preferences_select_own on public.user_preferences;

--;;
create policy user_preferences_select_own
  on public.user_preferences
  for select
  using (uid = public.firebase_uid());

--;;
drop policy if exists user_preferences_insert_own on public.user_preferences;

--;;
create policy user_preferences_insert_own
  on public.user_preferences
  for insert
  with check (uid = public.firebase_uid());

--;;
drop policy if exists user_preferences_update_own on public.user_preferences;

--;;
create policy user_preferences_update_own
  on public.user_preferences
  for update
  using (uid = public.firebase_uid())
  with check (uid = public.firebase_uid());

--;;
drop policy if exists onboarding_state_select_own on public.onboarding_state;

--;;
create policy onboarding_state_select_own
  on public.onboarding_state
  for select
  using (uid = public.firebase_uid());

--;;
drop policy if exists onboarding_state_insert_own on public.onboarding_state;

--;;
create policy onboarding_state_insert_own
  on public.onboarding_state
  for insert
  with check (uid = public.firebase_uid());

--;;
drop policy if exists onboarding_state_update_own on public.onboarding_state;

--;;
create policy onboarding_state_update_own
  on public.onboarding_state
  for update
  using (uid = public.firebase_uid())
  with check (uid = public.firebase_uid());

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update on table public.identity_profiles to authenticated;
    grant select, insert on table public.user_roles to authenticated;
    grant select, insert, update on table public.user_preferences to authenticated;
    grant select, insert, update on table public.onboarding_state to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table public.identity_profiles from anon;
    revoke all on table public.user_roles from anon;
    revoke all on table public.user_preferences from anon;
    revoke all on table public.onboarding_state from anon;
  end if;
end
$grants$;
