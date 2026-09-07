# Workout Test Matrix (Wave 2)

| ID | Coverage | Layer |
|----|----------|-------|
| WORKOUT-001 | Session state machine | Unit `:sports` |
| WORKOUT-002 | Set logging + validation | Unit |
| WORKOUT-003 | Timed exercise monotonic clock | Unit |
| WORKOUT-004 | Rest skip / extend | Unit |
| WORKOUT-005 | Superset A1→A2→REST | Unit |
| WORKOUT-006 | ProgressionEngine canonical | Unit |
| WORKOUT-007 | Persistence round-trip | Unit (in-memory) + Room androidTest |
| WORKOUT-008 | Process recovery | Unit (shared store) |
| WORKOUT-009 | Idempotency keys | Unit |
| WORKOUT-010 | Offline queue no fake success | Unit |
| WORKOUT-011 | Sync retry then succeed | Unit |
| WORKOUT-012 | Duplicate completion / XP | Unit |

Instrumentation: `GuidedWorkoutInstrumentationTest` (emulator). Visual tour FAB target updated to `athlete_guided_workout`.
