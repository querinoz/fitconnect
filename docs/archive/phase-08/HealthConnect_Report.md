# Phase 08 — Health Connect Report

## Status: architecture-complete, simulated data source

`HealthConnectProvider` is the first-class Android adapter. The current build does **not** ship the `androidx.health.connect:connect-client` dependency because no vendor keys / device validation environment is attached to this rebuild; the adapter runs on `SimulatedProviderSource` behind the identical contract.

## Ecosystem verification (not invented)
- Health Connect is part of the Android platform since Android 14 (API 34); on 13 and lower it is the standalone APK. App `minSdk = 26` matches Health Connect's own minimum (documented in `app/build.gradle.kts` and ADR-005).
- Real integration uses `HealthConnectClient.getOrCreate`, `PermissionController` for read permission grants, `readRecords` with `TimeRangeFilter` + page tokens, and `getChanges`/changes tokens for incremental sync — these map 1:1 onto the adapter contract: `connect()` → permission request, `read(range, cursor)` → readRecords/changes with page token as cursor.

## Contract coverage
| Requirement | Where |
|---|---|
| Read permissions | `connect()` + `ProviderConnectionState.PERMISSION_REQUIRED / PERMISSION_DENIED` |
| Write permissions | `writableMetrics = {WORKOUT, WEIGHT}` declared |
| Permission state | `connectionState()` |
| Data availability | `capabilities().readableMetrics` + `UNAVAILABLE` state |
| Historical records | `maxHistoryDays = 30` (Health Connect's read window) |
| Incremental sync | cursor-based `read` + `SyncCheckpoint` |
| Deletion requests | `supportsDeletion = true` + `TelemetryStore.deleteByProvider` + `TelemetryPrivacyManager.deleteProviderData` |
| Provenance | every record carries `Provenance(provider=HEALTH_CONNECT, device, sourceRecordId, …)` |
| Changes | modeled as incremental cursor sync |
| Unavailable / unsupported | `UnsupportedProvider` + graceful `ProviderFailure.UNAVAILABLE_API` |

## Remaining work to go live (logged in Technical_Debt.md)
1. Add `connect-client` dependency + `<queries>`/permission declarations in the app manifest.
2. Replace `BaseSimulatedProvider` internals of `HealthConnectProvider` with client calls (record type ↔ `MetricType` mapping table).
3. On-device permission UX validation (Android 13/14/15 matrix).
