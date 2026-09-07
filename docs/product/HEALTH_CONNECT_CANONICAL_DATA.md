# Health Connect Canonical Data

## Sources

| Metric | Reader | Unit (canonical) | Persistence |
|--------|--------|------------------|-------------|
| Heart rate | `HealthConnectHeartRateReader` | bpm | live read (not Room samples yet) |
| Steps | `HealthConnectSleepStepsReader` | STEPS | `TelemetryStore` (Room when app context) |
| Sleep session | same | start/end UTC ms + stages | `telemetry_sleep` |
| Sleep minutes (facade) | derived | MINUTES | `telemetry_samples` metric=SLEEP |

## Identity

Every durable row carries:

- `athleteId` / `userId`
- `provider = HEALTH_CONNECT`
- `sourceRecordId` (HC metadata.id when present, else deterministic window key)
- UTC epoch timestamps

## Deduplication

Unique index `(provider, sourceRecordId)`. Re-sync **replaces**, never doubles.

Daily steps aggregate by UTC day key `steps:{athleteId}:{dayIndex}` to avoid double-counting overlapping intervals.

## Permissions

Missing / denied / unavailable → `MetricAvailability` + **no fabricated 0**.

## Distinction

Guided Workout `activities` (MANUAL/STRENGTH) are **not** Health Connect workout imports.
