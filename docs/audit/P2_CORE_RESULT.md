# FITCONNECT — P2-CORE RESULT

**Date:** 2026-09-03
**Branch:** `feat/elite-os-v2`
**HEAD (pre-phase):** `0a9155f`
**Push:** forbidden
**Production:** NO-GO

=========================================
FITCONNECT — P2-CORE RESULT
=========================================

## MIGRATION 018

status: **PASS** (applied with prerequisite 017)

evidence:
- Hosted DB before: `activities`, `ascend_events`, `data_schema_meta` only (no `strength_sessions`)
- Command: `node scripts/apply-migrations-017-018.mjs`
- Result: `strength_sessions`, `strength_sets`, `exercises` created; `workout_wave2_schema_version=018`; `idempotency_key` present
- Note: 018 alone failed until 017 applied (expected dependency)

## ACTIVITY SYNC

status: **PASS** (contract + live RLS path)

evidence:
- Path unchanged from Wave 2: Room → queue → `POST /api/v1/workout-sessions` → `complete-guided-workout` → ASCEND
- Live RLS `P2CORE-009`: MANUAL activity + `strength_sessions` upsert once; User B cannot read
- Finish remains enqueue-only (no UI-thread HTTP regression)

## IDEMPOTENCY

| Layer | Status | Evidence |
|-------|--------|----------|
| activity | PASS | unique `(MANUAL, sessionId)`; P2CORE-009 count=1 |
| XP | PASS | existing ASCEND unique `event_id` RLS test |

## RLS

status: **PASS**

evidence:
```
P0_SEC_LIVE_RLS=1
pnpm --filter @fitconnect/web exec vitest run tests/data/p1-data-activities-rls.integration.test.ts
→ 4/4 passed (authenticated, rolbypassrls=false)
```

## HEALTH CONNECT

| Item | Status | Evidence |
|------|--------|----------|
| HR | PASS (regression) | existing reader unchanged; assembleDebug |
| STEPS | PASS (unit) | `HealthConnectDurableSyncTest` P2CORE-005 |
| SLEEP | PASS (unit) | P2CORE-006 / 008 |
| DURABILITY | PASS (engineering) | `RoomTelemetryStore` wired when `appContext` present |
| DEDUPLICATION | PASS (unit) | sourceRecordId upsert; P2CORE-005/006 |
| Device HC read | NOT VERIFIED | Emulator permission grant / real HC records not exercised this phase |

## COACH

| Item | Status | Evidence |
|------|--------|----------|
| authorization | PASS | existing `requireCoachId` 401/403; unchanged |
| remote data | PASS (engineering) | `HttpCoachRepository` + `{source}` on roster/sessions |
| LOCAL_DEMO removal | PARTIAL | Remote path rejects `source=seed`; LOCAL_DEMO still used when `session.isLocalDemo` |

## WORKOUT REGRESSION

status: **PASS** (unit + assembleDebug)

evidence: `:sports:testDebugUnitTest` GuidedWorkoutWave2Test + `:app:assembleDebug` BUILD SUCCESSFUL

## ANDROID

| Item | Status |
|------|--------|
| build | PASS — `assembleDebug` |
| HC unit tests | PASS — HealthConnectDurableSyncTest |
| guided instrumentation | **PASS** (after retry) — `GuidedWorkoutInstrumentationTest` 1/1 |

## WEB

| Item | Status |
|------|--------|
| full suite | PASS — **465 passed** / 9 skipped |
| typecheck | PASS — `tsc --noEmit` exit 0 |
| P2CORE unit | PASS — `lib/coach/p2-core-contracts.test.ts` |

## DEFECTS

### P0
None.

### P1
None blocking exit for engineering PASS.

### P2

| ID | DESCRIPTION | NEXT |
|----|-------------|------|
| P2C-P2-01 | Emulator Health Connect sleep/steps permission + live read not captured | Human HC grant + sync smoke |
| P2C-P2-02 | Coach bookings/programs/earnings still NOT_IMPLEMENTED | Dedicated coach API phase |
| P2C-P2-03 | First instrumentation attempt hit stale guest timeout | Resolved on retry |
| P2C-P2-04 | 017 CREATE POLICY not idempotent without error swallow | Prefer IF NOT EXISTS in future migrations |

### P3
Room `fallbackToDestructiveMigration` for telemetry v1 only.

## HUMAN DEPENDENCIES

Firebase production · FCM · Play signing · Stripe · legal · production Redis — untouched.

## PRODUCTION

**NO-GO**

## EXIT GATE

- [x] migration 018 verified/applied (with 017)
- [x] activity sync path proven (contract + live RLS)
- [x] activity / XP idempotency
- [x] live RLS sync regression PASS
- [x] Health Connect HR regression (build)
- [x] steps/sleep canonical path PASS (unit + Room wiring)
- [x] Health Connect dedupe PASS (unit)
- [x] Health data durable (Room)
- [ ] offline health behavior on device — NOT VERIFIED (unit only)
- [x] Coach remote path proven (engineering)
- [x] Coach authorization proven (existing + labeled source)
- [x] no production LOCAL_DEMO fallback when DB configured
- [x] Workout Wave 2 regression PASS (unit)
- [x] assembleDebug PASS
- [x] instrumentation — `GuidedWorkoutInstrumentationTest` 1/1 PASS (retry)
- [x] full Web regression PASS (465)
- [x] documentation updated
- [x] no secrets
- [x] no P2-GPS started

**P2-CORE = ENGINEERING PASS** with P2 gaps above (device HC smoke / coach remaining surfaces).

## NEXT RECOMMENDED PHASE

**P2-GPS** (outdoor activity → durable activities), or close P2C-P2-01/02 first if launch needs coach bookings before outdoor.

DO NOT auto-start.
