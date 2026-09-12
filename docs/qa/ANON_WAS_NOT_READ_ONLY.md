# "anon is read-only" was not true

**Date:** 2026-09-12. Migration `032`, applied to production and verified.

This corrects a claim made by migration `028` and repeated in every report written since,
including the ones produced earlier today.

## The claim and the measurement

`028_anon_is_read_only.sql`, and every report after it, said this:

> `anon` INSERT / UPDATE / DELETE: **0 tables**. `anon` is read-only across `public`.

Measured on production, before `032`:

| role | TRUNCATE | TRIGGER | REFERENCES |
|---|---|---|---|
| `anon` | **28 tables** | 32 | 32 |
| `authenticated` | **42 tables** | 42 | 42 |

TRUNCATE is a write. It went uncounted because `028` and check 5 of
`scripts/db-reconcile-schema.mjs` both defined "write" as exactly three verbs — INSERT,
UPDATE, DELETE — and TRUNCATE is a fourth. So `anon`, the role behind the publishable key,
held the privilege to **empty 28 tables**, among them `payment_transactions`,
`user_subscriptions`, `stripe_connect_accounts`, `profiles`, `athlete_profiles`,
`coach_profiles` and `body_weight_entries`.

## Why RLS did not cover it

**PostgreSQL does not apply row level security to TRUNCATE.** The command is documented as not
subject to row security policies.

That is the part worth sitting with. Every protection in this schema is an RLS policy.
Migration `029` forced RLS on all 59 tables specifically so that *"every table forces RLS"*
would be an assertable invariant, and the reports lean on it heavily. Against TRUNCATE it
buys nothing at all. Neither role has `rolbypassrls` — both verified false — which is exactly
what makes the gap easy to miss: the roles look constrained, and for DML they genuinely are.

`TRIGGER` and `REFERENCES` are in the same category, and were revoked in the same pass:

- **TRIGGER** lets a role attach a trigger function to a table. That function then executes on
  other roles' writes, in their context — a privilege-escalation primitive, not a read.
- **REFERENCES** lets a role create a foreign key against a table, which can be used to probe
  for the existence of values the role cannot select.

Neither is subject to RLS either, and no PostgREST client ever needs any of the three.

## How exposed this was — not inflated

**It was not remotely exploitable.** PostgREST exposes no route to `TRUNCATE`,
`CREATE TRIGGER` or `ALTER TABLE … ADD FOREIGN KEY`, so the REST surface — the only surface the
publishable key reaches — could not issue any of them. Exercising these privileges requires a
direct PostgreSQL connection authenticating as `anon` or `authenticated`, which requires
database credentials, not the publishable key. The affected tables hold 0 rows
(`identity_profiles` holds 1); this is a pre-launch database.

So: **a latent privilege that should never have been granted, and a false statement in several
reports. Not an incident.** The same discipline that applies to the Strava tables applies here
— the misconfiguration was real, the exposure was not — and it should not be written up as
anything more.

## Where it came from

Supabase's default `grant all on tables` to `anon` and `authenticated` at table-creation time,
and `all` includes TRUNCATE, TRIGGER and REFERENCES. `024` revoked the *default privileges* for
`anon` on future tables. Nothing removed what the tables that already existed had inherited
beyond the three verbs anyone thought to check.

## Migration 032

```sql
revoke truncate, trigger, references on all tables in schema public from anon;
revoke truncate, trigger, references on all tables in schema public from authenticated;
alter default privileges in schema public revoke truncate, trigger, references on tables from anon;
alter default privileges in schema public revoke truncate, trigger, references on tables from authenticated;
```

No SELECT, INSERT, UPDATE or DELETE grant is touched, so every policy-gated client path keeps
working unchanged — including `authenticated`'s legitimate DML on the 42 tables whose policies
require `public.firebase_uid()`. `postgres` and `service_role` both have `rolbypassrls = true`
and are untouched. Nothing dropped, no row touched, no policy altered. The default-privileges
change is scoped to these three privileges only, so a later migration relying on inherited DML
still behaves as its author expected.

### Verified on production after applying

| | Before | After |
|---|---|---|
| `anon` TRUNCATE | 28 tables | **0** |
| `anon` TRIGGER | 32 | **0** |
| `anon` REFERENCES | 32 | **0** |
| `authenticated` TRUNCATE | 42 | **0** |
| `authenticated` TRIGGER | 42 | **0** |
| `anon` SELECT | 33 | **33** — unchanged |
| `authenticated` SELECT | 42 | **42** — unchanged |
| `authenticated` INSERT | 42 | **42** — unchanged |

Recorded in `schema_migrations` as `032_anon_is_read_only_includes_truncate.sql`.

## The check that closes the class

Check 5 in `db-reconcile-schema.mjs` now counts TRUNCATE, TRIGGER and REFERENCES as client
write privileges, for **both** client roles, alongside INSERT/UPDATE/DELETE. Before, it read
only `anon`'s three DML verbs — which is the whole reason this sat unnoticed through four
sessions of schema auditing.

### Executed, red then green

Against a real PostgreSQL 16.13, on a database built by the full `001 → 032` chain from empty:

| Step | Result |
|---|---|
| Chain `001 → 032` from scratch | **exit 0** |
| Reconcile after `032` | **0 errors**, 7 warnings |
| `grant truncate, trigger on payment_transactions to anon` + `grant truncate on profiles to authenticated` | **2 errors, exit 1** |
| Revoke both again | **0 errors, exit 0** |
| Legitimate client paths after `032` in the chain DB | anon SELECT 12, authenticated INSERT 32, anon TRUNCATE **0** |

Finding, verbatim:

```
[grants] payment_transactions: anon holds TRUNCATE/TRIGGER. None of these is subject to row
level security, so RLS does not constrain them and no PostgREST client needs them.
Revoke (see migration 032).
```

## The lesson, stated so it survives

Three sessions of this work have produced three versions of the same mistake, and they are
worth listing together because the pattern is the finding:

1. **"Recorded as applied" is not "in force."** A migration in `schema_migrations` whose effect
   is absent from the catalog. Caught by the registry/RLS/FORCE checks.
2. **"Granted" is not "reachable."** Ten server-only tables granting `authenticated` full CRUD
   that RLS made inert — a false statement in the catalog, one policy away from being live.
   Caught by check 7 (`030`).
3. **"Read-only" is not "not-INSERT-UPDATE-DELETE."** A gate that enumerates the verbs it knows
   about and silently passes the ones it does not. Caught by this (`032`).

All three are the same failure: an invariant asserted in prose, checked against a narrower
definition than the prose implied. The defence is not more prose — it is that each invariant be
expressed as a query whose scope is visible and whose exceptions are declared by name.

**And an invariant that rests on RLS should say what RLS does not cover.** That is the specific
thing none of the reports did, and it is why this one went unseen the longest.
