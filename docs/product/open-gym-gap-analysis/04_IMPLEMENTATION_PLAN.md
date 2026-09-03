# openGym Gap â€” Implementation Plan

**Date:** 2026-09-01
**Branch:** `feat/elite-os-v2`

## Wave 0 â€” Audit (complete)

- [x] Reference inventory
- [x] FitConnect gap matrix
- [x] Priority matrix
- [x] License analysis
- [x] Architecture impact

## Wave 1 â€” Domain foundation (in progress)

| Deliverable | Path |
|-------------|------|
| Canonical strength types | `packages/types/src/strength.ts` |
| Progression engine (shared) | `packages/utils/src/strength/progression.ts` |
| Progression engine (Android) | `android/sports/.../progression/ProgressionEngine.kt` |
| 1RM estimator | Kotlin + TS |
| DB migration | `supabase/migrations/017_strength_workout_engine.sql` |
| Specs | `docs/product/workout-engine/*` |
| Unit tests | Kotlin + Vitest |

## Wave 2 â€” Execution UI (Android)

| Deliverable | Notes |
|-------------|-------|
| `StrengthWorkoutViewModel` | IDLEâ†’PREPâ†’ACTIVEâ†’PAUSEDâ†’FINISHED |
| `StrengthWorkoutScreen` | Elite OS neu-glass; large log button |
| Wakelock | `FLAG_KEEP_SCREEN_ON` when ACTIVE |
| Rest timer | Timestamp-based; optional notification |
| Wire Train FAB | Strength path from plan or free workout |

## Wave 3 â€” Plans & scheduling

| Deliverable | Notes |
|-------------|-------|
| Occurrence resolver | Weekly template â†’ today's workout |
| Reschedule API | Move occurrence only |
| Coach publish | `training_plans` Postgres |

## Wave 4 â€” Web parity

| Deliverable | Notes |
|-------------|-------|
| Analysis: body weight + 1RM | Read from Supabase |
| Coach plan builder persistence | Replace Zustand-only |
| Exercise library API | Search/filter |

## Wave 5 â€” Analytics & import

| Deliverable | Notes |
|-------------|-------|
| MuscleLoadEngine | Volume by muscle |
| Heatmap | Year training duration |
| Import pipeline v1 | FitNotes CSV first |

## Wave 6 â€” Integrations

| Deliverable | Notes |
|-------------|-------|
| ASCEND on strength complete | One `activity.completed` event |
| Squad contribution | No private health in payload |
| Watch sync | P7 dependency |

## Test gates (per wave)

- Unit: progression, 1RM, set model
- Integration: RLS on strength tables
- E2E: TEST 001â€“016 from master prompt
- Regression: P0-SEC + P1-DATA suites
