# Phase 12 — Offline Security Report

## Components

| Component | Path |
|-----------|------|
| Sync queue | `android/foundation/offline/SyncQueue.kt` |
| Durable queue | `android/foundation/offline/DurableSyncQueue.kt` |
| Offline coordinator | `android/foundation/offline/OfflineCoordinator.kt` |
| Account isolation | `AccountIsolationController` — clears queue on logout/switch |

## Phase 12: account isolation

**Problem:** Offline outbox could contain prior user's mutations after logout or account switch.

**Fix:** `AccountIsolationController`:

- `wipeForLogout()` → `syncQueue.clear()` + session clear
- `wipeForAccountSwitch()` → clears queue when `security.last_user_id` changes

Wired from `LocalAuthRepository` via `AppContainer`.

## Threat model

| Threat | Mitigation | Status |
|--------|------------|--------|
| Cross-account mutation replay | Queue clear on switch/logout | **Fixed** |
| Tampered queue entries on rooted device | Server auth on sync | Server TBD |
| Sensitive data in queue plaintext | Encrypted prefs for secrets; queue payload review | Partial |
| Infinite queue growth | Phase 11 bounded/durable queue | PASS |

## Sync authorization (target)

When flush executes against API:

- Must attach current session token
- Server validates actor matches mutation subject
- Reject stale entries after logout (token invalid)

## Gaps

| Gap | Notes |
|-----|-------|
| Server-side idempotency keys | Not universal |
| Conflict resolution authz | Documented in Phase 11 — not security-audited |
| Web offline (PWA) | Service worker cache — separate surface |

## Tests

- `OfflinePerformanceTest.kt`
- Phase 11: durable queue survives process death

## Verdict

**Cross-account offline leakage: mitigated** via isolation controller. **Server sync authz** remains required for production.
