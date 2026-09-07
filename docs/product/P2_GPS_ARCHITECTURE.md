# P2-GPS Architecture

**Date:** 2026-09-04
**Status:** engineering

```
User START outdoor
        │
 permission (FINE preferred; COARSE accepted as degraded)
    ─── UI explains why location is needed; never falls back to fake coords
        │
 CaptureLocationService (FGS · type=location · notification)
        │
 FusedLocationProviderClient
   interval 2000 ms · fastest 1000 ms · PRIORITY_HIGH_ACCURACY · minDisplacement 0
        │
 GpsAccuracyFilter  → ACCEPT | LOW_CONFIDENCE | REJECT
   LOW_ACCURACY_M=50 · REJECT_ACCURACY_M=200 · MAX_JUMP_M=1500
        │
 LiveActivityEngine.ingestFix (LIVE | EMULATOR_INJECTED)
   Phase outdoor: PREPARING until first ACCEPT → TRACKING
        │
 Room LocationPointEntity + GpsSessionEntity (authoritative)
        │
 FINISH → OutdoorCompletionFactory (provider=GPS)
        │
 DurableSyncQueue (enqueue only)
        │
 POST /api/v1/workout-sessions
        │
 activities + activity_route_points (RLS)
        │
 ASCEND XP (idempotent)
```

## Distance / speed

- Distance: haversine between consecutive **ACCEPT** points; jumps > 1500 m rejected.
- Speed: provider `speed` (m/s) when present; else derived only for UI summaries from accepted segments — never fabricate.
- No interpolation of missing GPS gaps (`GPS_DEGRADED` / wait — no fake points).

## Non-goals

MapLibre rewrite · Watch · Social · Background location · FCM · production release

## Simulation policy

Production outdoor path: **no** `QaGpsRoute` auto-walk.
`allowSimulatedGps` default **false**.
`GpsFeedStatus.SIMULATED` only for explicit unit/QA fixtures.
Emulator `geo fix` / mock provider → `EMULATOR_INJECTED` (labeled, not LIVE hardware).

## Map

Existing `EliteRouteMap` Canvas polyline consumes engine route from persisted accepted points. No MapLibre rewrite in this phase.
