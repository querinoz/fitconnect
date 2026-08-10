# Phase 05 — Offline Report

| Capability | Behavior |
|------------|----------|
| Offline banner | `coach_offline_banner` in `CoachOsApp` |
| Local reads | Always available via `LocalCoachRepository` |
| Mutations queued | favorite, reschedule, cancel, clone/publish/draft, booking approve/reject, inbox read |
| Retry | `CoachLoad` + `EliteErrorView` |
| Background sync | Foundation `OfflineCoordinator.flush` contract |

## Verified

`LocalCoachRepositoryTest.offlineBookingApproveQueuesSync` — pending count increments offline.
