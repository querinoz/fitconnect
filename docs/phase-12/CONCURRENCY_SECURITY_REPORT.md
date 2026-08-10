# Phase 12 — Concurrency Security Report

## Race-prone areas

| Area | Mechanism | Risk |
|------|-----------|------|
| Telemetry consent | `Mutex` in `TelemetryPrivacyManager` | TOCTOU between check and read — mitigated by single mutex |
| Account switch + sync flush | Async coroutines | Stale flush after logout |
| Session store reads | NavGuard + API parallel | Inconsistent role mid-switch |
| AI tool parallel calls | `AiToolRuntime` timeout | Double audit — acceptable |
| Web API concurrent requests | Stateless | IDOR per request — OK |
| Offline queue enqueue/flush | DurableSyncQueue | Duplicate flush — idempotency TBD |

## Phase 12: account isolation

`AccountIsolationController` runs on logout/switch **before** new session is fully active — callers must await wipe in `LocalAuthRepository.logout()`.

**Risk:** Background sync job started pre-logout completes post-logout with old token.

**Mitigation (target):**

1. Cancel in-flight sync on logout
2. Server rejects token after session clear
3. Queue cleared synchronously (implemented)

## Android patterns

- `TelemetryPrivacyManager`: `mutex.withLock { }` on all consent mutations and reads
- Coroutine scopes in `OfflineCoordinator` — verify structured concurrency on logout

## Web patterns

- No shared mutable auth state in route handlers
- Supabase `getUser()` per request

## Recommendations

1. Logout hook: cancel `OfflineCoordinator` jobs
2. Single-flight token refresh (OkHttp Authenticator)
3. Integration tests: logout during active sync

## Verdict

Telemetry consent races **mitigated with Mutex**. **Logout vs background sync race** — partially addressed by queue clear; **cancel in-flight network** not verified.
