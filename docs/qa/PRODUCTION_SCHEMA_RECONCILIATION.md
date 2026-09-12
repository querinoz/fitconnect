# Production Schema Reconciliation

## The rule

> **A migration recorded as applied is not evidence that its schema is in force.**

Six things must agree, and each is checked independently against the live catalog:

| # | What | Checked with |
|---|---|---|
| 1 | Migration registry matches the files on disk | `public.schema_migrations` vs `supabase/migrations/*.sql` |
| 2 | Row level security is **enabled** on every table in `public` | `pg_class.relrowsecurity` |
| 3 | Row level security is **forced**, so the owner cannot bypass it | `pg_class.relforcerowsecurity` |
| 4 | A table with RLS on has at least one policy, or is a declared server-only table | `pg_policies` |
| 5 | `anon` holds no INSERT / UPDATE / DELETE anywhere | `has_table_privilege` |
| 6 | No policy calls `auth.uid()`; this schema's identity is `public.firebase_uid()` | `pg_policies.qual` / `.with_check` |

Run it: `node scripts/db-reconcile-schema.mjs` (add `--json` for CI). Read-only; exits
non-zero on drift.

## Why the rule exists

Three separate drifts, all found on 2026-09-10, all invisible from the registry alone.

**1. Recorded, not in force.** `014_social_ascend_firebase.sql` was recorded as applied.
It drops and recreates `public.community_posts`, runs `enable row level security`, runs
`force row level security`, and creates three policies. Production had:

```
community_posts   relrowsecurity = false   relforcerowsecurity = true   policies = 0
```

RLS off with FORCE on is the tell — `FORCE` is inert while RLS is disabled, and that
combination cannot come from running `014`. Something disabled RLS and dropped the
policies after the fact. Meanwhile `anon` held SELECT and INSERT on the table, so the
community feed was world-readable and world-writable through PostgREST.

**2. In force, not recorded.** `017_strength_workout_engine.sql` was absent from the
registry, yet all nine of its tables and eleven of its policies were physically present —
applied by `scripts/apply-migrations-017-018.mjs` without bookkeeping. That is what made
the chain unrepairable: re-running `017` hit
`ERROR: policy "exercises_select" for table "exercises" already exists`, because the file
had `create policy` with no `drop policy if exists` guard, and so `017`–`021` could never
be applied or recorded.

**3. Applied, but semantically wrong.** `021` and the pre-Firebase tables use
`auth.uid()`. Supabase defines it as:

```sql
coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
         nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
```

A Firebase UID is text, not a uuid. Verified directly against production:

```
select 'SxYz9aBcDeFgH1234567890abcd'::uuid;
ERROR:  22P02: invalid input syntax for type uuid
```

So those policies do not filter rows — they raise, turning any client read of the table
into a 500. `012_firebase_identity.sql` states the rule in its own header:
*"Firebase UID is text (not uuid). Do NOT use auth.uid() for these tables."* The registry
cannot see a violation of that; the catalog can.

## State as of 2026-09-10, after remediation

Measured against `beuiammeedpovdkmhluw`:

| Check | Before | After |
|---|---|---|
| Tables in `public` | 59 | 59 |
| RLS disabled | **8** | **0** |
| RLS enabled but not forced | 11 | **0** |
| `anon` holds INSERT / UPDATE / DELETE | **36** | **0** |
| `anon` holds SELECT | 41 | 41 (unchanged — public reads still work) |
| Supabase security linter, ERROR level | 8 | **0** |
| Migrations on disk not recorded as applied | 7 | 0 |
| Policies calling `auth.uid()` | 6 | 6 (all legacy, client grants removed) |

`scripts/db-reconcile-schema.mjs` currently reports **0 errors, 6 warnings**.

## The six remaining warnings

`profiles`, `athlete_profiles` and `workout_sessions` still carry `auth.uid()` policies.
They are the pre-Firebase tables from `001`–`011`; `012` moved identity to a text UID and
`016` replaced `workout_sessions` with `public.activities` (same `shareable` /
`visibility` semantics, correct `firebase_uid()` policies).
`apps/web/lib/fitness/workout-session-policy.ts` says so in the source:
*"Legacy workout_sessions (uuid) is deprecated"*.

They were not rewritten, deliberately. Fixing `workout_sessions` properly means migrating
`user_id` from `uuid` to `text` — real work on a table with **0 rows** that nothing is
supposed to use. Instead, migrations `027` and `028` removed every client grant, so the
broken predicate is unreachable: a client now gets a clean `42501 permission denied`
rather than a `22P02`. The tables are listed in the script's `LEGACY_AUTH_UID_TABLES`
with that reason, which downgrades them to WARN — a **new** `auth.uid()` policy on any
other table still fails the gate.

That list is an accepted exception with a stated reason and an exit condition (drop or
migrate the table). It is not `continue-on-error`. Never add an entry to make the report
green.

## Wiring it into CI

The natural home is the `test-integration` job, which already runs a Postgres service and
applies migrations. After `pnpm db:migrate:deploy`:

```yaml
      - run: node scripts/db-reconcile-schema.mjs
        env:
          DIRECT_URL: postgresql://fitconnect:fitconnect_test@localhost:5433/fitconnect_test
```

That catches drift introduced *by a migration* before it reaches production. It does not
catch drift introduced *outside* migrations — which is what happened to `community_posts`
— so the script should also be run against production on a schedule, or before any
release gate, with `DIRECT_URL` pointing at the real database.

## Applying migrations without breaking the registry

1. Every policy statement gets `drop policy if exists <name> on <table>;` first. `016`,
   `019`, `020` and `022` already did; `017` and `021` did not, and that is the entire
   reason the chain jammed.
2. Guard `GRANT`/`REVOKE` behind `if exists (select 1 from pg_roles where rolname = ...)`
   so the file also applies on a Postgres without Supabase's roles — CI's is one.
3. Apply with `node scripts/db-apply-one-migration.mjs <file>`, which records the
   filename in `public.schema_migrations` in the same transaction.
4. If a migration is ever applied by another path, insert its filename into
   `public.schema_migrations` in the same session. An unrecorded apply is how `017` broke.
5. Re-run the reconciliation script. A green registry with red catalog checks is the
   failure mode this whole document exists to prevent.

## Verifying a repair before touching production

Everything above was reproduced on a throwaway PostgreSQL 16 before any production
statement ran:

```bash
apt-get install -y postgresql
initdb -D /tmp/pgdata -U postgres --auth=trust
pg_ctl -D /tmp/pgdata -o '-p 5599 -k /tmp/pgrun' start
# create the Supabase-equivalent roles (anon, authenticated, service_role) and an
# auth schema with auth.jwt() / auth.uid(), then apply 001..NNN in order,
# then apply the tail a SECOND time to prove idempotency.
```

The second pass is the point. `017` and `021` passed the first and failed the second, and
that is exactly the state a partially-applied production database is in.
