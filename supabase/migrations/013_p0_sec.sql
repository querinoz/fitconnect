-- 013_p0_sec.sql
-- P0-SEC: own-row DELETE for identity, deletion audit, FORCE RLS on remaining user tables.
-- Does not remap uuid product tables onto firebase_uid() — that is P1-DATA.

--;;
create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  requested_at timestamptz not null default now(),
  status text not null default 'received'
    check (status in ('received', 'app_data_deleted', 'firebase_pending')),
  firebase_auth text not null default 'PENDING_HUMAN',
  retained jsonb not null default '{}'::jsonb
);

--;;
alter table public.account_deletion_requests enable row level security;

--;;
alter table public.account_deletion_requests force row level security;

--;;
drop policy if exists account_deletion_insert_own on public.account_deletion_requests;

--;;
create policy account_deletion_insert_own
  on public.account_deletion_requests
  for insert
  with check (uid = public.firebase_uid());

--;;
drop policy if exists account_deletion_select_own on public.account_deletion_requests;

--;;
create policy account_deletion_select_own
  on public.account_deletion_requests
  for select
  using (uid = public.firebase_uid());

--;;
drop policy if exists identity_profiles_delete_own on public.identity_profiles;

--;;
create policy identity_profiles_delete_own
  on public.identity_profiles
  for delete
  using (id = public.firebase_uid());

--;;
drop policy if exists user_roles_delete_own on public.user_roles;

--;;
create policy user_roles_delete_own
  on public.user_roles
  for delete
  using (uid = public.firebase_uid());

--;;
drop policy if exists user_preferences_delete_own on public.user_preferences;

--;;
create policy user_preferences_delete_own
  on public.user_preferences
  for delete
  using (uid = public.firebase_uid());

--;;
drop policy if exists onboarding_state_delete_own on public.onboarding_state;

--;;
create policy onboarding_state_delete_own
  on public.onboarding_state
  for delete
  using (uid = public.firebase_uid());

--;;
do $force$
begin
  if to_regclass('public.workout_sessions') is not null then
    execute 'alter table public.workout_sessions force row level security';
  end if;
  if to_regclass('public.community_posts') is not null then
    execute 'alter table public.community_posts force row level security';
  end if;
  if to_regclass('public.post_reactions') is not null then
    execute 'alter table public.post_reactions force row level security';
  end if;
end
$force$;

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant insert, select on table public.account_deletion_requests to authenticated;
    grant delete on table public.identity_profiles to authenticated;
    grant delete on table public.user_roles to authenticated;
    grant delete on table public.user_preferences to authenticated;
    grant delete on table public.onboarding_state to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table public.account_deletion_requests from anon;
  end if;
end
$grants$;
