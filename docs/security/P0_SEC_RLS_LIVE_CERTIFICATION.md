# P0-SEC live RLS certification

**Date:** 2026-08-29
**Supabase project:** `beuiammeedpovdkmhluw`
**Dashboard:** https://supabase.com/dashboard/project/beuiammeedpovdkmhluw
**Host used for certification:** `db.beuiammeedpovdkmhluw.supabase.co` (DIRECT_URL)

## Absolute rule honored

A privileged login role (**postgres** with `rolbypassrls=true`) is **not** the certification context.

Certification context:

```
SET LOCAL ROLE authenticated
+ request.jwt.claim.sub = <uid>
```

| Check | Value |
| ----- | ----- |
| `current_user` (cert) | `authenticated` |
| `session_user` (login) | `postgres` |
| `rolsuper` (cert) | `false` |
| `rolbypassrls` (cert) | `false` |
| `DATABASE_ROLE_FOR_RLS_TEST` | **VALID** |

Probe: `node scripts/p0-sec-rls-probe.mjs`
Live suite: `P0_SEC_LIVE_RLS=1 pnpm --filter @fitconnect/web exec vitest run tests/integration/identity-rls.integration.test.ts`

Result: **5 passed / 0 failed** (2026-08-29).

---

## 1. Project connectivity

| Item | Status |
| ---- | ------ |
| Existing project (no new project) | **CONNECTED** `beuiammeedpovdkmhluw` |
| `NEXT_PUBLIC_SUPABASE_URL` | PRESENT → `*.supabase.co` host matches project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | PRESENT but **placeholder-shaped** (not a JWT) — Data API client **PENDING_HUMAN** |
| `SUPABASE_SERVICE_ROLE_KEY` | PRESENT but **placeholder-shaped** — admin API **PENDING_HUMAN** |
| `DATABASE_URL` / `DIRECT_URL` | PRESENT (Postgres pooler + direct) — used for migrations + RLS probe |
| Firebase web env | MISSING — production third-party JWT wiring **PENDING_HUMAN** (separate from this RLS cert) |

No credential values are printed in this document.

---

## 2. Clients (no duplicates created)

| Client | File | Scope | Privileged? |
| ------ | ---- | ----- | ----------- |
| Browser | `apps/web/lib/auth/supabase/client.ts` | anon + user cookies | No |
| Server (cookie) | `apps/web/lib/auth/supabase/server.ts` | anon | No |
| RLS user-scoped | `apps/web/lib/identity/supabase-rls-client.ts` | anon + Firebase bearer | No — **canonical user data path** |
| Admin | `apps/web/lib/db/supabase-admin.ts` | service_role | **Yes** — server-only |
| Prisma | `apps/web/lib/db/client.ts` | DATABASE_URL | **Yes** — trusted server; **not** RLS evidence |
| Android | config flags expect SUPABASE_URL/ANON | user | No (when configured) |

Identity tables are authorized by **RLS + `firebase_uid()`**, not by client-supplied ids alone.

Canonical identity tables:

- `identity_profiles.id` = Firebase UID (text)
- `user_roles.uid` → profile
- Legacy `public.profiles` (uuid → `auth.users`) remains **legacy** and is **not** the P0-SEC Firebase identity path

---

## 3. Schema / migrations

`scripts/db-apply-supabase-migrations.mjs` against DIRECT_URL:

All `001`–`015` reported **skip** (already applied) → `SUPABASE_MIGRATIONS_OK`.

Identity FORCE RLS tables (probe):

| Table | RLS | FORCE | Policy count |
| ----- | --- | ----- | ------------ |
| `identity_profiles` | on | on | 4 |
| `user_roles` | on | on | 3 |
| `user_preferences` | on | on | 4 |
| `onboarding_state` | on | on | 4 |
| `account_deletion_requests` | on | on | 2 |
| `workout_sessions` | on | on | 3 |
| `profiles` (legacy) | on | **off** | 2 |

---

## 4. Grants (summary)

- `identity_*` / `user_roles` / `onboarding_state` / `account_deletion_requests`: **no anon grants**
- `authenticated`: DML present (Supabase often grants broad table privileges; **RLS still applies**)
- `service_role`: full DML (BYPASSRLS role — admin only)
- Legacy `profiles`: anon still has table grants — mitigated by `auth.uid()` policies; **FORCE RLS not on** → residual hardening for P1-DATA, not used for this cert

GRANT ≠ RLS. Certification used RLS under `authenticated`.

---

## 5. Role security

| Attempt | Expected | Result |
| ------- | -------- | ------ |
| B insert own `admin` role | DENY | PASS (constraint/policy) |
| B insert role row for A | DENY | PASS |
| Client self-promote | DENY | PASS |

---

## 6. IDOR matrix (live)

Synthetic users: `rls_test_user_a`, `rls_test_user_b` (cleaned after suite).

| Case | Expected | Result |
| ---- | -------- | ------ |
| A → read A | ALLOW | PASS |
| A → read B | DENY | PASS |
| B → read A | DENY | PASS |
| A → update A | ALLOW | PASS |
| A → update B | DENY (0 rows) | PASS |
| B → update A | DENY (0 rows) | PASS |
| empty sub → list | DENY (0 rows) | PASS |
| A → delete B | DENY | PASS |
| A → delete A | ALLOW | PASS |
| B → delete B | ALLOW | PASS |

---

## 7. Remediations this session

1. Reworked live harness to certify under `SET LOCAL ROLE authenticated` (not login BYPASSRLS).
2. Opt-in `P0_SEC_LIVE_RLS=1`; refuse INVALID_BYPASS on cert role.
3. Probe + inventory scripts: `scripts/p0-sec-rls-probe.mjs`, `scripts/p0-sec-rls-inventory.mjs`.
4. Avoided recreating `auth.jwt()` (Supabase-owned schema).

---

## 8. Final result

| Gate | Result |
| ---- | ------ |
| SUPABASE_PROJECT | **CONNECTED** |
| SCHEMA_AUDIT | **PASS** (migrations applied; identity FORCE RLS present) |
| RLS | **PASS** |
| IDOR | **PASS** |
| ROLE_SECURITY | **PASS** |
| RLS_TEST_CONTEXT | **VALID** |
| P0-SEC (this cert) | Unblocks live RLS requirement |

Remaining **PENDING_HUMAN** (do not contaminate this PASS):

- Paste real anon / service_role keys (placeholders today)
- Firebase production third-party identity config
- Firebase Auth account delete
- Legal review of Terms/Privacy
- Production Redis / webhook secrets

**Production launch remains NO-GO** until HUMAN infra is complete — but **P0-SEC engineering exit can PASS**.
