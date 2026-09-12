-- 030_server_only_grants_match_declaration.sql
-- Makes the catalog agree with what the codebase already declares.
--
-- scripts/db-reconcile-schema.mjs carries a SERVER_ONLY_TABLES allowlist whose stated
-- meaning is: "these tables are written only through a privileged server path
-- (postgres / service_role, both rolbypassrls)". Sixteen tables are listed. Measured on
-- production (beuiammeedpovdkmhluw) 2026-09-12, only six of them actually hold no client
-- DML grant -- the four Strava tables and the two migration tables, all fixed by 024.
-- The other ten still grant DML to the roles behind the publishable key:
--
--   table                     anon      authenticated
--   stripe_processed_events   SELECT    DELETE,INSERT,SELECT,UPDATE
--   training_spot_audit       --        DELETE,INSERT,SELECT,UPDATE
--   training_spot_reports     --        DELETE,INSERT,SELECT,UPDATE
--   sessions                  SELECT    DELETE,INSERT,SELECT,UPDATE
--   programs                  SELECT    DELETE,INSERT,SELECT,UPDATE
--   program_enrollments       SELECT    DELETE,INSERT,SELECT,UPDATE
--   readiness_scores          SELECT    DELETE,INSERT,SELECT,UPDATE
--   hrv_readings              SELECT    DELETE,INSERT,SELECT,UPDATE
--   push_tokens               SELECT    DELETE,INSERT,SELECT,UPDATE
--   notifications             SELECT    DELETE,INSERT,SELECT,UPDATE
--
-- Note what that reads like in a catalog dump or a security review: `authenticated` may
-- delete rows from an audit trail (training_spot_audit) and from the Stripe webhook
-- idempotency ledger (stripe_processed_events). Neither is true, because 029 forced RLS on
-- all 59 tables and these ten have zero policies -- RLS with no policy denies every role
-- that does not bypass it. The grants back nothing.
--
-- WHY FIX AN INERT GRANT. This is the same two-sources-of-truth failure that
-- docs/qa/PRODUCTION_SCHEMA_RECONCILIATION.md was written for, pointing the other way:
-- there, "recorded as applied" did not mean "in force"; here, "granted" does not mean
-- "reachable". Both leave a reader with a false model of the database. And the safety here
-- rests entirely on the absence of a policy: the day someone adds one permissive policy to
-- notifications or push_tokens, every one of these grants becomes live at once, including
-- the DELETEs. Defence in depth means the grant should have to be added deliberately.
--
-- EFFECT AT RUNTIME: none. Every privilege revoked below is already unreachable for the
-- role it is revoked from, because RLS is enabled AND forced with zero policies on all ten
-- tables (verified 2026-09-12: 59/59 enabled, 59/59 forced). Revoking a privilege that
-- cannot be exercised cannot change behaviour. It only changes which mistake is loud: a
-- future missing grant fails with `permission denied`, where a future missing revoke fails
-- silently by exposing data.
--
-- SAFETY
--   * Nothing is dropped, no row is read or written, no policy is changed.
--   * `postgres` (table owner) and `service_role` both have rolbypassrls = true and are
--     not touched, so the Prisma / server path is unaffected.
--   * All ten tables hold 0 rows (pre-launch), so there is no data to lose access to.
--   * Reversible with a single GRANT per table.
--   * This does NOT touch workout_sessions (027 removed its grants deliberately; they stay
--     removed), does not reapply 017-029, and does not alter 023.
--
-- IF A CLIENT FLOW IS LATER ADDED for one of these tables, it needs two things, not one:
-- an RLS policy with an identity predicate (public.firebase_uid(), never auth.uid()) and
-- the matching grant. scripts/db-reconcile-schema.mjs check 7 enforces the pairing in both
-- directions -- remove the table from SERVER_ONLY_TABLES when that happens, rather than
-- re-granting while leaving it declared server-only.

--;;
do $server_only$
declare
  t text;
  -- The ten SERVER_ONLY_TABLES entries that still carried client grants. The six already
  -- clean (StravaConnection, StravaActivity, StravaActivityLap, StravaSegmentEffort,
  -- schema_migrations, _prisma_migrations) are deliberately omitted: 024 handled them and
  -- re-running a revoke on them would be noise.
  server_only text[] := array[
    -- Stripe webhook idempotency ledger; written by the webhook handler only.
    'stripe_processed_events',
    -- Spot moderation trail and audit log; no client report flow is exposed (021).
    'training_spot_reports',
    'training_spot_audit',
    -- Legacy 002-010 tables, pending the legacy-schema decision. Deny-all today.
    'sessions',
    'programs',
    'program_enrollments',
    'readiness_scores',
    'hrv_readings',
    'push_tokens',
    'notifications'
  ];
begin
  foreach t in array server_only loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    -- Guard: refuse to revoke on a table that is NOT already deny-all, because there the
    -- revoke would be a real behaviour change rather than a catalog correction.
    if not exists (
      select 1 from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname = t
         and c.relrowsecurity and c.relforcerowsecurity
    ) then
      raise exception
        'refusing to revoke on public.% : RLS is not both enabled and forced, so this would change behaviour rather than correct the catalog', t;
    end if;
    if exists (select 1 from pg_policies where schemaname = 'public' and tablename = t) then
      raise exception
        'refusing to revoke on public.% : it has policies, so it is not server-only -- remove it from SERVER_ONLY_TABLES instead', t;
    end if;

    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all privileges on table public.%I from anon', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all privileges on table public.%I from authenticated', t);
    end if;
  end loop;
end
$server_only$;

--;;
-- Restate the intent on the two tables where a stray grant would be worst, so the reason
-- survives in the database and not only in this file.
comment on table public.stripe_processed_events is
  'Server-only: Stripe webhook idempotency ledger. Written by the webhook handler via a rolbypassrls role. RLS forced with no policies and no client grants (024/030) -- do not grant anon/authenticated.';
comment on table public.training_spot_audit is
  'Server-only: moderation audit trail. Append-only from the server via a rolbypassrls role. RLS forced with no policies and no client grants (030) -- do not grant anon/authenticated.';
