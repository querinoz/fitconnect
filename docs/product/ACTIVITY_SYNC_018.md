# Activity Sync + Migration 018

## Migrations

| File | Role |
|------|------|
| `017_strength_workout_engine.sql` | Creates `exercises`, `strength_sessions`, `strength_sets`, RLS |
| `018_workout_wave2.sql` | Wave 2 statuses, `idempotency_key`, set `side`, builtin exercises |

Apply order: **017 then 018**. Script: `node scripts/apply-migrations-017-018.mjs`

## Sync path

```
GuidedWorkoutRuntime.finish
→ Room + DurableSyncQueue (enqueue only; no UI-thread HTTP)
→ WorkoutSyncHandlers
   → POST /api/v1/workout-sessions  (complete-guided-workout)
   → HttpAscendRemote XP eventId=xp:{userId}:{sessionId}
```

Idempotency:

- Activity: unique `(provider=MANUAL, external_id=sessionId)`
- Strength session: `idempotency_key = activity:{userId}:{sessionId}`
- XP: unique `ascend_events.event_id`

## Apply evidence

Record schema meta `workout_wave2_schema_version=018` and `strength_sessions.idempotency_key` column present after apply.
