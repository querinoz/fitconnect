# P1-DATA â€” Migration

## Rules

- **Never edit** migrations `001`â€“`015`.
- New work = forward-only files (`016_â€¦` onward).
- Apply via `node scripts/db-apply-supabase-migrations.mjs` (splits on `--;;`).

## Applied

| File | Status |
| --- | --- |
| `001`â€“`015` | Preserved / already applied |
| `016_p1_data_canonical.sql` | **Applied** 2026-08-29 (`SUPABASE_MIGRATIONS_OK`) |

## What 016 adds

| Object | Purpose |
| --- | --- |
| `activities` | Canonical activity + SI units + Strava `shareable` |
| `activity_route_points` | GPS points schema (empty until P2-GPS) |
| `readiness_snapshots` | Firebase-UID readiness (formula_version) |
| `badge_definitions` / `user_badges` | Catalog + idempotent awards |
| `user_notifications` | Firebase-UID notifications |
| `domain_events` | Cross-platform `event_id` bus |
| `connected_devices` | Watch / HC / FCM metadata |
| `data_schema_meta` | Observability (`schema_version=016`) |
| `ascend_events.source_*` | Explicit XP source for audits |
| `squad_contributions.last_*` | Link last activity/event |

## Deprecated (kept, not dropped)

| Table | Why kept |
| --- | --- |
| `workout_sessions` | uuid + `auth.uid()` â€” incompatible with Firebase text UID |
| `profiles` | Legacy Supabase Auth uuid |
| `readiness_scores` / `hrv_readings` | uuid athlete_id |
| `notifications` / `push_tokens` | uuid user_id |

**Delete safety:** search refs â†’ deprecate â†’ migrate â†’ remove only when proven unused.

## Rollback strategy

016 is additive. Rollback = stop writing new tables; dropping requires a dedicated reverse migration after proving no writers. Do not drop in panic.

## Snapshot

Pre-016 inventory: 34 public tables (script `scripts/p1-data-schema-inventory.mjs`).
Post-016: same + canonical tables above; `schema_migrations` includes `016_p1_data_canonical.sql`.
