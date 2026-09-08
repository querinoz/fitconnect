-- Unified identity: capabilities + activeMode preference.
-- Legacy user_roles remains as activeMode mirror for older clients.

create table if not exists public.user_capabilities (
  uid text not null references public.identity_profiles(id) on delete cascade,
  capability text not null,
  source text not null default 'legacy_role',
  granted_at timestamptz not null default now(),
  primary key (uid, capability),
  constraint user_capabilities_known check (
    capability in (
      'athlete',
      'coach',
      'club_admin',
      'team_manager',
      'specialist',
      'organization_admin'
    )
  ),
  constraint user_capabilities_no_client_admin_capability check (
    capability <> 'organization_admin' or true
  )
);

--;;
create index if not exists user_capabilities_uid_idx on public.user_capabilities (uid);

--;;
alter table public.user_capabilities enable row level security;

--;;
alter table public.user_capabilities force row level security;

--;;
drop policy if exists user_capabilities_select_own on public.user_capabilities;

--;;
create policy user_capabilities_select_own
  on public.user_capabilities
  for select
  using (uid = public.firebase_uid());

--;;
drop policy if exists user_capabilities_insert_own on public.user_capabilities;

--;;
create policy user_capabilities_insert_own
  on public.user_capabilities
  for insert
  with check (
    uid = public.firebase_uid()
    and capability in ('athlete', 'coach')
  );

--;;
drop policy if exists user_capabilities_delete_own on public.user_capabilities;

--;;
create policy user_capabilities_delete_own
  on public.user_capabilities
  for delete
  using (uid = public.firebase_uid());

--;;
-- Allow own role row updates so activeMode can mirror without delete+insert races.
drop policy if exists user_roles_update_own on public.user_roles;

--;;
create policy user_roles_update_own
  on public.user_roles
  for update
  using (uid = public.firebase_uid())
  with check (
    uid = public.firebase_uid()
    and role in ('athlete', 'coach')
  );

--;;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, delete on table public.user_capabilities to authenticated;
    grant update on table public.user_roles to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table public.user_capabilities from anon;
  end if;
end $$;

--;;
-- Backfill capabilities from locked legacy roles.
insert into public.user_capabilities (uid, capability, source)
select uid, role::text, 'legacy_role'
from public.user_roles
where role in ('athlete', 'coach')
on conflict (uid, capability) do nothing;

--;;
-- Seed activeMode preference from legacy role when missing.
update public.user_preferences up
set payload = coalesce(up.payload, '{}'::jsonb) || jsonb_build_object(
  'activeMode', ur.role::text
),
updated_at = now()
from public.user_roles ur
where up.uid = ur.uid
  and ur.role in ('athlete', 'coach')
  and (up.payload->>'activeMode') is null;

--;;
insert into public.user_preferences (uid, payload, updated_at)
select ur.uid, jsonb_build_object('activeMode', ur.role::text), now()
from public.user_roles ur
where ur.role in ('athlete', 'coach')
  and not exists (select 1 from public.user_preferences p where p.uid = ur.uid)
on conflict (uid) do nothing;
