# Phase 08 — Provider Architecture

## Contract (`TelemetryProvider`)
```
id: ProviderId
displayName: String
capabilities(): ProviderCapabilities
connectionState(): ProviderConnectionState
connect() / disconnect(): AppResult<Unit>
read(athleteId, metrics, range, cursor, pageSize): ProviderPage   // throws ProviderException
```

- `ProviderPage` returns canonical `TelemetrySample`/`WorkoutSession` lists + `nextCursor` — pagination is provider-owned, engine-driven.
- `ProviderException(failure)` classifies every error: UNAVAILABLE_API, EXPIRED_TOKEN, PERMISSION_REVOKED, DEVICE_DISCONNECTED, RATE_LIMIT, NETWORK, MALFORMED_DATA, PARTIAL_RESPONSE, OUTAGE, UNSUPPORTED_METRIC.
- Connection states: AVAILABLE, UNAVAILABLE, CONNECTED, DISCONNECTED, PERMISSION_REQUIRED, PERMISSION_DENIED, AUTH_EXPIRED, ERROR.

## Adapters
HealthConnectProvider (first-class), GarminProvider, WhoopProvider, OuraProvider, FitbitProvider, PolarProvider, SamsungHealthProvider, StravaProvider — all extend `BaseSimulatedProvider` while vendor SDKs/credentials are absent. `UnsupportedProvider` exists for providers deliberately excluded from a build.

## Failure handling (engine side)
- Retry with exponential backoff (1s / 4s / 16s) for transient failures.
- EXPIRED_TOKEN / PERMISSION_REVOKED / UNSUPPORTED_METRIC are never retried (no retry storms).
- Partial success → `SyncStatus.PARTIAL` with counts; checkpoint preserved per page so resume never restarts.

## Adding a provider
1. Implement `TelemetryProvider` in `provider/`.
2. Declare `ProviderCapabilities`.
3. Register it in `DefaultTelemetryContainer`.
Nothing else changes — domain, sync, storage, privacy, UI are untouched.
