# FitConnect — Next Phase Dependency Graph

**Date:** 2026-09-04 · AUDIT ONLY
**Source of truth for “what next”:** [`NEXT_PHASE_DECISION.md`](./NEXT_PHASE_DECISION.md)

```
CURRENT VERIFIED FOUNDATION (engineering)
├── P1-DATA PASS (MEDIUM — prior reconcile)
├── P1-AUTH ENGINEERING PASS (MEDIUM — prod keys HUMAN)
├── WORKOUT WAVE 2 ENGINEERING PASS (MEDIUM)
├── P2-CORE ENGINEERING PASS (MEDIUM)
├── P2-GPS ENGINEERING PASS (HIGH unit / LOW physical)
├── P2-MAP ENGINEERING PASS (HIGH emu)
└── P2-MAP E2E HARDENING PASS 5/5 (HIGH prior / NOT re-run today)
        │
        ▼
WORKTREE RISK
├── HEAD 0a9155f · 14 ahead of origin
└── DIRTY (~165 paths) — GPS/Map/workout/telemetry uncommitted
        │
        ▼
CANDIDATE PHASES
├── ★ Physical GPS verification  ← RECOMMENDED
│     depends on: durable outdoor stack (exists)
│     blockers: physical phone + location permission (HUMAN)
│     unlocks: honest outdoor PRODUCTION claim path
│
├── P8-A11Y (2nd choice)
│     depends on: stable athlete UI (mostly exists)
│     blockers: TalkBack device pass; font-scale device
│     unlocks: a11y certification evidence
│
├── P8-PERF
│     depends on: measurement harness (dumpsys / traces)
│     blockers: no baseline metrics today
│     unlocks: risk triage (GPS/Room/MapLibre)
│
├── P3-REALTIME  → NOT_READY / DEFER
│     depends on: singular event contract, auth’d transport,
│                 identity, booking/activity schemas, RLS
│     blockers: BroadcastChannel still default;
│               Convex unauthenticated poll; Android WS weak
│
├── P7-WEAR → NOT_READY / DEFER
│     depends on: canonical activities.id/sessionId,
│                 phone durable sync, Message/Data contracts
│     blockers: wear-* local IDs; DataClient unused;
│               physical watch; LOCAL_DEMO tiles
│
├── P10-HUMAN INFRA → PENDING HUMAN (parallel track)
│     depends on: humans (Firebase/FCM/signing/legal/Redis)
│     blockers: cannot be closed by agent alone
│
└── P11-FULL QA → DEFER
      depends on: committed surfaces + physical GPS + a11y baseline
      blockers: dirty tree; many NOT_VERIFIED device surfaces
```

## Production implication chain

```
Physical GPS PASS (evidence)
  → outdoor claim honesty ↑
  → still PRODUCTION NO-GO until P10 human + auth prod + legal + Redis…

P3-REALTIME READY (future)
  → coach↔athlete cross-device
  → still needs P10 for real backends

P7-WEAR READY (future)
  → watch companion product
  → requires ID reconcile AFTER phone outdoor durable truth is proven on device
```

## Explicit non-edges

- Do **not** start Open Gym expansion from this decision (core readiness first).
- Do **not** start Push/FCM product work (FORBIDDEN in product phases).
- Do **not** treat `NEXT_IMPLEMENTATION_PLAN.md` “next = P2-GPS” as current (stale).
