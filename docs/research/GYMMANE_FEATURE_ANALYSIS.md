# GymMane — Feature analysis (product reference only)

**Source:** https://github.com/InlitX/GymMane  
**License:** GPL-3.0 (code) · CC BY-SA 4.0 (exercise art from Workout Guide / Everkinetic lineage)  
**FitConnect policy:** **REFERENCE ONLY** — implement FitConnect-native capabilities. Never copy source, assets, or GPL architecture files.

## What GymMane does well (absorb as product caps)

| Domain | Capabilities to mirror conceptually |
| --- | --- |
| Training | Body map targeting, reps/weight, rest timer + alarm, set types (warm-up/working/drop/failure), RPE/RIR, supersets, plate calculator, routines (group/duplicate/schedule), live rest notification, **session survives reboot** |
| Progress | Volume, streak, weekly goal, PRs, heatmap, strength curves / e1RM, muscle split, progress photos, body measurements, medals/levels, share sticker |
| Library | Large exercise library + media, filters, custom exercises, equipment “places”, journal calendar, calculators, widgets |
| Data | CSV/ZIP export+import (media), import from Hevy/Strong/etc., **no network permission** (pure offline) |

## FitConnect mapping (2026-09-24 code audit)

| Cap | FitConnect status | Notes |
| --- | --- | --- |
| Guided strength UI | EXISTS | `StrengthWorkoutScreen` + guided runtime |
| Offline Room session | EXISTS | `fitconnect_guided_workout.db` |
| Reboot recovery | EXISTS | `GuidedWorkoutRuntime` loadActive/Recover |
| Rest timer | EXISTS | Wall-clock rest; notifications **MISSING** |
| RPE / RIR | EXISTS | Effort chips + persistence |
| Supersets | EXISTS (engine) | `supersetGroupId` |
| Sync outbox + idempotency | EXISTS | `PendingSyncEntity` + `DurableSyncQueue` |
| Sync FSM `LOCAL_ONLY→SYNCED` | MISSING | Different chip model (`LOCAL/SYNCING/SYNCED/SYNC_ERROR`) |
| Health Connect **write** | MISSING | Read-only today |
| Body map / year heatmap | MISSING | Product opportunity |
| Import Hevy/Strong | MISSING | Optional later |
| CSV/ZIP backup | PARTIAL | Strengthen export path |
| Wear companion | PARTIAL | Endurance-biased |
| Pure offline (no network) | N/A | FitConnect is online social/coach SaaS — offline is **training island**, not whole-app airgap |

## Implementation rule

```text
GymMane README / UX → FitConnect product backlog
GymMane code / art → NEVER
```

Next engineering increments (ordered):

1. Normalize sync state vocabulary + document dual outbox (Room pending vs DurableSyncQueue)  
2. Rest-timer local notification  
3. Health Connect ExerciseSession **write** after explicit user opt-in  
4. Export/backup hardening for guided workouts  
5. Progressive disclosure UX already required by V12 IA (TRAIN ≠ library wall)

## Related docs

- `docs/legal/THIRD_PARTY_COMPONENT_MATRIX.md`  
- `docs/architecture/REFERENCE_LICENSE_REGISTRY.md`  
- `docs/product/OFFLINE_WORKOUT_SYNC.md` (existing)
