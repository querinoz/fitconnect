-- 032_anon_is_read_only_includes_truncate.sql
-- Revokes TRUNCATE, TRIGGER and REFERENCES from anon and authenticated across `public`.
--
-- THIS CORRECTS AN ERROR IN THIS PROJECT'S OWN REPORTING, including in the reports written
-- alongside migrations 024-031. 028 is named `anon_is_read_only`, and every report since has
-- stated "anon INSERT / UPDATE / DELETE: 0 tables" and concluded that `anon` is read-only.
-- Measured on production (beuiammeedpovdkmhluw) 2026-09-12:
--
--   role            TRUNCATE     TRIGGER     REFERENCES
--   anon            28 tables    32 tables   32 tables
--   authenticated   42 tables    42 tables   42 tables
--
-- TRUNCATE is a write. It went uncounted because 028 and check 5 of
-- scripts/db-reconcile-schema.mjs both looked at exactly three verbs -- INSERT, UPDATE,
-- DELETE -- and TRUNCATE is a fourth. "anon is read-only" was therefore false: `anon` held the
-- privilege to empty 28 tables, among them payment_transactions, user_subscriptions,
-- stripe_connect_accounts, profiles, athlete_profiles, coach_profiles and body_weight_entries.
--
-- AND RLS DOES NOT STOP IT. PostgreSQL does not apply row level security to TRUNCATE; the
-- command is documented as not subject to row security policies. Every other protection in this
-- schema is an RLS policy -- 029 forced RLS on all 59 tables precisely so that "every table
-- forces RLS" would be an assertable invariant -- and against TRUNCATE all of it offers nothing.
-- Neither role has rolbypassrls (both verified false), which is exactly what makes the gap easy
-- to miss: the roles look constrained, and for DML they genuinely are.
--
-- TRIGGER and REFERENCES go in the same pass, for the same reason: neither is a read, neither is
-- subject to RLS, and neither is ever needed by a PostgREST client.
--   * TRIGGER lets a role attach a trigger function to a table. That function then executes on
--     other roles' writes, in their context -- a privilege-escalation primitive.
--   * REFERENCES lets a role create a foreign key against a table, which can be used to probe
--     for the existence of values the role cannot select.
--
-- HOW EXPOSED THIS WAS, STATED PLAINLY AND NOT INFLATED.
-- Not remotely exploitable through the publishable key. PostgREST exposes no route to TRUNCATE,
-- CREATE TRIGGER or ALTER TABLE ... ADD FOREIGN KEY, so the REST surface -- the only surface the
-- publishable key reaches -- could not issue any of them. Exercising these privileges needs a
-- direct PostgreSQL connection authenticating as `anon` or `authenticated`, which needs database
-- credentials, not the publishable key. The affected tables also hold 0 rows (1 in
-- identity_profiles), this being a pre-launch database.
--
-- So: a latent privilege that should never have been granted, and a false statement in several
-- reports. NOT an incident, and not to be written up as one. The same discipline applies here as
-- to the Strava tables: the misconfiguration was real, the exposure was not.
--
-- WHERE IT CAME FROM. Supabase's default `grant all on tables` to `anon` and `authenticated` at
-- table-creation time, and `all` includes TRUNCATE, TRIGGER and REFERENCES. 024 revoked the
-- default privileges for `anon` on future tables, but nothing removed what the tables that
-- already existed had inherited beyond the three DML verbs anyone thought to check.
--
-- SAFETY
--   * No SELECT, INSERT, UPDATE or DELETE grant is touched. Every policy-gated client path keeps
--     working unchanged, including `authenticated`'s legitimate DML on the 42 tables whose
--     policies require public.firebase_uid(). Verified after applying: anon SELECT 33 tables,
--     authenticated SELECT 42, authenticated INSERT 42 -- all unchanged.
--   * `postgres` (owner) and `service_role` both have rolbypassrls = true and are untouched, so
--     the Prisma / server path is unaffected.
--   * Nothing is dropped, no row is read or written, no policy is altered.
--   * Reversible with a single GRANT, though there is no reason to reverse it.
--   * The default-privileges change is scoped to these three privileges only, so a later
--     migration that relies on inherited DML still behaves as its author expected.
--
-- THE CHECK THAT CLOSES THE CLASS. Check 5 in scripts/db-reconcile-schema.mjs now counts
-- TRUNCATE, TRIGGER and REFERENCES as client-write privileges alongside INSERT/UPDATE/DELETE. A
-- gate that defines "write" as three verbs will keep missing the fourth.

--;;
revoke truncate, trigger, references on all tables in schema public from anon;

--;;
revoke truncate, trigger, references on all tables in schema public from authenticated;

--;;
-- Future tables must not inherit them either.
alter default privileges in schema public revoke truncate, trigger, references on tables from anon;

--;;
alter default privileges in schema public revoke truncate, trigger, references on tables from authenticated;
