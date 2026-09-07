# Workout Engine Wave 2

Executable guided strength on Android. See also:

- [WORKOUT_WAVE2_ARCHITECTURE.md](./WORKOUT_WAVE2_ARCHITECTURE.md)
- [GUIDED_WORKOUT_STATE_MACHINE.md](./GUIDED_WORKOUT_STATE_MACHINE.md)
- [OFFLINE_WORKOUT_SYNC.md](./OFFLINE_WORKOUT_SYNC.md)
- [WORKOUT_TEST_MATRIX.md](./WORKOUT_TEST_MATRIX.md)

## What shipped

| Area | Location |
|------|----------|
| Domain + FSM | `android/sports/.../guided/` |
| Progression | Existing `ProgressionEngine` only |
| Room | `WorkoutRoomDatabase` + 4 entities |
| Runtime | `GuidedWorkoutRuntime` |
| UI | `StrengthWorkoutScreen` |
| Train FAB | → `athlete/workout` |
| HTTP | `POST /api/v1/workout-sessions` |
| Schema | `018_workout_wave2.sql` |
| XP | `HttpAscendRemote` / `ascend_events` via `eventId=xp:{userId}:{sessionId}` |

## RPE / RIR

- RPE: 1–10, 0.5 steps (optional unless exercise requires)
- RIR: 0–5 (optional unless exercise requires)
- Missing values stay `null` — never fabricated

## Units

Load = kg. Duration = ms on activities, seconds on set timers. Heart-rate zones remain Z1–Z5 semantic tokens.
