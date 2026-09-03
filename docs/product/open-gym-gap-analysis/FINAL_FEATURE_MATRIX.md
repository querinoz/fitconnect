# Final Feature Matrix â€” Source of Truth

**Date:** 2026-09-01
**Branch:** `feat/elite-os-v2`
**Reference:** openGym (functional only â€” no code copied, AGPL-safe)
**Rule:** A row is **not** â€œdoneâ€ because a file or screen exists with a matching name. **Status** requires evidence column.

---

## How to read this document

| Status | Meaning |
|--------|---------|
| **EXISTS** | End-to-end or production path verified |
| **IMPLEMENTED** | Domain/engine shipped + unit tests pass; UI may still be missing |
| **PARTIAL** | Schema, demo, or metadata only â€” **not** a complete user flow |
| **PLANNED** | Spec/docs only |
| **MISSING** | No meaningful implementation |
| **REJECTED** | Incompatible with FitConnect product |

**Verified?** = `YES` only when tests or live flow evidence is cited. `NO` = name/file exists but flow incomplete.

---

## FitConnect strategic model (target)

```
                         FITCONNECT ELITE OS
                                 â”‚
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â†“                       â†“                       â†“
    PERFORMANCE              COACHING                 SOCIAL
         â”‚                       â”‚                       â”‚
  Guided Workout            Programs                  Feed
  Progression               Roster                    Community
  1RM / RPE                 Analytics                 Squad
  Muscle Map                Sessions                  Sharing
         â”‚                       â”‚                       â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â†“
                              ASCEND
                    XP Â· Level Â· Badge Â· Streak
                                 â†“
                           PHONE + WATCH
```

openGym contributes primarily the **training motor** (left column). FitConnect wraps it in coaching, social, ASCEND, and wear â€” without cloning openGym.

---

## Priority summary (your lens)

| Priority | Capability | FitConnect pillar | Status now | Next wave |
|----------|------------|-------------------|------------|-----------|
| **P0/P1** | Guided Workout | Performance | **PLANNED** (spec + FSM only) | **Wave 2** â€” transforms dashboard â†’ real training tool |
| **P1** | Progression Engine | Performance â†’ ASCEND | **IMPLEMENTED** (TS + Kotlin, 11 tests) | Wire into execution UI + explain panel |
| **P1** | Supersets + timed sets | Performance | **PARTIAL** (schema + coach metadata) | Execution engine Wave 2 |
| **P1** | Exercise model | Performance + Coach | **PARTIAL** (types + `exercises` table 017) | Catalog seed + search UI |
| **P1** | Offline workout | Performance | **PLANNED** (queue semantics in P1-DATA docs) | `DurableSyncQueue` + Room decision |
| **P1** | Idempotent completion | ASCEND | **EXISTS** (P1-DATA `ascend_events` PK) | Wire strength finish â†’ `activity.completed` |
| **P2** | 1RM | Analysis | **IMPLEMENTED** (estimator only) | Analysis charts + source set UI |
| **P2** | RPE/RIR | Performance + Coach | **PARTIAL** (post-workout web; per-set schema) | Per-set log in guided workout |
| **P2** | Muscle Map | Analysis | **PLANNED** (MuscleLoadEngine spec) | Elite OS visual â€” original assets |
| **P2** | Heatmap | Analysis / ASCEND | **PLANNED** | Year training duration view |
| **P2** | Import/Export | Onboarding | **PLANNED** (pipeline spec) | FitNotes CSV first |
| **P2** | Equipment filter | Discover / Builder | **PARTIAL** (`equipment[]` on model) | Composable filter UI |
| **P2** | Custom exercises | Athlete + Coach | **PARTIAL** (`is_custom` + RLS) | Create flow UI |
| **P2** | Rest notifications | Performance | **PLANNED** | FCM + `REST_TIMER` type |

---

## Full matrix (reference Aâ€“AE)

| ID | Feature | Pillar | Priority | Reference | Before | After (2026-09-01) | Status | Verified? | Platform | Data | Test | Next phase |
|----|---------|--------|----------|-----------|--------|-------------------|--------|-----------|----------|------|------|------------|
| D | Guided workout | Performance | P0/P1 | openGym | MISSING | FSM in spec; `strength_sessions` in 017 | **PLANNED** | NO | Android â†’ Web | 017 | â€” | Wave 2 UI |
| H | Progression engine | Performance | P1 | openGym | MISSING | `ProgressionEngine` TS+Kotlin | **IMPLEMENTED** | YES | All | `progression_states` | 11 unit | Execution UI |
| I | Progression explain | Performance | P1 | openGym | MISSING | `rationale` on every target | **IMPLEMENTED** | YES | All | â€” | unit | Show in PREP screen |
| F | Supersets | Performance | P1 | openGym | Metadata in coach | `superset_group_id` | **PARTIAL** | NO | All | 017 | â€” | Pair rest logic |
| G | Timed sets | Performance | P1 | openGym | Template only | `target_time_sec` / `actual_time_sec` | **PARTIAL** | NO | All | 017 | â€” | Work/rest timers |
| Q | Exercise model / library | Perf + Coach | P1 | openGym | ~14 web / ~13 Android seed | `CanonicalExercise` + `exercises` | **PARTIAL** | NO | All | 017 | â€” | Catalog + search |
| â€” | Offline workout | Performance | P1 | openGym | In-memory stores | Queue semantics documented | **PLANNED** | NO | Android | queue | â€” | Wave 2â€“3 |
| â€” | Idempotent completion | ASCEND | P1 | FitConnect | P1-DATA | `activity.completed` â†’ one XP | **EXISTS** (data layer) | YES | All | `ascend_events` | RLS 3/3 | Wire strength finish |
| O | Estimated 1RM | Analysis | P2 | openGym | DEMO static charts | `OneRepMaxEstimator` Epley | **IMPLEMENTED** | YES | All | â€” | TEST 011 | Analysis UI |
| P | RPE / RIR | Perf + Coach | P2 | openGym | Post-workout modal only | Per-set columns in 017 | **PARTIAL** | NO | Web/Android | `strength_sets` | API partial | Per-set in workout |
| X | Muscle map | Analysis | P2 | openGym | MISSING | `MUSCLE_LOAD_SPEC.md` | **PLANNED** | NO | Analysis | â€” | â€” | Wave 3 |
| W | Activity heatmap | Analysis/ASCEND | P2 | openGym | Other heatmaps only | â€” | **PLANNED** | NO | Web | â€” | â€” | Wave 3 |
| U/V | Import / Export | Onboarding | P2 | openGym | MISSING / endurance only | `IMPORT_EXPORT_SPEC.md` | **PLANNED** | NO | Web | â€” | â€” | Wave 4 |
| R | Equipment filter | Discover | P2 | openGym | Field on definition | `equipment[]` | **PARTIAL** | NO | All | 017 | â€” | Builder UI |
| S | Custom exercises | Athlete/Coach | P2 | openGym | CUSTOM enum | `is_custom` + owner RLS | **PARTIAL** | NO | All | 017 | â€” | Create flow |
| Y | Rest notifications | Performance | P2 | openGym | FCM gateway | `REST_TIMER` in spec | **PLANNED** | NO | Android | FCM | â€” | Wave 4 |
| B | Weekly plan | Coach | P1 | openGym | Demo plan-builder | `training_plans` + routines | **PARTIAL** | NO | Coach/Web | 017 | â€” | Postgres wire |
| C | Rescheduling | Coach | P1 | openGym | MISSING | `workout_occurrences` | **PARTIAL** | NO | All | 017 | â€” | Occurrence API |
| A | Body weight | Performance | P2 | openGym | Demo `bodyWeightKg` | `body_weight_entries` | **PARTIAL** | NO | Profile | 017 | â€” | Chart + goal |
| J/K/L/M | Failed reps, stall, BW mode, per-side | Performance | P1 | openGym | MISSING | Engine rules | **IMPLEMENTED** | YES | All | â€” | unit | â€” |
| N | Cardio sets | Performance | P2 | openGym | Endurance `LiveActivityEngine` | `DISTANCE` mode in schema | **PARTIAL** | NO | Android | 017 | â€” | Link telemetry |
| T | Plan sharing | Social/Coach | P3 | openGym | Realtime diff only | Export spec | **PLANNED** | NO | Web | â€” | â€” | Wave 4 |
| E | Keep screen awake | Performance | P1 | openGym | MISSING (phone) | Spec | **PLANNED** | NO | Android | â€” | â€” | Wave 2 |
| Z | Passkeys | Auth | â€” | openGym | â€” | P1-AUTH | **PLANNED** | â€” | Web | â€” | â€” | P1-AUTH |
| AD | Guest mode | Platform | â€” | openGym | LOCAL_DEMO | Guest screens | **EXISTS** | YES | Android | â€” | visual tour | Clarify GUEST vs REAL |
| AE | No telemetry | â€” | â€” | openGym | â€” | â€” | **REJECTED** | â€” | â€” | â€” | â€” | Consent-based analytics |

---

## What Wave 1 actually shipped (honest)

| Shipped | Not shipped (do not assume) |
|---------|----------------------------|
| Gap analysis pack (6 docs + this matrix) | Guided workout screen |
| Workout engine specs (8 files) | Wakelock / rest timer |
| `@fitconnect/types` strength contracts | Muscle map / heatmap UI |
| `ProgressionEngine` + `OneRepMaxEstimator` | Import FitNotes/Strong/Hevy |
| Migration `017` DDL + RLS (not applied live) | Coach plan persisted to SQL |
| 11 unit tests (progression scenarios) | E2E TEST 001â€“016 |

---

## Anti-patterns (do not repeat)

| Trap | Reality check |
|------|---------------|
| â€œWe have Strength in sport pickerâ€ | Endurance `ActivityScreen` â€” no set logging |
| â€œWe have plan-builder.tsxâ€ | Zustand demo â€” not Postgres |
| â€œWe have 1RM in insightsâ€ | `insights-demo.ts` static â€” not `OneRepMaxEstimator` UI |
| â€œWe have progressionâ€ | ASCEND XP â‰  lifting progression (now separate engine) |
| â€œWe have exercise libraryâ€ | 14 entries â€” not production catalog |
| â€œMigration 017 = feature doneâ€ | Schema â‰  user-facing capability |

---

## Recommended next phase (Wave 2)

**Goal:** P0/P1 â€œGuided Workoutâ€ â€” app becomes a real training tool.

1. Apply migration `017` (human)
2. Android `StrengthWorkoutScreen` â€” PREP / ACTIVE / REST / log set
3. `FLAG_KEEP_SCREEN_ON` during ACTIVE
4. Finish â†’ `activities` + `activity.completed` (idempotent)
5. Wire `ProgressionEngine` targets on session open
6. Superset pair flow + timed set timers

**Defer to Wave 3:** Muscle map, heatmap, 1RM Analysis UI
**Defer to Wave 4:** Import/export, rest notifications

---

## Evidence index

| Evidence | Location |
|----------|----------|
| Progression unit tests | `apps/web/tests/strength/progression-engine.test.ts` (6) |
| Kotlin progression tests | `android/sports/.../ProgressionEngineTest.kt` (5) |
| XP idempotency (ASCEND) | `p1-data-activities-rls.integration.test.ts` |
| Specs | `docs/product/workout-engine/` |
| License | `06_LICENSE_ANALYSIS.md` |
| Master report | `MASTER_IMPLEMENTATION_REPORT.md` |

---

*This file is the decision document for the next implementation wave. Update **After**, **Status**, **Verified?**, and **Next phase** when each capability ships with executable evidence.*
