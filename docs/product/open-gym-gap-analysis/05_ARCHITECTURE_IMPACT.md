# openGym Gap — Architecture Impact

**Date:** 2026-09-01

## Layers affected

```
┌─────────────────────────────────────────────────────────┐
│  UI: Athlete Train · Coach Programs · Analysis · Watch  │
├─────────────────────────────────────────────────────────┤
│  Domain: ProgressionEngine · OneRepMax · MuscleLoad     │
├─────────────────────────────────────────────────────────┤
│  Android: sports module · athlete UI · coach UI         │
├─────────────────────────────────────────────────────────┤
│  Web: lib/strength · coach plan-builder · API routes    │
├─────────────────────────────────────────────────────────┤
│  Types: @fitconnect/types/strength                      │
├─────────────────────────────────────────────────────────┤
│  Postgres: 017_strength_workout_engine (RLS)            │
├─────────────────────────────────────────────────────────┤
│  Events: activity.completed → ASCEND (existing bus)     │
└─────────────────────────────────────────────────────────┘
```

## P1-DATA alignment

| Entity | Table | Links to |
|--------|-------|----------|
| Strength session | `strength_sessions` | `activities.id` on complete |
| Set log | `strength_sets` | session + exercise |
| Plan | `training_plans` | `user_id` Firebase UID |
| Occurrence | `workout_occurrences` | plan + scheduled date |
| Body weight | `body_weight_entries` | `user_id` |
| Progression state | `progression_states` | user + exercise |

**Rule:** Completed strength workout creates **one** `activities` row (provider `MANUAL` or `HEALTH_CONNECT`) and **one** ASCEND event.

## Modules touched

| Module | Change |
|--------|--------|
| `packages/types` | +strength contracts |
| `packages/utils` | +progression logic |
| `android/sports` | +progression package |
| `android/athlete` | +strength workout UI (wave 2) |
| `android/coach` | Wire programs to SQL (wave 3) |
| `apps/web` | strength lib + APIs (wave 4) |
| `supabase/migrations` | `017` additive |

## Unchanged

- Firebase identity path
- Strava social barrier
- Neu-glass design tokens
- `LiveActivityEngine` (endurance remains separate)
- Expo `apps/mobile` (frozen)

## Realtime / offline

- Offline: queue set logs in `DurableSyncQueue` (existing foundation)
- Sync: upsert by `(session_id, set_sequence)` idempotency
- Events: `activity.completed` on finish — not per-set

## Security

- All new tables: FORCE RLS, `user_id = firebase_uid()`
- Coach read: separate policy via roster relationship (future migration)
- RPE/RIR: private by default; coach only with consent flag
