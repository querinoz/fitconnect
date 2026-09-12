-- 029_force_rls_everywhere.sql
-- Makes "every table in public forces row level security" a schema-wide invariant.
--
-- 48 of 59 tables already did; the 11 that did not are the 002-010 legacy tables
-- (athlete_profiles, coach_profiles, profiles, reviews, sessions, programs,
-- program_enrollments, readiness_scores, hrv_readings, push_tokens, notifications).
-- ENABLE without FORCE leaves the table owner exempt from its own policies.
--
-- In this project the owner is `postgres`, which carries rolbypassrls = true, so it
-- bypasses RLS either way and nothing about the server path changes. The value is that
-- the invariant becomes assertable: scripts/db-reconcile-schema.mjs can now treat any
-- table without FORCE as drift instead of as one of eleven remembered exceptions. An
-- invariant with a list of exceptions is not an invariant.
--
-- Additive and reversible (ALTER TABLE ... NO FORCE ROW LEVEL SECURITY). No policy is
-- created or dropped, no grant changes, no row is touched.

--;;
do $force_rls$
declare
  r record;
begin
  for r in
    select c.oid::regclass as ident
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relrowsecurity
      and not c.relforcerowsecurity
  loop
    execute format('alter table %s force row level security', r.ident);
  end loop;
end
$force_rls$;
