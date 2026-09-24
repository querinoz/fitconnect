# FitConnect Sports Intelligence Map™

**Branch:** `feat/fitconnect-roadmap-v10-v11`  
**Date:** 2026-09-24

## Architecture

```text
FitConnect (SoT)
  ├── Spots intelligence → Postgres `training_spots` + `training_spots_public`
  ├── Map tiles → MapLibre → OpenFreeMap (no SLA — style URL swappable)
  └── Geocode / route → Geoapify (server-only, optional)
```

OpenFreeMap is commodity basemap. Proprietary Spot intelligence never lives in OSM.

## Environment

```bash
# Tiles (public, no secret)
NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/dark

# Geocoding / routing — SERVER ONLY (never NEXT_PUBLIC_)
GEOAPIFY_API_KEY=
```

Without `GEOAPIFY_API_KEY`, the map still works; search/routing report `NOT_CONFIGURED`.

## Schema

Migration `037_sports_intelligence_spots.sql` extends `training_spots` (021) with:

- `spot_kind` STANDARD | MASTER | SECRET  
- `certification_status` UNVERIFIED | COMMUNITY | MASTER  
- `skill_level`, facilities, access/safety metadata  
- `fc_haversine_m` for radius queries (PostGIS optional later)  

Privacy (033/034 preserved):

- Public view never returns `exact_lat` / `exact_lng`  
- Secret spots never appear on the public view  
- MASTER cannot be self-asserted on INSERT/UPDATE  

## APIs

| Route | Purpose |
| --- | --- |
| `GET /api/v1/spots` | Viewport / radius / filters (public approx only) |
| `GET /api/v1/spots?id=` | Detail; exact coords only for owner |
| `POST /api/v1/spots` | Create (confirm required; no MASTER self-grant) |
| `GET /api/v1/geo?action=geocode\|reverse\|route` | Geoapify proxy |

In-memory `/api/v1/network` remains for V11 events/challenges — map discovery uses `/api/v1/spots`.

## Offline roadmap

| Phase | Status |
| --- | --- |
| Online MapLibre + OpenFreeMap | Implemented |
| Regional MBTiles / OfflineManager | Future — do not ship planet packs now |
| Valhalla self-hosted routing | Future behind `RoutingProvider` |

## Provider replacement

Change `NEXT_PUBLIC_MAP_STYLE_URL` to swap tiles.  
Swap Geoapify by implementing `GeoProvider` / `RoutingProvider`.

## Testing

- Unit: `lib/spots/spots.test.ts`  
- Existing MCP `list_public_spots` still asserts exact coords never returned  

## Security checklist

- [x] Exact coords never on public DTO  
- [x] Secret filter on public view  
- [x] Geoapify key server-only  
- [x] MASTER certification blocked on client create  
- [x] Attribution via MapLibre `attributionControl`  
