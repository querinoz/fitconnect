# P0-SEC test evidence

**Date:** 2026-08-20  
**Machine:** Windows, no Docker CLI, `DATABASE_URL` unset for Vitest (identity RLS skipped)

Commands below were actually run. Counts are from those runs, not from memory.

## Web unit / component / API

```
pnpm --filter @fitconnect/web test
```

Result: **371 passed**, **2 skipped**, 129 files passed, 1 file skipped.

Skipped:

- `tests/integration/identity-rls.integration.test.ts` (2) — `describe.skipIf(!DATABASE_URL)`

Security-relevant files that passed in that run include:

- `lib/fitness/strava-access.test.ts`
- `lib/integrations/strava/list-for-coach.test.ts`
- `lib/integrations/strava/coach-route.test.ts`
- `lib/integrations/strava/proxy-handler.test.ts`
- `lib/integrations/strava/route-auth.test.ts`
- `lib/integrations/strava/webhook-route.test.ts`
- `lib/integrations/strava/webhook-secrets.test.ts`
- `lib/integrations/status-route.test.ts`
- `lib/identity/account-delete.test.ts`
- `lib/security/rate-limit.test.ts`
- `lib/security/p0-sec-policies.test.ts`
- `lib/api/require-auth.prod.test.ts`
- `lib/notifications/push-register.test.ts`
- `lib/video/token-route.test.ts`
- `lib/ingestion/webhook-route.test.ts`
- `lib/stripe/webhook-route.test.ts`
- `tests/integration/readiness-compute.integration.test.ts`

## Strava package

```
pnpm --filter @fitconnect/strava-integration test
```

Result: **10 passed** (2 files). Includes banned path tests for explore / clubs / kudos / comments.

## Typecheck

```
pnpm --filter @fitconnect/web typecheck
```

Result: **PASS** (`tsc --noEmit`, exit 0).

## Lint

```
pnpm --filter @fitconnect/web lint
```

Result: **PASS** (exit 0). Remaining messages are pre-existing `@next/next/no-img-element` warnings on marketing/UI files, not P0-SEC routes.

## Build

```
pnpm --filter @fitconnect/web build
```

Result: **PASS**. Next.js 15.5.23 compiled; 89 pages generated. New/updated routes present: `/privacy`, `/terms`, `/settings/privacy`, `/api/v1/account/delete`, Strava webhook/status/coach, ingestion webhook, Stripe webhook.

## Android

```
cd android
.\gradlew.bat :foundation:test :core:fitness:test :community:test :athlete:compileDebugKotlin :coach:compileDebugKotlin :app:compileDebugKotlin
```

Result: **BUILD SUCCESSFUL**.

Covered modules:

- foundation unit tests (includes `deleteAccount` remote + LOCAL_DEMO refuse)
- `StravaPathAllowlistTest`
- `StravaSocialBarrierTest`
- athlete / coach / app debug Kotlin compile (deletion UI)

Per-test XML reports were not present under `android/*/build/reports` in this workspace snapshot; Gradle reported success (including a later UP-TO-DATE re-run).

## Live Postgres RLS

```
docker info
```

Result: Docker is **not** installed (`CommandNotFoundException`).

Identity RLS integration tests **did not execute**. Do not record live A→own / A→B / B→A / anon as PASS.

## Not run

| Check | Why |
| ----- | --- |
| Playwright `pnpm test:e2e` | Not executed this session (3 projects, starts `pnpm dev` on `:3001`) |
| `pnpm smoke` / `pnpm smoke:mobile` | Dev server not started for HTTP smoke |
| Hosted Supabase RLS | No production DB credentials used |
| Production URL QA | Out of scope; undeployed local diffs |

## Attacker vs happy path (unit/API)

| Case | Expected | Evidence |
| ---- | -------- | -------- |
| User A reads own Strava | allow | `strava-access.test.ts`, activity owner check |
| User B / Coach A / Coach B read User A Strava | deny | same + `list-for-coach` + coach route 403 |
| Unauthenticated status | 401 | `status-route.test.ts` |
| Status `athleteId=user-b` as user-a | 403 | same |
| Status body has no tokens | PASS | same |
| Banned Strava paths | 403 / null match | proxy + `index.test.ts` |
| Webhook missing verify token | 503 | `webhook-route.test.ts` |
| Webhook wrong challenge | 403 | same |
| Webhook valid challenge | 200 | same |
| Production enqueue without QStash/job secret | 503 | same + `webhook-secrets.test.ts` |
| Forged `upstash-signature` | deny | `route-auth.test.ts` |
| Ingestion missing/wrong secret | 503 / 401 | `ingestion/webhook-route.test.ts` |
| Stripe unsigned in production | 503 | `stripe/webhook-route.test.ts` |
| Rate limit unset in production | 503 | `rate-limit.test.ts` |
| Account delete unauthenticated | 401 | `account-delete.test.ts` |
| Account delete without `DELETE` | 400 | same |
| Account delete authenticated | 200 + `PENDING_HUMAN` | same |
| Push token for another user | 403 | `push-register.test.ts` |
| Video token as another participant | 403 | `token-route.test.ts` |

## Integrity

No RLS disabled. No service-role in client (`createSupabaseRlsClient` uses anon key + user bearer). LOCAL_DEMO remains isolated. Tests do not return private Strava payloads to third parties.
