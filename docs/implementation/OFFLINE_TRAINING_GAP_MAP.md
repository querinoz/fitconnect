# Offline training engine — gap map (FitConnect-native)

**Date:** 2026-09-24  
**SoT today:** `android/.../sports/guided/store/room/WorkoutRoomDatabase.kt` (`fitconnect_guided_workout.db`)  
**Do not:** add a second workout database; do not GPL-copy GymMane.

## Desired sync vocabulary (target)

`LOCAL_ONLY → QUEUED → SYNCING → SYNCED | FAILED_RETRYABLE | FAILED_PERMANENT | CONFLICT`

## Current vs target

| Concern | Current | Gap |
| --- | --- | --- |
| Session persist | `WorkoutSessionEntity` + snapshot JSON | Normalize naming/docs; keep blob for complex state |
| Sets | `ExerciseSetEntity` | Optional column normalize later |
| Outbox | `PendingSyncEntity` + `DurableSyncQueue` | Unify documentation; optional single adapter façade |
| UI sync chip | LOCAL / SYNCING / SYNCED / SYNC_ERROR | Map to target vocabulary without breaking UX |
| Conflict | SERVER_AUTHORITATIVE | Explicit user-visible conflict only when needed |
| HC write | Missing | P1 after opt-in |
| Rest notification | Missing | P1 |
| Share card | Partial social | Confirm-gated share only |
| Export | Partial | CSV/ZIP hardening P2 |

## Guarantees already met (guided path)

- Start / log set / RPE-RIR / rest / complete offline  
- Process death + reboot recovery  
- Idempotent server post (409 = success)

## P0/P1 backlog (implementation)

1. **P0** Document + unit-test sync state mapping (no behavior break)  
2. **P1** Rest-timer local notification  
3. **P1** Health Connect write ExerciseSession (opt-in; no duplicate loops)  
4. **P1** Confirm-gated WorkoutShareCard (authorized fields only)  
5. **P2** Export/import ZIP for guided sessions  
6. **P2** Conflict UI when dual-device edits collide  

## Explicit non-goals

- Whole-app airplane-mode (FitConnect remains networked SaaS)  
- Vendoring GymMane exercise art  
- Replacing V12 IA domain separation
