# FitConnect Ã— openGym â€” Master Implementation Report

**Date:** 2026-09-01
**Branch:** `feat/elite-os-v2`
**Method:** Native reimplementation â€” **no AGPL code copied**

---

## Reference review

openGym (AGPL v3.0) is a self-hosted / standalone Android strength tracker with: weekly plans, guided workouts, progression rules (linear, Greyskull LP, double progression), body weight charts, import/export, muscle analytics, passkeys (self-hosted), and native reminders.

Used as **functional reference only** via public documentation and product site.

---

## Features found (reference)

31 capability areas catalogued in `01_REFERENCE_FEATURE_INVENTORY.md` (Aâ€“AE).

---

## Already in FitConnect

| Area | Status |
|------|--------|
| Endurance live capture (GPS/HR) | EXISTS |
| Coach plan builder UI (demo) | PARTIAL |
| Exercise seed engines | PARTIAL |
| Workout template structures (EMOM/AMRAP) | EXISTS |
| ASCEND XP / streak | EXISTS (separate from lifting progression) |
| RPE post-workout feedback | PARTIAL |
| FCM push gateway | PARTIAL |
| Guest / LOCAL_DEMO | EXISTS |
| Elite OS design system | EXISTS |
| Health Connect activity read | PARTIAL |

---

## Missing (before this sprint)

Guided strength execution, set logging, progression engine, 1RM calculator, body weight persistence, muscle map, import/export, rescheduling, wakelock, rest-timer notifications, full exercise catalog.

---

## Newly implemented (Wave 1)

| Deliverable | Path |
|-------------|------|
| Gap analysis pack | `docs/product/open-gym-gap-analysis/` |
| Workout engine specs | `docs/product/workout-engine/` |
| Strength domain types | `packages/types/src/strength.ts` |
| ProgressionEngine + 1RM | `packages/utils`, `android/sports/progression/` |
| Postgres schema 017 | `supabase/migrations/017_strength_workout_engine.sql` |
| Unit tests | `apps/web/tests/strength/`, `ProgressionEngineTest.kt` |

---

## Improved (not replaced)

- Documented plan vs execution separation
- Clarified ASCEND integration path (one `activity.completed`)
- Extended P1-DATA architecture for strength tables

---

## Rejected

| Item | Why |
|------|-----|
| Copy openGym source/assets | AGPL + clone risk |
| "No telemetry" principle | FitConnect needs consent-based observability |
| Replace auth with passkeys-only | P1-AUTH owns identity |
| 600+ exercise media at startup | Performance |

---

## Data changes

Migration `017`: `exercises`, `training_plans`, `training_routines`, `routine_exercises`, `workout_occurrences`, `strength_sessions`, `strength_sets`, `body_weight_entries`, `progression_states` â€” all RLS via `firebase_uid()`.

**Not applied live in this pass** â€” forward migration ready for human apply.

---

## Platform status

| Platform | Status |
|----------|--------|
| Android | Domain engine **PASS**; execution UI **PLANNED** |
| Web | Progression tests **PASS**; UI **PLANNED** |
| Wear | **BLOCKED** (P7) |
| Coach | Builder exists; SQL wire **PLANNED** |

---

## ASCEND / Squad integration

Documented: strength session complete â†’ `activities` â†’ `activity.completed` â†’ single XP event (idempotent). No second XP system.

---

## Security

- RLS on all 017 tables
- Custom exercises scoped to owner
- RPE/RIR private by default
- No secrets in export spec

---

## Tests

| Suite | Result |
|-------|--------|
| `tests/strength/progression-engine.test.ts` | **6/6 PASS** |
| `:sports:testDebugUnitTest` | **BUILD SUCCESSFUL** (5 tests) |

---

## Remaining human dependencies

- Apply migration `017` to Supabase
- Commit untracked strength artifacts
- Exercise media licensing decisions
- P1-AUTH before production identity flows

---

## Next implementation wave

1. Android `StrengthWorkoutScreen` + wakelock + rest timer
2. Wire Train FAB to strength path
3. Body weight Profile UI
4. Coach plan â†’ Postgres persistence

---

## License considerations

See `06_LICENSE_ANALYSIS.md` â€” **reimplement only**, no AGPL contamination.
