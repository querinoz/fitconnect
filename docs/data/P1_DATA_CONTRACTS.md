# P1-DATA â€” Contracts

## Shared types

Package: `@fitconnect/types` â†’ `canonical.ts`

- `CanonicalActivity`, `CanonicalXpEvent`, `CanonicalReadinessSnapshot`
- `CanonicalDomainEventName` (`activity.completed`, `xp.awarded`, â€¦)
- `ACTIVITY_UNITS`, `kjToKcal` / `kcalToKj`

## Activity ID

One UUID: `activities.id`

| Client | Field | Rule |
| --- | --- | --- |
| Android Fitness | `WorkoutSession.id` | Equals `activities.id` when persisted |
| Android session lease | `ActivitySession.sessionId` | Must reconcile to UUID on complete/sync |
| Wear | `WearRuntime.sessionId` | Local `wear-*` until sync â€” **not** a second truth |
| Web API | `/api/v1/workout-sessions` | Reads `activities` |
| ASCEND | `source_id` / payload.sessionId | Same UUID |
| Squad | `last_activity_id` | Same UUID |

## XP / ASCEND

| Layer | Canonical? |
| --- | --- |
| `ascend_events` + `ascend_progress` | **Yes** (Postgres SoT) |
| Android `AscendEngine` | Scoring engine; must emit idempotent `event_id` |
| Web `lib/progression/*` | Production path |
| Web `lib/gamification/store.ts` | **LOCAL_DEMO only** â€” not SoT |

Idempotency: PK `(user_id, event_id)` â€” retries must not double XP.

## Readiness

Formula: `@fitconnect/utils` `computeReadiness` (`formula_version = utils-v1`).
Do not silently change weights. Persist to `readiness_snapshots`.

## Social (implemented only)

`community_posts`, `post_reactions`. No Stories/Reels.

## Squad

`squad_challenges`, `squad_members`, `squad_contributions` (+ `last_activity_id` / `last_event_id`).

## Offline (semantics)

| Entity | Local | Server | Merge | Conflict |
| --- | --- | --- | --- | --- |
| Activity in progress | Device lease (`SessionOwnership` epoch) | â€” | Reject stale epoch | Owner heartbeat / reclaim |
| Completed activity | Queue write | `activities` upsert on `(provider, external_id)` | Prefer server id | Idempotent external key |
| XP event | Queue | `ascend_events` insert | Duplicate â†’ no-op | PK |
| Profile | Cache | `identity_profiles` | Last-write-wins on `updated_at` | Server wins on conflict |

## Realtime event names

Use `domain_events.event_name` / documented set â€” do not invent parallel names for the same concept.
