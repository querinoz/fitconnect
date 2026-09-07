# P0-SEC exit gate

**Date:** 2026-08-29
**Authoritative scope:** [`docs/master-plan/12_SECURITY_AUDIT.md`](../master-plan/12_SECURITY_AUDIT.md)
**Exit criteria:** [`docs/master-plan/22_PHASE_EXIT_GATES.md`](../master-plan/22_PHASE_EXIT_GATES.md) § P0-SEC
**Live RLS cert:** [`docs/security/P0_SEC_RLS_LIVE_CERTIFICATION.md`](./P0_SEC_RLS_LIVE_CERTIFICATION.md)

## Stamp

```
P0-SEC = PASS
NEXT_PHASE = P1-DATA
```

**Do not start P1-DATA automatically.** Production remains **NO-GO** until HUMAN infra (Firebase keys, real Supabase API keys, Redis/webhooks, legal) is complete.

---

## Checklist (evidence-backed)

| # | Gate item | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Strava not readable by third parties | **PASS** | unit/API + Android social barrier |
| 2 | Web allowlist = Android bans | **PASS** | strava-integration **11/11** |
| 3 | Status route auth / no prod `a-ines` | **PASS** | status + require-auth prod tests |
| 4 | Two-user Postgres IDOR | **PASS** | live suite **5/5** under `authenticated` (`DATABASE_ROLE_FOR_RLS_TEST=VALID`) |
| 5 | Account deletion authorized path | **PASS** | API tests; Firebase Auth delete **PENDING_HUMAN** |
| 6 | Privacy / Terms real routes | **PASS** | `/privacy` `/terms`; legal copy **PENDING_HUMAN** |
| 7 | Webhook fail-closed | **PASS** | Strava/ingestion/Stripe tests |
| 8 | Distributed rate limiting | **PASS** | Upstash; prod w/o Redis → 503 |
| 9 | Secret exposure audit | **PASS** | no live secrets committed |
| 10 | Regression | **PASS** | web sec **42/42**; strava pkg **11/11** |

---

## Live RLS context (required)

```
PROJECT_REF=beuiammeedpovdkmhluw
CERT_ROLE=authenticated
rolsuper=false
rolbypassrls=false
DATABASE_ROLE_FOR_RLS_TEST=VALID
```

Login role `postgres` (BYPASSRLS) is **admin/migration only** — never used as PASS evidence.

Command:

```powershell
$env:P0_SEC_LIVE_RLS="1"
# DIRECT_URL / DATABASE_URL from .env.local (not printed)
pnpm --filter @fitconnect/web exec vitest run tests/integration/identity-rls.integration.test.ts
```

---

## PENDING_HUMAN (non-blocking for this engineering PASS)

1. Replace placeholder Supabase anon / service_role keys with project keys
2. Firebase production + third-party Supabase JWT wiring
3. Firebase Auth user deletion (Admin SDK)
4. Counsel review of `/privacy` `/terms`
5. Production Upstash / QStash / webhook secrets

## Related docs

- [`P0_SEC_TEST_EVIDENCE.md`](./P0_SEC_TEST_EVIDENCE.md)
- [`P0_SEC_FINAL_REPORT.md`](./P0_SEC_FINAL_REPORT.md)
- [`P0_SEC_RLS_LIVE_CERTIFICATION.md`](./P0_SEC_RLS_LIVE_CERTIFICATION.md)
