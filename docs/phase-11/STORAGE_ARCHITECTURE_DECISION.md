# STORAGE_ARCHITECTURE_DECISION.md

## Decision (Phase 11)

Keep current storage split; do **not** migrate telemetry to Room/SQLite in this phase.

| Data class | Store | Rationale |
|------------|-------|-----------|
| Auth tokens / session | EncryptedSecureStore (lazy) | Security mandatory |
| Prefs / flags / theme | DataStore | Lightweight |
| Offline outbox | DurableSyncQueue (SharedPreferences JSON) | Survives process death; bounded |
| Telemetry samples | InMemoryTelemetryStore + prune + pagination | Volume not yet measured on devices; Room ADR deferred |
| HTTP GET cache | LruStringCache (64) | Bounded memory |

## Why not Room yet

- No measured production telemetry volume on device
- Store API already paginated / index-shaped for Room swap
- Migrating without evidence violates Phase 11 absolute rule

## Trigger to revisit

When retained samples regularly exceed `PerformanceBudget.TELEMETRY_SAMPLES_PER_ATHLETE` after prune, or query latency > 50ms p95 on mid-range — introduce Room behind `TelemetryStore`.
