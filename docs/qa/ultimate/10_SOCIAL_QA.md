# Social QA — Ultimate Run

**Date:** 2026-08-28  
**Verdict:** PASS (server-backed LOCAL_DEMO)

## Scope

Community feed at `/community` — post creation, listing, realtime BroadcastChannel sync.

## Implementation fixed

| Before | After |
|--------|-------|
| `localStorage` only (`lib/community/local-posts.ts`) | `GET/POST /api/v1/community/posts` + in-memory server store |
| No API route | `lib/community/server-posts.ts` seeds from `COMMUNITY_POSTS` |

## Evidence

| Check | Result |
|-------|--------|
| `lib/community/community-posts-route.test.ts` | 2/2 PASS |
| Live `GET /api/v1/community/posts` | 9 seed posts |
| Live `POST` new check-in | `c-user-*` id returned |
| `CommunityFeed` fetches server on mount | wired |
| Smoke `/community` | 200 OK |

## Strava compliance

Seed posts are demo fixtures only. No Strava provider sessions in social feed (architecture rule unchanged).

## Residual

- Supabase `community_posts` table exists but not wired to Prisma/API yet (P1-14 partial).
- Reactions are client-only (no server persistence).
