# Phase 08 — Sync Engine Report

`TelemetrySyncEngine` — provider-agnostic, page-based, checkpointed.

| Requirement | Implementation |
|---|---|
| Initial sync | `DeviceCenter.syncNow` with `historyDays` window when no checkpoint exists |
| Incremental sync | range starts at `checkpoint.lastSyncedEpochMs − 6h` overlap; idempotent upserts absorb the overlap |
| Historical sync | any explicit `TimeRange` in the past; page cursor walks the window |
| Delta sync | cursor from provider (`ProviderPage.nextCursor`) |
| Retry / backoff | 1s → 4s → 16s exponential; only transient failures |
| Pagination / cursor / checkpoint | checkpoint persisted after **every page**, so partial syncs resume, never restart |
| Deduplication | `DeduplicationEngine` on every workout page, with ±6h lookback window from the store |
| Conflict resolution | same source record re-synced replaces (upsert by id); cross-provider conflicts resolved by provider priority with gap-filling |
| Partial failure | imported counts preserved, `SyncStatus.PARTIAL`, failure classified |
| Network failure | `ProviderFailure.NETWORK` retried, then PARTIAL/FAILED |
| Provider failure | classified via `ProviderException`, counted in observability |
| Auth expiration | `EXPIRED_TOKEN` non-retryable → surfaces as AUTH_EXPIRED state |
| Rate limits | `RATE_LIMIT` failure class + `rateLimitPerHour` capability declaration |
| Cancellation / resume | engine is coroutine-based (cooperative cancellation); checkpoint enables resume |

Sync state is observable via `StateFlow<Map<ProviderId, SyncState>>` (status, last report, last success time) — the Telemetry Center reads this for "last sync" display.

Verified by `SyncEngineTest` (5 tests): initial import, idempotent re-sync (0 new records), offline queue + drain, non-retryable failure short-circuit, invalid record rejection.
