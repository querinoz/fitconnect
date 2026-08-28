# Realtime QA — Ultimate Run

**Date:** 2026-08-28  
**Verdict:** PASS (auth-gated bridge + unit tests)

## Scope

`/api/v1/realtime/bridge` — mobile fallback buffer, IDOR protection, live-tick publish/poll.

## Evidence

| Check | Result |
|-------|--------|
| `lib/realtime/bridge-route.test.ts` | 2/2 PASS (403 cross-user, own-channel buffer) |
| `lib/platform/realtime/broadcast-transport.test.ts` | 2/2 PASS |
| `lib/realtime/use-channel.test.tsx` | 2/2 PASS |
| Live POST live-tick (demo auth) | `ok: true` + `at` timestamp |
| Auth on bridge (prior session) | Firebase RS256 + channel ownership |

## Security

- Channel namespace `<kind>:<subjectId>` — caller may only read/write own subject.
- Covered in `bridge-route.test.ts` and `require-auth.prod.test.ts`.

## Residual

- Convex transport not exercised in this run (BroadcastChannel default on web).
- `scripts/qa-realtime-bridge.mjs` requires running dev server + demo or Firebase token.
