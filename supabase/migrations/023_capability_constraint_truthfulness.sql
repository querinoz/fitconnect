-- 023_capability_constraint_truthfulness.sql
-- Additive, non-destructive. Removes a CHECK constraint that enforced nothing
-- and records, in the schema itself, where capability authorization really lives.
--
-- Background
-- ----------
-- 022 shipped:
--     constraint user_capabilities_no_client_admin_capability
--       check (capability <> 'organization_admin' or true)
--
-- `X or true` is a tautology: the constraint accepts every row, including
-- capability = 'organization_admin'. Verified on PostgreSQL 16:
--     pg_get_constraintdef -> CHECK (((capability <> 'organization_admin') OR true))
--     insert ... ('organization_admin') -> INSERT 0 1
--
-- A constraint whose NAME promises a protection it does not provide is worse
-- than no constraint: a reviewer reads the name and stops looking. The real
-- barrier against a client granting itself a privileged capability is the RLS
-- insert policy from 022, which restricts client writes to athlete/coach:
--
--     create policy user_capabilities_insert_own ... with check (
--       uid = public.firebase_uid() and capability in ('athlete', 'coach')
--     )
--
-- That policy is untouched here. Only the misleading constraint is removed and
-- the enforcement point is documented.

--;;
alter table public.user_capabilities
  drop constraint if exists user_capabilities_no_client_admin_capability;

--;;
comment on table public.user_capabilities is
  'Capabilities a user owns. Authorization = identity + entitlement + capability; '
  'activeMode is UI context only and never grants access. Client writes are limited '
  'to athlete/coach by RLS policy user_capabilities_insert_own — privileged '
  'capabilities (club_admin, team_manager, specialist, organization_admin) are '
  'server-granted through the service role only.';

--;;
comment on constraint user_capabilities_known on public.user_capabilities is
  'Vocabulary check only. It does NOT decide who may grant which capability — '
  'that is RLS (user_capabilities_insert_own) plus the server entitlement path.';
