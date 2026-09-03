# P1-DATA â€” Realtime Strategy

**Date:** 2026-09-01
**Phase:** P1-DATA documents contracts. Production transport selection = **P3-REALTIME**.

---

## 1. Canonical event bus (persistence)

**SoT:** `public.domain_events`

| Field | Purpose |
|-------|---------|
| `event_id` | Global idempotency key |
| `event_name` | Semantic name (`activity.completed`, â€¦) |
| `actor_id` | Firebase UID (nullable for system) |
| `entity_id` | Related domain id (activity UUID, etc.) |
| `schema_version` | Payload evolution |
| `payload` | jsonb |

Cross-platform processors must dedupe on `event_id`.

### Documented event names (`CanonicalDomainEventName`)

| Event | Emitters | Consumers (target) |
|-------|----------|---------------------|
| `activity.started` | Android Train, Wear | Coach live view (P3) |
| `activity.paused` | Android, Wear | Squad (P6) |
| `activity.resumed` | Android, Wear | â€” |
| `activity.completed` | Android, Web API | ASCEND, Squad, Social, Notifications |
| `xp.awarded` | Progression service | Android/Web ASCEND UI |
| `badge.unlocked` | Badge evaluator | Notifications |
| `squad.joined` | Squad service | Notifications |
| `squad.activity` | Squad contribution | Squad feed |
| `comment.created` | Social API | Notifications |
| `reaction.created` | Social API | Feed counts |

---

## 2. Transport providers (current repo reality)

| Provider | Location | Default? | Role |
|----------|----------|----------|------|
| **BroadcastChannel** | `apps/web/lib/realtime/local-channel.ts` | **Yes** (CI/demo) | Same-tab ephemeral â€” not production |
| **Convex** | `convex/*`, `convex-transport.ts` | When `NEXT_PUBLIC_CONVEX_URL` set | Target app events (master plan P3) |
| **Supabase Realtime** | `supabase-transport.ts` | When configured | Presence/chat channels |
| **In-process bridge** | `bridge-store.ts` | Vitest | Test double |

**P1-DATA decision:** Persist events in Postgres (`domain_events`). Transport is **not** a second source of truth.

---

## 3. Android / Wear

| Path | Status |
|------|--------|
| `SupabaseRealtimeClient.kt` | Foundation stub |
| Wear Data Layer | Session control + telemetry inbox â€” not domain event bus |
| FCM | Push delivery â€” complements `user_notifications` |

Wear must not emit parallel XP/activity IDs â€” reconcile to `activities.id` on sync (P7).

---

## 4. Idempotency at realtime boundary

```
Client emits activity.completed (event_id=E1)
    â†’ INSERT domain_events ON CONFLICT DO NOTHING
    â†’ INSERT ascend_events ON CONFLICT DO NOTHING
    â†’ Downstream consumers check event_id
```

Retries, reconnects, and double-tap must not duplicate rewards.

---

## 5. Tests

| Suite | Coverage |
|-------|----------|
| `p1-data-activities-rls.integration.test.ts` | XP idempotent retry on same activity |
| P3 (future) | Multi-subscriber delivery, Convex fan-out |

---

## 6. Non-goals (P1-DATA)

- Removing BroadcastChannel default
- Convex production wiring
- Coach live dashboard realtime
- Squad live leaderboards
