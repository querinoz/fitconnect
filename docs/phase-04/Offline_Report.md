# Phase 04 — Offline Report

## Contract

Athlete OS is offline-first via `LocalAthleteRepository` + foundation `OfflineCoordinator` / `SyncQueue`.

| Capability | Behavior |
|------------|----------|
| Cache | In-memory coherent snapshot served for all reads |
| Connectivity | `ConnectivityMonitor.online` drives banner |
| Offline banner | Top bar in `AthleteOsApp` (`athlete_offline_banner`) |
| Mutations | `toggleTask` / enroll enqueue `SyncWork` when offline |
| Retry | `AthleteLoad` + `EliteErrorView` retry affordance |
| Conflict resolution | Orchestration contract on `OfflineCoordinator` (feature-level merge algorithms deferred to API adapters) |

## Verified in unit tests

`LocalAthleteRepositoryTest.offlineTaskToggleQueuesSync` — offline toggle increments pending sync count.

## Not yet

- Room durable cache for Athlete entities  
- Server conflict merge strategies for training notes  
- Background WorkManager drain UI affordance beyond pending queue
