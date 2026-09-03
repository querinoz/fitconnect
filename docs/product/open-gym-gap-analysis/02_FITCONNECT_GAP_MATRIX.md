# FitConnect Ã— openGym â€” Gap Matrix

**Date:** 2026-09-01
**Legend:** EXISTS Â· PARTIAL Â· DEMO Â· STUB Â· MISSING Â· SUPERSEDED Â· INCOMPATIBLE Â· PLANNED

| ID | Feature | FitConnect status | Evidence | Target |
|----|---------|-------------------|----------|--------|
| A | Body weight history + goal | **PARTIAL** | `MetricType.WEIGHT`, coach demo `bodyWeightKg`; no history table/UI | `body_weight_entries` + Profile chart |
| B | Weekly training plan | **PARTIAL** | Web `plan-builder.tsx`, Android `CoachProgram`, Prisma `TrainingPlan` stub | `training_plans` + routine library |
| C | Rescheduling occurrences | **MISSING** | No `WorkoutOccurrence` model | Plan vs execution split |
| D | Guided strength workouts | **MISSING** | `ActivityScreen` = endurance GPS; Strength sport only label | `StrengthWorkoutScreen` + FSM |
| E | Keep screen awake | **MISSING** (phone) | No `FLAG_KEEP_SCREEN_ON` | Workout session only |
| F | Supersets | **PARTIAL** | `ProgramExercise.isSuperset`, `WorkoutStructure.SUPERSET` â€” no execution | `superset_group_id` on sets |
| G | Timed exercises | **PARTIAL** | `WorkoutStep.durationSec`, `TIME_BASED` structure | Work/rest timers in execution |
| H | Progression engine | **PLANNEDâ†’PARTIAL** | ADR-010; endurance `PerformanceEngine` only | `ProgressionEngine` (this sprint) |
| I | Progression explanation | **MISSING** | â€” | `ProgressionTarget.rationale` |
| J | Failed reps handling | **MISSING** | â€” | Engine rule: no advance on fail |
| K | Stall / deload | **DEMO** | AI copy only | `progression_state` table |
| L | Bodyweight progression | **MISSING** | â€” | `ExerciseMode.BODYWEIGHT` |
| M | Reps per side | **MISSING** | â€” | `SideMode.PER_SIDE` |
| N | Cardio in strength | **PARTIAL** | `WorkoutEngine` templates; live capture endurance | Cardio mode on sets |
| O | Estimated 1RM | **DEMO** | `insights-demo.ts` static charts | `OneRepMaxEstimator` |
| P | RPE / RIR | **PARTIAL** | Post-workout RPE modal; session feedback API | Per-set optional fields |
| Q | Exercise library | **PARTIAL** | ~14 web / ~13 Android seed; not 600+ | Expand catalog + DB |
| R | Equipment filter | **PARTIAL** | `ExerciseDefinition.equipment` list | Composable filter UI |
| S | Custom exercises | **PARTIAL** | `ExerciseCategory.CUSTOM` | `exercises.is_custom` |
| T | Plan sharing export | **PARTIAL** | Realtime coach diff; no JSON/PDF export | `fitconnect-plan-v1` package |
| U | Import FitNotes/Strong/Hevy | **MISSING** | â€” | Import pipeline P4 |
| V | Export / backup | **PARTIAL** | `ActivityExport.kt` endurance; insights CSV demo | `fitconnect-export-v1` |
| W | Activity heatmap | **PARTIAL** | Coach readiness heatmap; route heatmap â€” not training year view | Analysis heatmap |
| X | Muscle map | **MISSING** | â€” | `MuscleLoadEngine` + UI P3 |
| Y | Push notifications | **PARTIAL** | FCM gateway; no rest-timer notif | `REST_TIMER` type |
| Z | Passkeys | **PLANNED** | P1-AUTH roadmap | Additional auth method |
| AA | Admin dashboard | **PARTIAL** | Role admin in SQL; limited UI | Admin-only routes |
| AB | Accent theming | **PARTIAL** | Voltline tokens; limited accent picker | Profile accent (exists in identity) |
| AC | Multilingual | **PARTIAL** | Web 6 langs; dashboards incomplete | i18n exercise instructions on demand |
| AD | Guest / demo mode | **EXISTS** | `LOCAL_DEMO`, guest screens | Clear GUEST vs REAL separation |
| AE | No telemetry | **INCOMPATIBLE** | FitConnect needs observability + consent | Privacy-aware analytics |

## FitConnect supersets (do not duplicate)

| Capability | Status | Notes |
|------------|--------|-------|
| Endurance live capture | **EXISTS** | `LiveActivityEngine`, GPS, HR |
| ASCEND XP | **EXISTS** | `ascend_events` â€” use for strength completion |
| Coach plan builder UI | **PARTIAL** | Extend, don't replace |
| Health Connect activities | **PARTIAL** | Maps to `activities`, not strength sets |
| Readiness / HRV | **EXISTS** | Integrate with body weight + load |
| Wear workout | **PARTIAL** | Endurance-oriented; strength sync P7 |

## Duplicates to avoid

- Second XP system for lifting
- Second activity ID for strength vs `activities.id`
- Second exercise catalog in web-only JSON
- Cloning openGym UI/branding
