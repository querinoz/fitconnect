# FitConnect — Architecture Risks (optional audit note)

**Date:** 2026-09-04 · AUDIT ONLY

---

## Answers to architectural questions

| # | Question | Answer | Confidence |
|---|----------|--------|------------|
| 1 | Canonical identity still singular? | **Yes in contract (P1-AUTH/DATA engineering)**; LOCAL_DEMO personas still present in UI/fixtures | MEDIUM |
| 2 | Canonical activity model singular? | **Yes as design (activities.id UUID)**; Wear still provisional `wear-*` | HIGH |
| 3 | ASCEND still singular? | **Engine singular**; demo-labeled users / Wear LocalDemo risk = **soft fork risk** | MEDIUM |
| 4 | Health Connect singular? | **Intended data core**; simulated/fixture paths remain | MEDIUM |
| 5 | GPS singular? | **Yes in core-capture outdoor runtime** (Fused + Room + CanonicalRouteRepository) | HIGH |
| 6 | MapLibre consuming canonical GPS? | **Yes by design** (FitConnectRouteMap / route repository); E2E may force canvas fallback | HIGH |
| 7 | Coach consuming canonical remote? | **PARTIAL** — HttpCoachRepository exists; many loops still BroadcastChannel/demo | MEDIUM |
| 8 | Realtime one architecture or multiple? | **Multiple transports**; **BroadcastChannel default** | HIGH |
| 9 | Wear using canonical activity/session IDs? | **No** — `wear-*` local; reconcile documented but not product-complete | HIGH |
| 10 | Production fallback to LOCAL_DEMO? | **Yes risk** — demo mode / LOCAL_DEMO labels / health “demo mode ok” paths | HIGH |
| 11 | Prisma/Supabase duplication future blocker? | **Yes (P2 debt)** — dual schema history remains | MEDIUM |
| 12 | Android durable enough for Wear? | **Almost for engineering start after ID design** — but **device outdoor evidence first**; Wear NOT_READY | MEDIUM |
| 13 | Android stable enough for full QA? | **Emulator-stable; not full-QA-ready** (dirty tree + physical gaps) | HIGH |
| 14 | Largest remaining engineering risk? | **Realtime multi-transport + demo default** and/or **ID fork on Wear** if started early; outdoor **main-thread GPS/Room** unmeasured | MEDIUM |
| 15 | Largest remaining human dependency? | **Firebase production + physical device** (tie: secrets vs evidence) | HIGH |
| 16 | Largest evidence gap? | **Physical GPS** (after claiming P2-GPS/MAP/E2E engineering PASS) | HIGH |

---

## Security readiness (light)

- Historical **P0-SEC = PASS** — **not re-run** this audit → do **not** treat as freshly certified.
- Obvious next-phase blockers: none that uniquely block Physical GPS verification.
- Watch: secret hygiene, route/activity ownership, Strava-never-social RLS (architecture rule still in force).

---

## Documentation inconsistencies (identify only)

| Doc | Issue |
|-----|-------|
| `NEXT_IMPLEMENTATION_PLAN.md` | Still says next = P2-GPS / historical RECONCILE — **stale** |
| `docs/audit/README.md` | Points next plan at Workout Wave 2 not started — **stale** |
| `OPEN_GYM_FEATURE_GAP.md` | Guided workout **MISSING** — **stale** vs Wave 2 (see `OPEN_GYM_CURRENT_GAP.md`) |
| `CLAUDE.md` historical sections | May conflict with master plan — do not rewrite historical PASS language blindly |

Superseding decision docs: this audit pack (`NEXT_PHASE_DECISION.md`, `NEXT_PHASE_READINESS_FINAL.md`).
