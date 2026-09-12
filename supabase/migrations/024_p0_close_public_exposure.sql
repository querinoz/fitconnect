-- 024_p0_close_public_exposure.sql
-- P0. Closes a confirmed public-API exposure on the live project.
--
-- Observed on production (beuiammeedpovdkmhluw) 2026-09-10 via pg_class /
-- has_table_privilege, and independently reported by the Supabase security
-- linter (0013_rls_disabled_in_public):
--
--   table                  relrowsecurity   anon SELECT   anon INSERT
--   StravaConnection       false            true          true
--   StravaActivity         false            true          true
--   StravaActivityLap      false            true          true
--   StravaSegmentEffort    false            true          true
--   schema_migrations      false            true          true
--   _prisma_migrations     false            true          true
--
-- public.StravaConnection stores columns accessToken and refreshToken. With RLS
-- off and a SELECT grant to `anon` -- the role behind the publishable key that
-- ships in the web bundle -- every athlete's Strava OAuth tokens and every
-- athlete's Strava activity history were readable through PostgREST by anyone
-- holding that key. This violates AGENTS.md 1 (no athlete's data to anyone but
-- that athlete) and AGENTS.md 3 (tokens never leave the server).
--
-- These tables are Prisma-managed and server-only by design: no client flow is
-- supposed to reach them. The fix is therefore to remove the client grants and
-- turn RLS on, with no policies -- RLS with zero policies denies every role that
-- does not bypass it.
--
-- Safety: public tables here are owned by `postgres` (rolbypassrls = true) and
-- `service_role` also has rolbypassrls = true, so the privileged server path is
-- unaffected. Nothing is dropped and no row is touched. Reversible by re-granting.
--
-- After applying, the leaked tokens must still be treated as compromised:
-- rotate the Strava client secret and force a re-authorization. That part is
-- HUMAN REQUIRED.

--;;
do $lockdown$
declare
  t text;
  server_only text[] := array[
    'StravaConnection',
    'StravaActivity',
    'StravaActivityLap',
    'StravaSegmentEffort',
    'schema_migrations',
    '_prisma_migrations'
  ];
begin
  foreach t in array server_only loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all privileges on table public.%I from anon', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all privileges on table public.%I from authenticated', t);
    end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end
$lockdown$;

--;;
-- Future tables created in this schema must not inherit client grants either.
do $defaults$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'alter default privileges in schema public revoke all on tables from anon';
  end if;
end
$defaults$;

--;;
-- Supabase linter 0011_function_search_path_mutable: public.firebase_uid is the
-- predicate behind every RLS policy in this schema, so it must not resolve its
-- own dependencies through a caller-controlled search_path.
alter function public.firebase_uid() set search_path = pg_catalog, public;
