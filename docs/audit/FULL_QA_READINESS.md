# FitConnect — Full QA Readiness (P11)

**Date:** 2026-09-04 · AUDIT ONLY · NO giant QA campaign executed

**Verdict: P11-FULL QA = NOT_READY / DEFER**
**Confidence: HIGH** (coverage holes are explicit)

---

## Why not now

- Worktree **DIRTY** (~165 paths) — QA against mixed committed/uncommitted truth is unreliable.
- Outdoor stack **emulator-strong**, **physical GPS NOT_VERIFIED**.
- Wear / Realtime / TalkBack / Perf largely **NOT_VERIFIED**.
- Production backend / RLS live certification **not** claimed this audit.
- Choosing Full QA “because many things are unverified” violates the decision rule — prefer closing the **largest single evidence gap** first (physical GPS).

---

## Coverage matrix

| SURFACE | UNIT | INSTRUMENTATION | EMULATOR | PHYSICAL DEVICE | WEB RUNTIME | REAL BACKEND | RLS | STATUS |
|---------|------|-----------------|----------|-----------------|-------------|--------------|-----|--------|
| Web lib/UI | **PASS 478** (this audit) | N/A | N/A | N/A | typecheck PASS | NOT_VERIFIED full | NOT_VERIFIED fresh | STRONG UNIT |
| Web E2E Playwright | Historical CI | — | — | — | NOT RUN this audit | — | — | NOT RUN |
| Android assemble | N/A | N/A | **PASS** | — | — | — | — | BUILD PASS |
| GPS unit | **PASS** | — | — | **NOT_VERIFIED** | — | — | — | ENG PASS / EVIDENCE GAP |
| Map unit | **PASS** | — | — | **NOT_VERIFIED** | — | — | — | ENG PASS |
| Outdoor Map E2E | — | **PASS 5/5 prior** | YES | NO | — | Injected geo | — | EMU PASS |
| Guided workout | Prior PASS | Prior instrumentation | YES | NOT_VERIFIED | — | — | — | ENG PASS |
| Health Connect | Partial unit | Partial | Partial | NOT_VERIFIED | — | — | — | PARTIAL |
| Auth | Eng tests | — | — | Prod auth NOT_VERIFIED | — | Firebase HUMAN | — | ENG PASS |
| Realtime | BC tests | — | same-tab | N/A cross-device | BC default | NO cloud | NO | NOT_READY |
| Wear | Limited | — | Limited | **NOT_VERIFIED** | — | — | — | NOT_READY |
| Coach remote | Partial | — | — | — | Partial | NOT_VERIFIED | — | PARTIAL |
| Athlete UI | Nav contract tests | Visual tour historical | YES | NOT_VERIFIED | — | — | — | ENG STRONG |
| Offline | Queue handlers | Partial | Partial | NOT_VERIFIED | — | — | — | PARTIAL |
| Accessibility | Static semantics | Tags for E2E | — | TalkBack **NOT_VERIFIED** | — | — | — | NOT_READY cert |
| Performance | — | — | dumpsys **NOT** | **NOT** | LCP **NOT** | — | — | UNVERIFIED |
| Security | Historical P0-SEC | — | — | — | — | — | Historical | NOT re-certified |
| Social/Squad | Seed/demo | — | — | — | — | Strava forbidden | Architecture rule | DEMO / constrained |

---

## Entry criteria for authorizing P11 later

1. Worktree reconciled / reviewable commits for outdoor+map+workout.
2. Physical GPS evidence recorded (PASS or documented FAIL with fixes).
3. Minimum TalkBack script evidence on Train + Guided.
4. Explicit out-of-scope list (Wear, cloud Realtime, Push).
5. Production remains **NO-GO** unless P10 also advances.

---

## Recommendation

**Do not authorize P11-FULL QA as the next phase.**
Authorize **Physical GPS verification** (narrow evidence) instead.
