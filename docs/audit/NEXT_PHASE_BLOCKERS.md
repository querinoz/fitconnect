# FitConnect — Next Phase Blockers

**Date:** 2026-09-04 · AUDIT ONLY

---

## CODE BLOCKERS (engineering)

| Blocker | Severity | Blocks |
|---------|----------|--------|
| BroadcastChannel still default realtime | P1 architecture | P3-REALTIME production |
| No singular cloud event contract / replay / dedupe | P1 | P3 cross-device |
| Wear `wear-*` session IDs ≠ `activities.id` | P1 | P7-WEAR product truth |
| DataClient unused on Wear | P2 | Durable watch sync |
| LOCAL_DEMO still widespread in athlete/coach/wear presentation | P2 | Honest prod claims |
| Dirty worktree (~165 paths) mixed with 14 unpushed commits | P1 ops | Reliable QA / review |
| Stale docs (`NEXT_IMPLEMENTATION_PLAN` → P2-GPS) | P3 docs | Decision confusion |
| Prisma/Supabase dual history | P2 future | Schema single-source |

---

## CONFIGURATION BLOCKERS

| Blocker | Status |
|---------|--------|
| Firebase production + JWT trust | PENDING HUMAN |
| Google OAuth production clients | PENDING HUMAN |
| Release `google-services` / Crashlytics | PENDING HUMAN |
| Production Redis | PENDING HUMAN |
| Stripe live (payments) | PENDING HUMAN (later) |
| Domains/certs | UNKNOWN / PENDING HUMAN |

---

## HUMAN BLOCKERS

| Blocker | Critical for |
|---------|--------------|
| Physical phone | **Physical GPS** (recommended phase), HC smoke, TalkBack |
| Physical Wear watch | P7 E2E |
| Play signing / Play Console | Store release |
| Legal copy review | Launch |
| FCM policy owners | Push (still FORBIDDEN as product phase) |

---

## EVIDENCE BLOCKERS

| Gap | Confidence | Impact |
|-----|------------|--------|
| **Physical GPS NOT_VERIFIED** | HIGH gap | Largest outdoor honesty gap |
| TalkBack NOT_VERIFIED | HIGH gap | A11y certification |
| dumpsys / LCP NOT_VERIFIED | MEDIUM | Perf phase premature |
| Phone↔Wear E2E NOT_VERIFIED | HIGH | Wear phase premature |
| Cross-device realtime NOT_VERIFIED | HIGH | Realtime phase premature |
| Security not re-certified this session | — | Do not claim fresh P0-SEC PASS |
| OutdoorMap E2E not re-run this audit | — | Prior 5/5 stands as MEDIUM–HIGH historical |

---

## What does NOT block the recommended next phase

Physical GPS verification does **not** require:

- Firebase production secrets
- Wear hardware
- Cloud Realtime
- Stripe
- Full QA campaign
- Open Gym features

It **does** require a physical Android phone with location permission (HUMAN device access).
