# FitConnect — Master realtime cohesion report

**Date:** 2026-08-19

## What ran

| Layer | Evidence | Status |
|---|---|---|
| Local web provider | `NEXT_PUBLIC_REALTIME_PROVIDER="broadcast"` in `.env.local` | Measured |
| Broadcast unit tests | included in web **308/308** (`broadcast-transport.test.ts`, dashboard realtime tests, publish-booking) | PASS as local demo |
| Convex / Supabase realtime | Code paths exist; not configured as live provider on this machine | **PENDING_HUMAN** |
| Wear Data Layer | Code: `WearControlListenerService`, phone `wearInbox` → `liveCoordinator.onRemoteEnvelope` | **BLOCKED** (no devices) |
| Two-session athlete+coach | Not run (would need two browsers + a shared backend). Coach and athlete demos are **separate seed worlds** | FAIL as product realtime |
| Production FCM | Documented PENDING_HUMAN in coach settings copy | **PENDING_HUMAN** |

## Latency / ordering / duplicates

**Not measured.** No two-client clock. Do not invent ms.

Local broadcast is same-tab / BroadcastChannel. That cannot prove coach-sees-athlete-run.

## Session ownership (related, not cloud)

Kotlin `SessionOwnership` + TS mirror: 8s transfer, epoch, stale write reject. Web `session-ownership.test.ts` **14 PASS**. Android `SessionOwnershipTest` + new `watchEnvelopeLocksPhoneStart`.

This prevents **in-process** double START. It does **not** replace a realtime server.

## Reconnect

Not injected. **BLOCKED.**

## Production realtime

Mark **PENDING_HUMAN**: Convex URL/keys, Supabase realtime auth, device pairing.

## Realtime cohesion status

**PENDING_HUMAN** for production. **FAIL** for “events propagate across Athlete, Coach, Squad, Watch, Web” — that bus is not running here.
