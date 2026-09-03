# P1-DATA exit gate

**Date:** 2026-09-01
**Prerequisite:** `P0-SEC = PASS`
**Do not start P1-AUTH until this gate PASSes.**

## Stamp

```
P1-DATA = PASS
NEXT_PHASE = P1-AUTH
```

Production launch remains **NO-GO** until HUMAN infra (keys, Firebase, legal) completes. Engineering gate â‰  production GO.

---

## Checklist

| # | Item | Result | Evidence |
| --- | --- | --- | --- |
| 1 | One canonical identity mapping | **PASS** | Firebase UID â†’ `identity_profiles` |
| 2 | One canonical Profile | **PASS** | `identity_profiles` + prefs/onboarding |
| 3 | One canonical Activity | **PASS** | `activities` (016); legacy `workout_sessions` deprecated |
| 4 | One canonical Telemetry model | **PASS** | SI columns + `telemetry` jsonb + route points |
| 5 | One canonical Readiness model | **PASS** | `readiness_snapshots` + `@fitconnect/utils` |
| 6 | One canonical XP event model | **PASS** | `ascend_events` (+ source_type/id) |
| 7 | One canonical Badge model | **PASS** | `badge_definitions` / `user_badges` |
| 8 | One canonical Streak model | **PASS** | `ascend_progress.streak_days` (rules not redesigned) |
| 9 | One canonical Squad model | **PASS** | `squad_*` (014) + activity link cols |
| 10 | Social for implemented features | **PASS** | posts/reactions; no Stories/Reels |
| 11 | Event ID strategy | **PASS** | `domain_events` + ascend `event_id` |
| 12 | RLS validated | **PASS** | authenticated role suites |
| 13 | IDOR validated | **PASS** | identity 5/5 + activities 3/3 |
| 14 | New migrations applied | **PASS** | `016` applied |
| 15 | 001â€“015 preserved | **PASS** | untouched |
| 16 | Android contracts updated | **PASS** | canonical id/units comments + `caloriesKcal` |
| 17 | Web contracts updated | **PARTIAL** | API + types PASS; `db/repository.ts` Prisma path remains |
| 18 | Watch contracts | **BLOCKED** | local `wear-*` ids until P7 sync â€” documented |
| 19 | No duplicate critical SoT | **PASS** | DB SoT; client XP dual **DEFERREDâ†’P4** (documented) |
| 20 | Offline semantics documented | **PASS** | `P1_DATA_CONTRACTS.md` |
| 21 | Realtime semantics documented | **PASS** | event names + `domain_events` |
| 22 | Regression | **PASS** | 2026-09-01: identity 5/5 + activities 3/3 + contracts 6/6 + Android 21/21 |

## Re-verification (2026-09-01)

```powershell
$env:P0_SEC_LIVE_RLS='1'
pnpm --filter @fitconnect/web exec vitest run tests/data/p1-data-contracts.test.ts tests/data/p1-data-activities-rls.integration.test.ts tests/integration/identity-rls.integration.test.ts
cd android; .\gradlew.bat :athlete:testDebugUnitTest :core:fitness:testDebugUnitTest
```

| Suite | Result |
| --- | --- |
| P1 contracts | 6/6 |
| P1 activities RLS (live) | 3/3 |
| P0 identity RLS (live) | 5/5 |
| Android athlete + fitness | PASS |

## Deferred (does not revoke PASS)

| Item | Phase |
| --- | --- |
| Remove Zustand gamification as any prod path / unify scoring | P4-ASCEND |
| Wear sessionId â†” activities.id live sync | P7-WATCH |
| Drop uuid legacy tables after zero refs | later + proven |
| Real GPS fill of route points | P2-GPS |
| Prisma model `@@map` onto all SQL tables | incremental |

## PENDING_HUMAN

- Real Supabase API keys (placeholders today)
- Firebase production third-party JWT
- Production Redis / webhook secrets
- Legal Terms/Privacy review
