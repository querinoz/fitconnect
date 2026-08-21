# Phase 02 — Offline Report

## Architecture

1. `SyncQueue` (in-memory) — durable Room swap later without API change  
2. `OfflineCoordinator.enqueue` — respects `FeatureFlag.OFFLINE_SYNC`  
3. `flush()` on network reconnect via `AppLifecycle.onReconnect`  
4. GET response cache in `OkHttpApiClient` when sync flag on  

## Supported contracts

- Offline cache (GET)  
- Sync queue  
- Reconnect flush  
- Conflict resolution **port readiness** (executor injectable; algorithm deferred)  
- Background sync **hook** (lifecycle reconnect; WorkManager deferred)

## Gaps

- Not durable across process death  
- No WorkManager / exact alarms  
- Conflict strategy not implemented (no domain entities yet)
