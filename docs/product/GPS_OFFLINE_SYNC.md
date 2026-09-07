# GPS Offline Sync

```
Room (gps_sessions + gps_location_points)
        │
 DurableSyncQueue
   outdoor.activity.complete  → POST /api/v1/workout-sessions (provider=GPS)
   outdoor.xp.award           → ASCEND XP (idempotent event_id)
        │
 Postgres activities + activity_route_points (RLS)
```

## Offline guarantees

Airplane / no network:

1. START (permission + FGS)
2. TRACK / PAUSE / RESUME
3. FINISH

All remain local. Finish **enqueues only** — no UI-thread HTTP.

When connectivity returns, offline coordinator drains the queue. Duplicate finish / retry must not create a second activity (`on conflict (provider, external_id)`).

## Recovery

`OutdoorCaptureRuntime.recoverIfNeeded()` reloads active `PREPARING|TRACKING|PAUSED|…` session from Room and restarts FusedLocation + FGS if not paused.

Process death of the FGS is recorded honestly — Room phase is source of truth; UI must not invent “still tracking” from ViewModel alone.
