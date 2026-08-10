# Phase 07 — Offline Maps Report

| Capability | Implementation |
|------------|----------------|
| Cached regions | `GeoOfflineStore.cacheRegion` |
| Offline search | `offlineSearch` over cached places |
| Offline booking queue | `enqueueBookingAction` / `flushBookingQueue` |
| Offline favorites | `favorite` / `unfavorite` |
| Offline routes | `storeRoute` |
| Offline discovery mode | `setOfflineMode(true)` reads cache |

Tile download for MapLibre regions is architecture-ready (region bounds stored); native tile packager deferred.
