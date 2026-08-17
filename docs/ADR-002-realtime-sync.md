# ADR-002 — Realtime sync across phone, watch, and web

**Status:** Accepted (target contract). Implementation is **partial**.  
**Date:** 2026-08-18  
**Deciders:** Staff engineer (this session)  
**Related:** `docs/architecture/WATCH_MOBILE_SYNC.md`, `TELEMETRY_PIPELINE.md`, `android/shared`

---

## Context

“Realtime” is four different channels. Collapsing them into one WebSocket is how fitness apps double-start sessions.

| Link | Channel today | Target latency | Evidence |
|---|---|---|---|
| Watch ↔ phone | Wearable Data Layer (`play-services-wearable`, capability `fitconnect_telemetry`) | ≤1s | Unit outbox/dedupe **PASS**. Device round-trip **UNVERIFIED** (no Wear AVD / hypervisor). |
| Phone ↔ cloud | `RealtimeClient: Flow<String>`; Supabase WS if keys; else InProcess / fail-closed | ≤2s | PARTIAL / PENDING_HUMAN |
| Web ↔ cloud | `resolveTransport`: presence/chat → Supabase; else Convex or Broadcast | ≤2s | Default in docs is **broadcast** (same-tab / demo) |
| Watch standalone (LTE/WiFi) | **Not implemented** | ≤3s | Companion-only |

Local persistence:

- Android: **no Room**. Athlete/community stores are in-memory / DataStore prefs.
- Web: **no IndexedDB** as source of truth (`localStorage`/Zustand still appear).
- Wear: in-process `OutboxQueue` + `LiveActivityEngine`.

`ActivitySession.deviceId` exists. **Exclusive owner + transfer protocol do not.** Two devices can both call START.

## Decision

### 1. Channels (non-negotiable)

```
WATCH  --Data Layer / Bluetooth-->  PHONE  --HTTPS + Realtime-->  CLOUD  <--same-->  WEB
WATCH  --(future LTE)------------>  CLOUD
```

Data Layer never carries cloud auth. Cloud never replaces Data Layer while the watch is paired.

### 2. Offline-first (target)

Each surface writes local first; UI never blocks on network.

| Surface | Local store (target) | Today |
|---|---|---|
| Phone | Room (`session`, `outbox`, `telemetry_sample`) | In-memory + `OutboxQueue` in `:shared` |
| Web | IndexedDB (Dexie or equivalent) + sync layer | Zustand / demo stores |
| Wear | Wear local + `OutboxQueue` | `OutboxQueue` in sender (good seed) |

Until Room/IndexedDB ship, label the UI `LOCAL_DEMO` / cache timestamp **unknown**.

### 3. Conflict resolution (declared, not improvised)

Record fields (history, profile, settings):

1. Compare `updatedAt` (ISO-8601 / epoch ms, monotonic per writer).
2. Tie-break: lexicographic `deviceId` (stable, never `String.hashCode`).
3. Never silent-drop: the losing write goes to `conflict_log` (outbox table) for debug.

**Active session fields** (`state`, `elapsed`, current set): **owner wins**. Non-owner writes are rejected with `SESSION_OWNED_BY {deviceId}` until transfer completes.

Vector clocks are deferred. They are not required while one owner is enforced.

### 4. Active session lock (the case that breaks fitness apps)

Invariant: **at most one owner device per `sessionId` in ACTIVE | PAUSED | FINISHING.**

Protocol:

1. START: client proposes `{sessionId, deviceId, sportKey, updatedAt}`.
2. Local store accepts only if no other owner, or owner is self.
3. Cloud/phone replica: same check. Watch uses Data Layer `/session/state` as the replica while paired.
4. Non-owner UI: banner “Sessão a decorrer no {watch|phone}” + **Transfer** (not a second START).
5. Transfer: owner sends `TRANSFER_OFFER` → other ACK → owner becomes spectator, new owner writes. Timeout 8s → offer cancelled, original owner keeps session.
6. Logout on web **must not** END a phone/watch session (scenario 9). Auth session ≠ training session.

`ActivitySessionMachine` stays the transition table. Ownership is a wrapper, not a new sport state.

### 5. Origin indicator

Every live metric renders `DataSourceKind`:

| Kind | UI glyph (text, not emoji-only) | When |
|---|---|---|
| REAL_SENSOR on watch | WATCH | Health Services AVAILABLE |
| Phone GPS / sensors | PHONE | Phone is owner |
| HEALTH_CONNECT | IMPORT | Historical, never live HR |
| LOCAL_DEMO / TEST_FIXTURE / EMULATED_SENSOR | DEMO | Must stay visible |

Do not show a heart-rate integer as live if availability is UNAVAILABLE.

### 6. Reconnect / idempotency

Reuse `:shared` `OutboxQueue` + `SequenceDeduper`:

- Enqueue by `(deviceId, sessionId, sequenceNumber)`.
- ACK removes. Retry increments. Replay of the same sequence = DUPLICATE, not a second session.
- Cloud writes use idempotency keys = that triple (or UUID from START).

### 7. Event contract

`FitConnectRealtimeEvent` in `:shared` is the typed envelope. Web must speak the same JSON, not a parallel `Nudge` forever. Migration: map web `use-channel` payloads onto this sealed class; do not invent a third schema.

Transport priority for cloud:

1. Supabase Realtime when auth keys exist (ADR-009 database already Supabase).
2. Convex only for coaching presence if already configured.
3. Broadcast = **demo / same-tab**. Never production.

## Consequences

- Implement `SessionOwnership` next to `ActivitySession` before any “sync the three surfaces” UI.
- Phone Activity and Wear START buttons share the lock.
- Web dashboard shows the lock banner (maquette in `docs/mockups/dashboards.html`).
- Wear ambient mode (B/W, no honeycomb, 1/min refresh) is a **battery** requirement of long sessions, orthogonal to sync, but blocking for Wear FASE 2C.
- Scenarios 1–10 in MEGA PROMPT §12 are the acceptance tests. Latency without a measured number is `⏭️`.

## What this ADR does **not** claim

- Cloud realtime is live in production.
- Watch standalone works.
- Room or IndexedDB exist.
- Exclusive lock is coded (only `deviceId` on the session record).
