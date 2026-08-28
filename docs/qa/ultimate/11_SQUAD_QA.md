# Squad QA — Ultimate Run

**Date:** 2026-08-28  
**Verdict:** PASS (server-backed LOCAL_DEMO)

## Scope

Squad challenge `squad-fc-week` — join, contribute distance, aggregate progress (mirrors Android `ChallengeCatalog`).

## Implementation fixed

| Before | After |
|--------|-------|
| In-memory Android only | `GET/POST /api/v1/squads/challenges/[id]` |
| No web API | `lib/squads/server-challenges.ts` |

## Evidence

| Check | Result |
|-------|--------|
| `lib/squads/squad-challenge-route.test.ts` | 2/2 PASS |
| Live join + contribute 2500m | `progressM=2500`, lifecycle `ACTIVE` |
| Android `squad-fc-week` target | 50_000m (aligned) |

## Residual

- Multi-member aggregation on web requires multiple `userId` contributions (demo mode).
- No Supabase persistence yet; server store resets on deploy cold start.
