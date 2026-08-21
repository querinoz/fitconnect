# Phase 00 — Risk Assessment

**Date:** 2026-08-07

---

## Risk register

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|----|------|------------|--------|----------|------------|-------|
| R01 | Kotlin + Rust capacity can't keep pace by F2 | Med | High | **P0** | Kill switch in ADR-005: cut Wear + capture → import-first Android | Eduardo + eng |
| R02 | Emulator/device unavailable → blind Android UI | High (now) | High | **P0** | Enable BIOS SVM or USB phone; block F3 visual sign-off until then | Eduardo |
| R03 | Demo mode left ON in production | Med | Critical | **P0** | Env validation in CI/deploy; staging smoke asserts demo false | Eng |
| R04 | Dual schema causes data corruption on unify | Med | High | **P1** | ADR-009; inventory mapping table; expand-contract migrations | Eng |
| R05 | Elite Core formulas wrong vs physiology | Med | High | **P1** | sports-metrics.md + Golden Cheetah + F10 pro review | Eng + reviewer |
| R06 | Play Store rejects FGS / Health Connect | Med | High | **P1** | Early declaration drafts; honest battery rationale | Eng |
| R07 | BLE hardware not available for F5 gate | High | Med | **P1** | D3 HUMAN-QUEUE; buy used straps early | Eduardo |
| R08 | Legal blocks archive ZIP import | Unknown | Med | **P2** | F8b deferred; F8 ships without it | Eduardo (D4) |
| R09 | Scope creep reintroduces LiveKit/marketplace/Stripe-live | Med | High | **P1** | Feature lockdown + BACKLOG-V2 only | Both |
| R10 | Orphan cleanup deletes live dynamic import | Low | Med | **P2** | Grep + runtime smoke before delete | Eng |
| R11 | Dependency audit criticals exploited | Low | High | **P1** | Scheduled upgrade train post-Phase 00 | Eng |
| R12 | Reopening Expo path mid-flight | Low | Critical | **P0** | ADR-005 + Path A decision logged | Eduardo |
| R13 | i18n/default lang flash (pt) harms global launch | Med | Low | **P3** | Product decision on DEFAULT_LANG | Eduardo |
| R14 | Convex vs Supabase realtime indecision | Med | Med | **P2** | Decide at start of F11; one primary | Eng |
| R15 | Identity cuid vs Supabase UUID never linked | High | High | **P0** | Explicit linking table in F2 | Eng |

---

## Assumptions log

| Assumption | If false |
|------------|----------|
| `com.fitconnect.android` applicationId acceptable | Rename before Play upload |
| Owner reviews Rust slowly but steadily | Extend F1 calendar; more READMEs |
| Supabase remains auth + Postgres host | Revisit ADR-009 only with trigger metrics |
| Wear OS is cuttable | F14 skipped; v1 still valid |
| No iOS in v1 | Do not add ios platform flags / App Store work |

---

## Uncertainties (stop & ask — not invent)

1. Production: which schema is actually applied today (Prisma migrate vs Supabase SQL)?
2. Production: is `NEXT_PUBLIC_DEMO_MODE` already false on Vercel?
3. D3 hardware inventory (blank).
4. D4 legal status for archive import (blank).
5. Keep or cut `packages/ai` before F10?
6. Is Convex deployed with a real URL in any environment?

These remain in `qa/HUMAN-QUEUE.md` / this register until answered.
