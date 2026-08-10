# Phase 12 — Location Privacy Report

## Components

| Component | Path |
|-----------|------|
| Location engine | `android/geo/src/main/java/com/fitconnect/android/geo/location/LocationEngine.kt` |
| Geo models | `android/geo/.../GeoModels.kt` |
| Maps UI | `android/geo/`, web MapLibre (planned) |
| Strava activities | Route polylines via integration |

## Permission model

`LocationPermissionState`: UNKNOWN → GRANTED / DENIED / NEEDS_RECOVERY

- Foreground location: requires GRANTED
- Background: explicit check — returns error if not GRANTED
- Mock locations: gated by `allowMock` flag (disabled in production target)

## Data minimization

| Use case | Data collected | Retention |
|----------|----------------|-----------|
| Map discovery | Last known / foreground fixes | Session-scoped in engine |
| Strava sync | Activity GPS (user-initiated OAuth) | Per Strava + local cache |
| Event discovery | Static catalog seeds (`PlacesCatalog.kt`) | No live tracking |

## Privacy controls

- Android: `ACCESS_MAPS` permission in `RolePermissionTable` — logged-in athlete/coach only
- No background tracking wired in Phase 12 without permission gate
- Web map (OpenFreeMap): client-side tiles; user location opt-in required when implemented

## Threats

| Threat | Mitigation | Status |
|--------|------------|--------|
| Background tracking without consent | `LocationEngine` denies background without GRANTED | PASS |
| Location in AI prompts | Health/location excluded unless policy allows | Partial — see AI docs |
| Precise home address leak in community | Visibility resolver | Review `android/community/privacy/VisibilityResolver.kt` |

## Gaps

- No coarse-location fallback documented
- Web athlete heatmap may expose routes — needs visibility toggle
- No automated test for mock-location rejection in release

## Verdict

Location handling is **permission-gated and foreground-first** on Android. **Full location privacy review** for web map + community geotags remains open.
