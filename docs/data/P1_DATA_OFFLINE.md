# P1-DATA â€” Offline & Sync Strategy

**Date:** 2026-09-01
**Scope:** Semantics and contracts. Full implementation spans P2-CORE, P7-WATCH, Room (if adopted).

---

## 1. Principles

1. **Server SoT** = Supabase Postgres (`activities`, `ascend_events`, `identity_profiles`, â€¦).
2. **Device cache** = queue + optional local DB â€” never authoritative for social/ASCEND.
3. **Idempotent keys** = `(provider, external_id)` for activities; `event_id` for XP.
4. **Strava** = own-athlete only; `shareable=false` enforced in DB.

---

## 2. Entity sync matrix

| Entity | Local (Android) | Local (Web) | Server | Merge key | Conflict |
|--------|-----------------|-------------|--------|-----------|----------|
| Identity profile | DataStore prefs | â€” | `identity_profiles` | Firebase UID | Server wins |
| Activity in progress | `ActivitySession` lease | â€” | â€” | `sessionId` + epoch | Stale epoch rejected |
| Completed activity | `DurableSyncQueue` + in-memory store | â€” | `activities` | `(provider, external_id)` | Upsert |
| Health Connect session | HC reader â†’ store | â€” | `activities` | HC record id | Upsert |
| Readiness | Computed UI | â€” | `readiness_snapshots` | `captured_at` + user | Append snapshot |
| XP event | AscendEngine queue | â€” | `ascend_events` | `event_id` | INSERT no-op |
| Badge | â€” | â€” | `user_badges` | `(user_id, badge_id)` | INSERT no-op |
| Notifications | FCM inbox | â€” | `user_notifications` | `id` | Server wins |
| Squad contribution | â€” | â€” | `squad_contributions` | event id | Idempotent |
| Social post | â€” | localStorage demo | `community_posts` | post id | Server wins |

---

## 3. Android persistence (current)

| Store | Path | Authoritative? |
|-------|------|----------------|
| `InMemoryWorkoutSessionStore` | `core/fitness/store/` | No â€” volatile |
| `DurableSyncQueue` | `foundation/offline/` | Outbox only |
| `EncryptedSharedPreferences` | `foundation/storage/` | Tokens/secrets |
| DataStore | `IdentityPrefs` | UI prefs |
| Room | `SocialSessionQueries.kt` DDL only | **Not shipped** |

**P1-DATA:** Documents contract. Room implementation deferred until persistence requirement proven (post-P1-DATA engineering).

---

## 4. Web persistence (current)

| Store | Path | Authoritative? |
|-------|------|----------------|
| localStorage | `gamification/store.ts`, `auth-store.ts` | **No** â€” LOCAL_DEMO |
| Server memory | `progression/server-store.ts` | Vitest fallback only |
| Supabase repos | `progression/supabase-repository.ts` | **Yes** when configured |

---

## 5. Wear (companion)

| Behavior | Contract |
|----------|----------|
| Local `wear-*` session ids | Temporary until phone sync |
| Telemetry inbox | Buffer â†’ phone â†’ `activities` / telemetry jsonb |
| Canonical source | Phone/Android app â€” not watch DB |

**Status:** BLOCKED for live ID reconciliation (P7-WATCH).

---

## 6. Health Connect boundary

P1-DATA defines **where synced HC data lands** (`activities`, telemetry columns).

P1-DATA does **not** implement:

- Room persistence
- WorkManager background sync
- Full sleep/steps readers
- Write-back to HC

See `docs/android/HEALTH_CONNECT.md`.

---

## 7. Offline test plan (target)

| Test | Phase | Status |
|------|-------|--------|
| Airplane mode â†’ complete â†’ reconnect â†’ one activity | P2-CORE | PLANNED |
| Crash mid-sync â†’ safe restart | P2-CORE | PLANNED |
| Duplicate XP on retry | P1-DATA | **PASS** (live RLS integration) |
| Watch sync dedup | P7-WATCH | BLOCKED |

---

## 8. Retention (document only)

| Data class | Note |
|------------|------|
| GPS route points | High volume â€” index `(activity_id, seq)`; retention policy TBD (legal/product) |
| Telemetry jsonb | Summarize for old activities in future |
| Domain events | Archive/partition after N days (TBD) |
| Notifications | Soft-delete via `read_at` |

No automatic deletion in P1-DATA.
