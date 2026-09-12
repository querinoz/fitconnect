-- 027_lock_down_legacy_workout_sessions.sql
-- Additive privilege narrowing. No table, policy or row is dropped.
--
-- public.workout_sessions is the pre-Firebase shape from 011. It is the only table
-- in the schema whose user_id is `uuid`; every table written since 012 uses `text`
-- (a Firebase UID). apps/web/lib/fitness/workout-session-policy.ts states it in the
-- source: "Legacy workout_sessions (uuid) is deprecated". public.activities (016)
-- is its replacement, with the same shareable/visibility semantics and RLS on
-- public.firebase_uid().
--
-- Its three policies still call auth.uid(), which Supabase defines as
--   coalesce(nullif(current_setting('request.jwt.claim.sub',true),''), ...)::uuid
-- A Firebase UID is not a uuid, so under a Firebase-issued JWT that cast raises
--   ERROR: 22P02: invalid input syntax for type uuid
-- Verified against production on 2026-09-10. Any PostgREST read of this table by a
-- signed-in athlete is therefore a 500, not a row filter. The table holds 0 rows.
--
-- Rather than invest in a deprecated table -- rewriting the policies would also mean
-- migrating user_id from uuid to text -- remove the client grants. RLS keeps the
-- server path (postgres / service_role, both rolbypassrls) working untouched, and a
-- clean 42501 permission-denied replaces a confusing 22P02. Re-granting is one line
-- if the table is ever revived.
--
-- The same call also drops the leftover `anon` write grants on the CURRENT tables.
-- RLS already denies those writes (every insert policy requires
-- user_id = public.firebase_uid(), which an anonymous session cannot satisfy), so
-- this is defence in depth, not a behaviour change: reads stay open, writes need a
-- signed-in identity at the grant layer as well as the policy layer.

--;;
do $legacy$
begin
  if to_regclass('public.workout_sessions') is null then
    return;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all privileges on table public.workout_sessions from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all privileges on table public.workout_sessions from authenticated';
  end if;
end
$legacy$;

--;;
comment on table public.workout_sessions is
  'DEPRECATED (011). Superseded by public.activities (016). user_id is uuid and the '
  'policies call auth.uid(), which raises 22P02 under a Firebase text UID. Client '
  'grants removed by 027; server-only via a rolbypassrls role. Do not build on this.';

--;;
do $anon_writes$
declare
  t text;
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    return;
  end if;
  foreach t in array array['activities','activity_route_points'] loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;
    execute format('revoke insert, update, delete, truncate on table public.%I from anon', t);
    execute format('grant select on table public.%I to anon', t);
  end loop;
end
$anon_writes$;
