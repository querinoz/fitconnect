# Phase 08 — Offline Telemetry Report

Telemetry never disappears because the network did.

| Requirement | Implementation |
|---|---|
| Local queue | `TelemetrySyncEngine.pendingQueue` — sync requests issued while offline are queued, not dropped |
| Pending sync | `pendingCount()` + `SyncStatus.PENDING_NETWORK` published to UI state |
| Retry queue | queued entries re-run with the full retry/backoff pipeline on drain |
| Sync state | `StateFlow<Map<ProviderId, SyncState>>` |
| Partial sync / resume | per-page checkpoints — resume continues from last cursor |
| Network recovery | `drainPending()` executes queued syncs when `ConnectivityMonitor.online` returns |
| Background sync | `BackgroundSyncPolicy` (WorkManager-shaped, see Battery_Report) |
| Battery-aware | `requiresBatteryNotLow = true` by default |

Local reads (store, aggregation, facades) are fully offline — all data already imported remains queryable with zero network.

Verified by `SyncEngineTest.offlineSyncQueuesAndDrainsOnRecovery`: offline sync → PENDING_NETWORK, 0 records stored; connectivity restored → drain → SUCCESS, records present, queue empty.
