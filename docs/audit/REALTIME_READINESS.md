# FitConnect — Realtime Readiness (P3)

**Date:** 2026-09-04 · AUDIT ONLY · NO IMPLEMENTATION
**Verdict: P3-REALTIME = NOT_READY (DEFER)**
**Confidence: HIGH** (direct code defaults + package underuse)

---

## Executive summary

Realtime is **multi-transport and demo-default**. Production cross-device coach↔athlete sync **cannot** work on the default path today. BroadcastChannel remains the resolved default when `NEXT_PUBLIC_REALTIME_PROVIDER` is unset.

---

## What exists (classified)

| Layer | Classification | Evidence |
|-------|----------------|----------|
| `BroadcastChannelTransport` | **LOCAL / DEMO / CI-default** | `apps/web/lib/platform/realtime/broadcast-transport.ts` — “Dev/demo transport”; `health.ts` / `routing.ts` default `"broadcast"` |
| CI / fixtures | **CI-ONLY / DEMO** | `tests/fixtures/domain.ts` forces `NEXT_PUBLIC_REALTIME_PROVIDER: "broadcast"` |
| Convex transport | **SIMULATED-ish / HTTP poll** | `convex-transport.ts` — falls back to BroadcastChannel without URL; historically ~2s poll, weak auth story |
| Supabase Realtime | **PARTIAL / REAL capability unused end-to-end** | Presence/chat pockets; not singular product bus |
| `@fitconnect/realtime-client` / typed events | **ENGINEERING ONLY / largely DEAD for product UI** | Package exists; product loops still use BroadcastChannel hooks |
| Android WS | **ENGINEERING ONLY / weak auth** | Prior audit: WS without solid JWT feature subscribers |
| Coach booking inbox | **LOCAL (same-browser)** | `use-coach-booking-inbox.ts` — BroadcastChannel |
| Dashboard copy | **DEMO UX** | Coach/athlete dashboards instruct “open second tab” for BroadcastChannel loops |

---

## Architecture mental model (as-is)

```
Event producer (UI / API)
  → ad-hoc payloads (not one FitConnectRealtimeEvent bus)
  → transport = BroadcastChannel (default) | Convex poll | Supabase partial
  → subscriber = same-origin tab / poll client
  → authorization = mostly absent on demo path
  → reconciliation = none (no cloud replay/dedupe)
```

### Required production properties — status

| Property | Status |
|----------|--------|
| Event identity | **MISSING** singular contract in product path |
| Ordering | **NOT GUARANTEED** cross-device |
| Replay | **MISSING** |
| Dedupe | **MISSING** |
| Reconnect | **PARTIAL** at library level; not product-proven |
| Stale state | **UNHANDLED** cloud-side |
| Cross-device sync | **IMPOSSIBLE** on BroadcastChannel default |
| RLS/auth boundaries | **NOT wired** as realtime gate on default path |

---

## Can production realtime work today?

**No.** Switching env to a non-broadcast provider without finishing auth’d contracts, event schemas, and subscriber authorization would be unsafe.

---

## Verdict detail

| Question | Answer |
|----------|--------|
| Ready to authorize P3 implementation? | **NOT_READY** |
| Blocked on human secrets alone? | **No** — architecture incomplete first |
| Defer? | **Yes — DEFER** until outdoor device evidence + identity sync semantics are honest |

**Do not start P3-REALTIME as the next phase.**
