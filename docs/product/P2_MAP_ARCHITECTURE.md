# P2-MAP Architecture

**Date:** 2026-09-04
**Status:** engineering

```
Room LocationPointEntity (ACCEPT only, sequence ASC)
        │
 CanonicalRouteRepository → RoutePoint adapter
        │
 FitConnectRouteMap
   ├─ MapLibreRouteMap (OpenFreeMap dark · GeoJsonSource updates)
   └─ EliteRouteMap Canvas fallback (tiles fail → capture continues)
        │
 Live ActivityScreen · ActivityRouteDetailScreen
```

## Rules

- Map is **not** source of truth — Room + outdoor capture are.
- No production fake routes; no second persistence model.
- MapView is created once; GeoJson sources update in place.
- Manual gesture releases follow; Recenter restores follow.
- Completed routes fit bounds; live routes follow last ACCEPT.

## Non-goals

Wear · Social · Heatmap · FCM · production release
