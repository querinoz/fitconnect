# Workout Engine Wave 2 — Architecture

**Date:** 2026-09-03
**Branch:** `feat/elite-os-v2`
**Status:** implementation contract (do not treat this file as a PASS report)

Wave 2 turns the frozen strength **engine** (017 + `ProgressionEngine`) into a durable, executable Android product. It does not replace 017, fork progression, or invent a second backend.

## Identity (frozen)

```
FitConnect user → Firebase UID → identity_profiles.id = userId
                              → WorkoutSession.userId
                              → activities.user_id
                              → ascend_events.user_id
```

`SessionStore.snapshot().userId` is the only identity input. `LocalDemoIdentity.ATHLETE_ID` (`ath-1`) is not domain authority. Debug local sessions may still complete **locally**; they must not be reported as server-SYNCED.

## Product flow

```
USER
  │
Firebase UID / identity_profiles
  │
WORKOUT SESSION (Room is source of truth)
  │
PREP → ACTIVE ⇄ REST
         ⇄ PAUSED
         → COMPLETING → COMPLETED → SYNC_PENDING → SYNCED
  │
activities row (provider=MANUAL, sport=STRENGTH)
  │
idempotency key = userId + sessionId
  │
activity.completed → ASCEND event (exactly once)
  │
DurableSyncQueue + Room pending_sync (offline then retry)
```

## What already exists (reuse)

| Piece | Role | Wave 2 action |
|-------|------|----------------|
| `ProgressionEngine` | Canonical progression | Call `compute()` only — no fork |
| `017_strength_workout_engine.sql` | Server strength schema | Additive `018` only |
| `016` `activities` unique `(provider, external_id)` | Activity idempotency | `provider=MANUAL`, `external_id=sessionId` |
| `HttpAscendRemote` + `/api/v1/ascend/progression` | Canonical XP | `eventId=xp:{userId}:{sessionId}` |
| `DurableSyncQueue` / `OfflineCoordinator` | App-wide outbox | Register `workout.activity.complete` + `workout.xp.award` |
| `WorkoutEngine` (`:sports`) | Template catalog (in-memory) | Keep — not the session executor |
| `ActivityScreen` | GPS / endurance capture | Keep at `athlete/activity`; Train FAB no longer opens it |
| Neu-glass (`EosGlassSurface`, `EosPremiumCard`, `EliteButton`, Z1–Z5) | UI | Reuse — no global redesign |

## New modules (no duplicate stores)

| Type | Location |
|------|----------|
| Domain + FSM | `android/sports/.../guided/` |
| Room | `WorkoutRoomDatabase` in `:sports` |
| Runtime | `GuidedWorkoutRuntime` |
| UI | `StrengthWorkoutScreen` in `:athlete` |
| HTTP write | `POST /api/v1/workout-sessions` (same route family as GET; table remains `activities`) |
| Schema | `018_workout_wave2.sql` — statuses, `side`, builtin exercises |

Prisma is **not** a second workout store. Writes use SQL against `public.activities` / `public.strength_*`.

## Session state machine

Explicit states: `IDLE PREP ACTIVE REST PAUSED COMPLETING COMPLETED FAILED RECOVERING SYNC_PENDING SYNCED`.

Local machine is richer than 017 (`IDLE\|PREP\|ACTIVE\|PAUSED\|FINISHED\|CANCELLED`). 018 extends the server check. REST is a first-class local + server state.

Screen state is never source of truth. Every mutation persists to Room before UI observes it.

Process death: `RECOVERING` → hydrate from Room → prior phase. Timers store remaining ms + elapsedRealtime anchor + wall-clock fallback (reboot).

## Persistence

Room entities: `WorkoutSessionEntity`, `ExerciseSetEntity`, `WorkoutEventEntity`, `PendingSyncEntity`.

`DurableSyncQueue` remains the drainable outbox (idempotency keys already de-dupe). Room pending rows reconstruct the queue after death.

No secrets in Room.

## Completion + XP

Exactly one activity:

- `activity.id = sessionId` (UUID)
- `provider = MANUAL` (never `STRAVA`)
- `external_id = sessionId`
- `sport = STRENGTH`
- `visibility = private`

Retries use `ON CONFLICT (provider, external_id)`.

Exactly one XP award: POST ASCEND with `eventId = xp:{userId}:{sessionId}`. Server already returns `DUPLICATE`. Client must treat duplicate as success. Do not write `InMemoryAscendStore` / Zustand / `server-store` Map as SoT.

Offline: complete locally → queue → never fake HTTP 200.

UI sync chip: `LOCAL | SYNCING | SYNCED | SYNC ERROR`.

## Train FAB

`EosTrainActionFab` → `AthleteDest.WORKOUT` (`athlete/workout`) → `StrengthWorkoutScreen`.

GPS `ActivityScreen` stays for P2-GPS. It is not the Train entry.

## Design / a11y

Elite OS neu-glass. Tokens only. Effort uses `EliteChartPalette.zone(1..5)`, never brand voltline as HR zone. Primary CTAs ≥56dp, adjacent targets ≥8dp (ui-ux-pro-max). TalkBack labels + `Modifier.semantics`. Reduced motion via existing `reduceMotionEnabled()`.

## Out of scope

GPS, Wear product, Social/Squad V2, FCM production, nutrition, muscle map, Expo, production GO.
