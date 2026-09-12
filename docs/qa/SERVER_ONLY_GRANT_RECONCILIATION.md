# "Granted" is not "reachable" — migration 030

**Date:** 2026-09-12. Applied to production (`beuiammeedpovdkmhluw`) and verified.

## The mirror image of the original lesson

`scripts/db-reconcile-schema.mjs` exists because of one sentence:
*"Recorded as applied is not the same as in force."* Sixteen tables in that script's
`SERVER_ONLY_TABLES` allowlist are declared, in the script's own words, as *"written only
through a privileged server path (postgres / service_role, both rolbypassrls)"*.

Measured on production today, only **6 of those 16** were true. The other ten still granted
DML to the roles behind the publishable key that ships in the web bundle:

| table | `anon` | `authenticated` |
|---|---|---|
| `stripe_processed_events` | SELECT | DELETE, INSERT, SELECT, UPDATE |
| `training_spot_audit` | — | DELETE, INSERT, SELECT, UPDATE |
| `training_spot_reports` | — | DELETE, INSERT, SELECT, UPDATE |
| `sessions` | SELECT | DELETE, INSERT, SELECT, UPDATE |
| `programs` | SELECT | DELETE, INSERT, SELECT, UPDATE |
| `program_enrollments` | SELECT | DELETE, INSERT, SELECT, UPDATE |
| `readiness_scores` | SELECT | DELETE, INSERT, SELECT, UPDATE |
| `hrv_readings` | SELECT | DELETE, INSERT, SELECT, UPDATE |
| `push_tokens` | SELECT | DELETE, INSERT, SELECT, UPDATE |
| `notifications` | SELECT | DELETE, INSERT, SELECT, UPDATE |

The six already clean are the four Strava tables and the two migration tables — the ones
`024` fixed. The pattern `024` established simply never reached the rest.

Read the table again as a reviewer would: the catalog said `authenticated` may **DELETE from
a moderation audit trail** and **from the Stripe webhook idempotency ledger**.

## Say plainly what this was and was not

**It was not an exposure.** `029` forced row level security on all 59 tables and these ten
have zero policies. RLS with no policy denies every role that does not bypass it, so not one
of those privileges could be exercised. Every one of the ten tables also holds **0 rows**.
Nothing was readable, nothing was writable, and no data existed to reach. This is not a
breach and must not be written up as one — the same correction that applies to the Strava
tables applies here.

**It was a false statement about the database, and a single point of failure.** The entire
safety of that state rested on the absence of a policy. Add one permissive policy to
`notifications` or `push_tokens` — an ordinary thing to do while building a feature — and
all ten tables' grants become live at once, DELETEs included, with nothing in the migration
chain to notice.

## Migration 030

Revokes all `anon` and `authenticated` privileges on exactly those ten tables.

**Runtime effect: none, provably.** Every privilege revoked was already unreachable for the
role it was revoked from. Revoking a privilege that cannot be exercised cannot change
behaviour. What changes is which mistake is loud: a future missing grant fails with
`permission denied`, where a future missing revoke fails silently by exposing data.

The loop refuses rather than guesses. Before touching a table it asserts RLS is both
**enabled and forced** and that the table has **zero policies** — if either premise has
stopped holding, it raises instead of quietly making a real behaviour change:

```
raise exception 'refusing to revoke on public.% : RLS is not both enabled and forced,
  so this would change behaviour rather than correct the catalog', t;
raise exception 'refusing to revoke on public.% : it has policies, so it is not
  server-only -- remove it from SERVER_ONLY_TABLES instead', t;
```

`postgres` (owner) and `service_role` both have `rolbypassrls = true` and are untouched, so
the Prisma/server path is unaffected. Nothing dropped, no row read or written, no policy
changed, reversible with one `GRANT` per table. It does not touch `workout_sessions` (027
removed its grants deliberately; they stay removed), does not reapply `017`–`029`, and does
not alter `023`.

Two `COMMENT ON TABLE` statements put the reason in the database itself, on the two tables
where a stray grant would be worst.

### Verified after applying

| Check | Result |
|---|---|
| Server-only tables holding any `anon`/`authenticated` privilege | **0 of 16** (was 10 of 16) |
| `service_role` DELETE on those tables | still granted — privileged path intact |
| Tables in `public` | 59 |
| RLS enabled / forced | **59 / 59** |
| `anon` INSERT/UPDATE/DELETE | **0 tables** |
| `anon` SELECT | **33 tables** (was 41 — the 8 vestigial grants are gone) |
| Supabase security advisors, ERROR | **0** |
| Supabase advisors, WARN | 1 — `auth_leaked_password_protection` (dashboard toggle, human) |
| Migrations recorded | **30**, newest `030_server_only_grants_match_declaration.sql` |

The 16 `rls_enabled_no_policy` advisories are **INFO** and are the intended fail-closed
design, not a finding: RLS on with no policy is deny-all, which is what a server-only table
should be.

## The check that makes it stick — `db-reconcile-schema.mjs` check 7

A migration fixes today. The seventh check fixes the class:

> **A table declared in `SERVER_ONLY_TABLES` must hold no `anon` or `authenticated` grant
> at all.** ERROR — the fix is a one-line revoke, and `024`/`030` set the precedent.

`CATALOG_SQL` now also reads `has_table_privilege('authenticated', …)` for SELECT, INSERT,
UPDATE and DELETE; the previous `grants` check only looked at `anon` write verbs, which is
why ten tables with full `authenticated` CRUD passed it cleanly.

### Executed, not asserted

Against a real PostgreSQL 16.13 with a fixture reproducing the production state — `anon`,
`authenticated` and a `bypassrls` `service_role`, 15 server-only tables RLS-forced with zero
policies and the grants intact, plus one well-formed client table (`activities`, two
`firebase_uid()` policies, `authenticated` SELECT):

| Step | Result |
|---|---|
| Before the revoke | **15 errors**, every one a `server-only` finding naming the exact grants |
| After the revoke | **0 errors, 0 warnings**, exit 0 |
| `service_role` DELETE on `notifications` | still true |
| `activities` (legitimate client table) | policies and grants untouched — the check does not over-reach |
| Regression: `grant insert on push_tokens to authenticated` | caught immediately, 1 error; clean again after revoking |

Sample finding, verbatim:

```
[server-only] push_tokens: declared server-only in SERVER_ONLY_TABLES, but the catalog
still grants authenticated INSERT. RLS-forced-with-no-policies makes it unreachable today,
so this is latent rather than live — one permissive policy turns all of it on. Revoke it
(see migration 030), or remove the table from SERVER_ONLY_TABLES and give it a policy with
an identity predicate.
```

## If a client flow is later added to one of these tables

It needs **two** things, not one: an RLS policy with an identity predicate
(`public.firebase_uid()`, never `auth.uid()`) **and** the matching grant. Check 7 enforces
the pairing in both directions — remove the table from `SERVER_ONLY_TABLES` when that
happens, rather than re-granting while leaving it declared server-only.

## Status

| | |
|---|---|
| `030` applied to production | **VERIFIED** — catalog re-read independently of the script |
| Check 7 | **VERIFIED** — executed against a real PostgreSQL 16, red then green |
| `030` run through the repo's own `db-apply-one-migration.mjs` | **NOT RUN** — no repository shell in this session |
| `030` run as part of a fresh `001 → 030` chain | **NOT RUN** |

It applies after `029`, which is what makes the enabled-and-forced guard pass, so chain
order is correct by construction — but that is reasoning, not a run. `test-integration`
executing the full chain against the CI Postgres service is what would prove it.

## One unrelated thing noticed while reading `024`

`024`'s closing comment still reads *"the leaked tokens must still be treated as compromised:
rotate the Strava client secret and force a re-authorization."* That is the session-1
overstatement the documentation was corrected for — `StravaConnection` holds 0 rows and
always has. The docs were fixed; this migration comment was not, and a migration file is
read long after a report is forgotten. It deserves the same one-line correction:
**rotation is precautionary hygiene, not incident response.**
