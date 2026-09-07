# GPS Data Contract

**Phase:** P2-GPS
**Canonical point:** `ActivityLocationPoint` / `LocationPointEntity`

| Field | Type | Rules |
|-------|------|--------|
| pointId | string | `{activityId}:{sequence}` |
| activityId | UUID string | same as session / activity id |
| userId | string | from authenticated session — never client-chosen at sync |
| latitude | double | −90…90 |
| longitude | double | −180…180 |
| accuracyMeters | double? | ≥ 0 when present |
| speedMps | double? | ≥ 0 when present; provider preferred |
| altitudeMeters | double? | nullable |
| capturedAtUtcMs | long | device/provider UTC epoch ms |
| sequenceNumber | int | monotonic per activity |
| verdict | ACCEPT \| LOW_CONFIDENCE \| REJECT | filter outcome |
| feedStatus | LIVE \| EMULATOR_INJECTED \| … | never silent SIMULATED on outdoor path |

## Server (`activity_route_points`)

Maps to: `latitude`, `longitude`, `accuracy_m`, `altitude_m`, `speed_mps`, `recorded_at`, `seq`.

Provider on parent activity: **`GPS`** (never `STRAVA`).

Idempotency: unique `(provider, external_id)` where `external_id = sessionId`.

## Sources (explicit)

- `SOURCE_GPS` / `DataSourceKind.REAL_SENSOR` + feed `LIVE`
- Emulator mock → `EMULATOR_INJECTED` / `EMULATED_SENSOR` (test input, not hardware proof)
- Health Connect and guided workout remain separate sources
