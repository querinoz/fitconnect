# The migration chain had never been run

**Date:** 2026-09-12. Everything here was executed against a real PostgreSQL 16.13, from
scratch, with the branch's own runner — not reasoned about.

## What was missing

This repository has **two** sources of schema truth. `prisma/migrations` is applied by
`pnpm db:migrate:deploy`, which is what CI's `test-integration` job runs.
`supabase/migrations/001…031` is applied by `scripts/db-apply-supabase-migrations.mjs` —
and it had been applied to production **incrementally, by hand, over weeks**. It had never
been executed as a chain, anywhere, by anything.

So nothing was proving that a database built from `supabase/migrations` works, or that it
matches the production database those same files supposedly describe. Disaster recovery, a
new staging environment and a fresh developer machine all depended on an untested path.

## Result: it applies clean — and it produced a user-visible bug

```
apply 001_auth.sql (1 statements)
…
apply 031_public_read_surface_is_explicit.sql (2 statements)
SUPABASE_MIGRATIONS_OK                                   exit 0
```

All 31 files, 54 tables, on an empty PostgreSQL 16 with only the Supabase prerequisites
(`anon` / `authenticated` / `service_role`, an `auth` schema with `auth.uid()`, `pgcrypto`).
Reconciliation against the result: **0 errors, 7 warnings** — the same verdict production
gives.

But reading the catalog of that fresh database turned up a real divergence:

| table | read policy | qual | `anon` holds SELECT |
|---|---|---|---|
| `coach_profiles` | `coach_profiles_public_read` | `true` | **false** |
| `reviews` | `reviews_public_read` | `true` | **false** |

Both carry a deliberately identity-free public read policy — the coach marketplace's
shopfront and its public reviews. In a freshly built database **neither is reachable**. A
policy without a grant grants nothing, so a visitor holding the publishable key would see an
empty coach directory and no reviews.

### Why it only bites a rebuild

`coach_profiles` (002) and `reviews` (010) predate the Firebase identity migration and never
granted `anon` anything explicitly — they inherited it from Supabase's default privileges at
table-creation time. Migration `024` then closed that door on purpose:

```sql
alter default privileges in schema public revoke all on tables from anon;
```

Production still holds the old grants because its tables were created before `024` ran. Any
database built *after* `024` exists in the chain never receives them. **Production works, a
rebuild silently does not, and nothing in the chain said so.** `025_social_anon_read_only.sql`
already does this correctly for the social tables — it grants `anon` SELECT by name rather
than inheriting it. Two tables were simply missed.

## Migration 031

Grants `anon` SELECT on exactly `coach_profiles` and `reviews`. After it, every table in the
intended anonymous read surface is granted **by name in a migration**, and none of it depends
on default privileges.

SELECT only — `028` made `anon` read-only schema-wide and that is not relaxed. No policy is
added or widened; RLS stays enabled and forced on both tables. Idempotent, re-runnable, and a
**no-op on production**, where both grants already exist. Reversible with one `REVOKE` each.

It refuses rather than guesses: before granting, it asserts the table actually has an
identity-free read policy, so it can never widen the anonymous surface by accident.

```sql
raise exception 'refusing to grant anon SELECT on public.% : it has no identity-free read
  policy, so this would widen the anonymous surface rather than restore it', t;
```

## The anonymous read surface, measured and now fixed in place

The chain test forced the question nobody had asked: *what exactly can a visitor read?*
`anon` holds SELECT on **33** tables in production, which looks alarming — the list includes
`payment_transactions`, `stripe_connect_accounts`, `user_subscriptions`, `profiles` and
`body_weight_entries`.

**Not one of them is anonymously readable.** Every SELECT policy on all 33 except nine
requires `public.firebase_uid()`, so an anonymous read returns zero rows. Those 21 grants are
the same vestigial class that `030` revoked elsewhere. The genuinely public surface is exactly
nine tables:

| table | qualifier | why |
|---|---|---|
| `badge_definitions` | `true` | reference data, no user rows |
| `coach_profiles` | `true` | the marketplace's public shopfront |
| `reviews` | `true` | public reviews of coaches |
| `squad_challenges` | `true` | squads are public teams |
| `squad_contributions` | `true` | public leaderboard |
| `squad_members` | `true` | public roster |
| `community_posts` | `is_social_eligible` | column-gated, not identity-gated (020) |
| `post_comments` | parent post eligible, not soft-deleted | — |
| `post_reactions` | parent post eligible | — |

No payment, subscription, profile, device, notification or biometric table is anonymously
readable. The design is sound; it had just never been written down.

### Two new checks in `db-reconcile-schema.mjs` (now eight)

The script guarded **writes**: `UNPINNED_WRITE_SQL` catches an INSERT/UPDATE/ALL policy with
no identity predicate. Nothing guarded reads, so a `USING (true)` SELECT policy on the wrong
table was a silent public data feed that passed every check.

- **check 8, `public-read`** — a policy with no identity predicate on a table `anon` can read
  is an **ERROR** unless the table is in `PUBLIC_READ_TABLES` with a stated reason. Both halves
  are required: a `USING (true)` policy is harmless without a grant, and a grant is harmless if
  every policy demands an identity. The intersection is the real surface. A tenth public table
  is now an error rather than a discovery. The check also WARNs when a declared entry stops
  being readable — which is precisely how the `coach_profiles` / `reviews` bug surfaced.
- **check 9, `anon-read`** — one aggregated WARN naming every table whose `anon` SELECT grant
  no policy can satisfy. Inert, but the catalog overstates what a visitor can read. Whether to
  revoke is a product call, so it warns rather than fails.

## Wired into CI

`test-integration` gains one step: create a **separate** database on the same Postgres
service, install the Supabase prerequisites, apply `001 → 031` from scratch, then reconcile.
A separate database so it never interacts with the Prisma-built schema the integration tests
use.

The prerequisites matter more than they look. A plain `postgres:15-alpine` has no `anon`,
`authenticated` or `service_role`, and every GRANT/REVOKE in the chain is guarded by
`if exists (select 1 from pg_roles …)`. Without those roles the whole grant surface is skipped
and the reconciliation checks nothing — a green run proving less than it appears to. The step
creates them first.

### Correction: the runners were already fixed

An earlier version of this report claimed `db-apply-supabase-migrations.mjs` and
`db-apply-one-migration.mjs` hardcoded `ssl: { rejectUnauthorized: false }` and "could never
have run in CI", and two patched copies were delivered.

**That was wrong, and the error is worth naming.** Both files on `1780b097` already import
`postgresSslOption` from `scripts/lib/pg-ssl.mjs` and already pass it at the call site —
byte-for-byte identical to what was delivered as a fix. The claim came from reading the copies
staged into this session's uploads on 2026-09-10, two days stale, instead of re-reading the
branch. The chain run above was valid either way, because the local copy used the same
function; but the two script deliverables are **no-ops** and should be discarded.

The lesson is the session's own rule applied to itself: a stale local copy is not the
repository. Re-read the branch before asserting what it contains.

### Executed, not asserted

The step's `run:` script was extracted from the parsed YAML and **executed verbatim** against
a local PostgreSQL 16 with the URLs substituted:

| Check | Result |
|---|---|
| Heredoc terminator at column 0 after YAML block-scalar dedent | verified — `bash -n` clean |
| Step script executed end to end | **exit 0** |
| Chain `001 → 031` from an empty database | **exit 0**, 54 tables |
| Reconciliation on the result | **0 errors**, 7 warnings |
| Anonymous read surface, chain-built | **9 tables** — identical to production |
| Re-run with the branch's own `scripts/lib/pg-ssl.mjs` | **exit 0** |
| `ci-gate-lint.mjs` on the updated workflow | **0 errors** |

A YAML heredoc inside a block scalar is exactly the kind of thing that parses fine and then
fails on the runner, which is why it was run rather than reviewed.

## 030 and 031 on production

Both applied and verified. Production now:

| | |
|---|---|
| Migrations recorded | **31**, newest `031_public_read_surface_is_explicit.sql` |
| Tables / RLS enabled / RLS forced | 59 / **59** / **59** |
| `anon` INSERT, UPDATE, DELETE | **0 tables** |
| Server-only tables holding any client grant | **0 of 16** (was 10 of 16) |
| Anonymous read surface | **9 tables**, all declared |
| Supabase advisors, ERROR | **0** |
| Supabase advisors, WARN | 1 — `auth_leaked_password_protection` (dashboard, human) |

`031` was a no-op on production, as intended — its value is that a rebuild now matches.

## Not claimed

| | |
|---|---|
| The new CI step on GitHub | **NOT RUN** — it has been executed locally, not by a runner |
| `prisma/migrations` vs `supabase/migrations` agreement | **NOT CHECKED** — this proves the supabase chain is self-consistent and matches production's invariants; it does not compare the two chains table by table |
| The 5-table difference | expected, not investigated further: production's 59 minus the chain's 54 is exactly `StravaConnection`, `StravaActivity`, `StravaActivityLap`, `StravaSegmentEffort` and `_prisma_migrations`, all Prisma-managed |

The second row is the next real question for this area, and it is now cheap to ask: a database
built by each chain, with the catalogs diffed.
