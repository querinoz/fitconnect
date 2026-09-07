# P0-SEC test evidence

**Date:** 2026-08-29 (re-run)
**Prior run:** 2026-08-20
**Machine:** Windows · Docker CLI **absent** · `DATABASE_URL` present but **BYPASSRLS/superuser** (invalid for live RLS)

Commands below were actually run. Counts are from those runs.

## Web security regression (2026-08-29)

```
pnpm --filter @fitconnect/web exec vitest run \
  lib/fitness/strava-access.test.ts \
  lib/integrations/strava \
  lib/identity/account-delete.test.ts \
  lib/security/rate-limit.test.ts \
  lib/security/p0-sec-policies.test.ts \
  lib/ingestion/webhook-route.test.ts \
  lib/stripe/webhook-route.test.ts \
  lib/api/require-auth.prod.test.ts
```

Result: **14 files · 39 passed · 0 failed**.

## Status + auth prod (2026-08-29)

```
pnpm --filter @fitconnect/web exec vitest run \
  tests/integration/identity-rls.integration.test.ts \
  lib/security/p0-sec-policies.test.ts \
  lib/api/require-auth.prod.test.ts \
  lib/integrations/status-route.test.ts
```

Result: **11 passed · 2 skipped** (identity RLS skipped without `P0_SEC_LIVE_RLS=1`). EXIT 0.

## Strava package (2026-08-29)

```
pnpm --filter @fitconnect/strava-integration test
```

Result: **11 passed** (2 files). Includes banned-path table tests + client helper throw on explore/kudos/comments.

## Typecheck (2026-08-29)

```
pnpm --filter @fitconnect/web typecheck
```

Result: **PASS** (`tsc --noEmit`, exit 0).

## Android (2026-08-29)

```
cd android
.\gradlew.bat :core:fitness:test :community:test
```

Result: **BUILD SUCCESSFUL**. JUnit XML aggregate: **54 tests · 0 failures · 0 errors**.

Includes `StravaPathAllowlistTest`, `StravaSocialBarrierTest`, fitness store shareable filters.

**Compile fix this session:** missing `HttpIdentityRemote` import in `AppContainer.kt`.

## Live Postgres RLS (2026-08-29 — PASS)

```
node scripts/p0-sec-rls-probe.mjs
# DATABASE_ROLE_FOR_RLS_TEST=VALID (authenticated)

P0_SEC_LIVE_RLS=1 pnpm --filter @fitconnect/web exec vitest run tests/integration/identity-rls.integration.test.ts
```

Result: **5 passed**. Cert role: `authenticated`, `rolsuper=false`, `rolbypassrls=false`.
Project: `beuiammeedpovdkmhluw`. Details: `docs/security/P0_SEC_RLS_LIVE_CERTIFICATION.md`.

Default without `P0_SEC_LIVE_RLS`: suite skipped (does not invent PASS).

## Secret scan (2026-08-29)

Pattern scan of source/docs/scripts (no values printed). Hits were:

- Demo placeholders (`whsec_demo_fitconnect`, `sk_test_demo…` fixtures)
- Setup/validate **hints** (`PASTE_sk_live…`)
- Docs mentioning env var **names**

Action: redacted Stripe key-prefix fragments from `content/instagram/OPS_STATUS.md`.

No `google-services.json`, keystores, or `.env.local` committed in this session.

## Not run

| Check | Why |
| ----- | --- |
| Playwright e2e | Out of P0-SEC minimum; not executed |
| `pnpm smoke` | Dev server not started |
| Hosted non-privileged RLS | No such role available |
| Full `pnpm --filter @fitconnect/web test` | Scoped security suite used; prior full suite was 371 pass |

## Attacker matrix (unit/API — reconfirmed)

| Case | Expected | Result |
| ---- | -------- | ------ |
| Owner reads own Strava | allow | PASS |
| Peer / coach reads Strava | deny | PASS |
| Unauthenticated status | 401 | PASS |
| Status `athleteId=` other user | 403 | PASS |
| Banned Strava paths | 403 / throw | PASS |
| Webhook missing verify token | 503 | PASS |
| Production rate limit without Redis | 503 | PASS |
| Account delete unauthenticated | 401 | PASS |
| Live A→B identity under BYPASSRLS URL | refuse | PASS (fail-closed) |

## Integrity

LOCAL_DEMO remains isolated (`isDemoMode` only when `NEXT_PUBLIC_DEMO_MODE=true`). Service-role / Prisma is not treated as RLS evidence. Production remains **NO-GO**.
