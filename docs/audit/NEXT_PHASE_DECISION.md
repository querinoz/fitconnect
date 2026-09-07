========================================
FITCONNECT — NEXT PHASE DECISION
========================================

**Date:** 2026-09-04
**Mode:** AUDIT ONLY · NO IMPLEMENTATION · NO COMMIT · NO PUSH
**Git:** `feat/elite-os-v2` @ `0a9155f` · 14 ahead / 0 behind · DIRTY worktree

CURRENT STATE:
P1-DATA = PASS (MEDIUM — prior reconcile; not re-proven schema-live this audit)
P1-AUTH = ENGINEERING PASS (MEDIUM — prod keys HUMAN)
WORKOUT WAVE 2 = ENGINEERING PASS (MEDIUM)
P2-CORE = ENGINEERING PASS (MEDIUM)
P2-GPS = ENGINEERING PASS (HIGH unit this audit; physical NOT_VERIFIED)
P2-MAP = ENGINEERING PASS (HIGH unit this audit)
P2-MAP E2E HARDENING = PASS 5/5 (prior session; not re-run today)
WEB = typecheck PASS · **478/478** tests PASS (this audit)
ANDROID = assembleDebug PASS (this audit)
REAL DEVICE GPS = NOT_VERIFIED
PRODUCTION = NO-GO
PUSH = FORBIDDEN

----------------------------------------
CANDIDATE SCORING (1–5)
USER VALUE · TECH RISK · DEPENDENCIES · READINESS · PROD IMPACT · EVIDENCE GAP
(optimize: high value + low unresolved dependency risk + strong foundation)
----------------------------------------

P3-REALTIME
readiness: NOT_READY (BroadcastChannel default; multi-transport; no cloud auth/replay)
value: 5 · risk: 5 · dependencies: 5 · readiness: 1 · prod impact: 4 · evidence gap: 4
verdict: DEFER — foundational but unsafe to start; not “ready”

P7-WEAR
readiness: NOT_READY (`wear-*` IDs; DataClient unused; pair NOT_VERIFIED)
value: 4 · risk: 4 · dependencies: 4 · readiness: 2 · prod impact: 3 · evidence gap: 5
verdict: DEFER — exciting ≠ ready; ID reconcile after phone outdoor honesty

P8-A11Y
readiness: NOT_READY cert / startable focused
value: 3 · risk: 2 · dependencies: 2 · readiness: 3 · prod impact: 3 · evidence gap: 4
verdict: STRONG SECOND — TalkBack gap real; UI stable enough

P8-PERFORMANCE
readiness: NOT_READY (no baseline metrics)
value: 3 · risk: 3 · dependencies: 2 · readiness: 2 · prod impact: 3 · evidence gap: 4
verdict: DEFER — measure later; do not optimize now

P10-HUMAN
readiness: PENDING HUMAN (parallel)
value: 5 (for GO) · risk: 1 (agent) · dependencies: 5 · readiness: 1 (agent) · prod impact: 5 · evidence gap: 3
verdict: PARALLEL HUMAN TRACK — not sole next agent phase unless org prioritizes release config over outdoor evidence

P11-FULL-QA
readiness: NOT_READY (dirty tree; many device gaps)
value: 4 · risk: 3 · dependencies: 4 · readiness: 2 · prod impact: 4 · evidence gap: 5
verdict: DEFER — do not choose QA only because gaps exist

PHYSICAL DEVICE GPS
readiness: CODE READY / DEVICE PENDING HUMAN
value: 4 · risk: 1 · dependencies: 3 (phone) · readiness: 4 (code) · prod impact: 4 · evidence gap: 5
verdict: **BEST NEXT** — closes largest honesty gap after P2 outdoor PASS claims

OTHER (worktree reconcile / commit hygiene)
value: 3 · risk: 1 · dependencies: 2 · readiness: 5 · — ops enabler, not product phase
verdict: Recommended as **prerequisite ops** before/during evidence, not the named product phase

----------------------------------------
RECOMMENDED NEXT PHASE:
Physical GPS verification
(narrow evidence phase — verify-first; fix only real device defects; no feature expansion)
----------------------------------------

WHY:
1. Repository just claimed P2-GPS / P2-MAP / P2-MAP E2E HARDENING engineering PASS with strong emulator evidence — the single largest remaining **truth gap** is physical GPS.
2. Lowest technical risk among high-impact candidates (verify + surgical fix pattern already proven in E2E hardening).
3. Strongest foundation: outdoor capture, Room route store, MapLibre, sync handlers already in tree.
4. Does not require Firebase production secrets, Wear hardware, or cloud Realtime architecture.
5. Realtime and Wear score high on value but **NOT_READY** on architecture/IDs — starting them now recreates “file exists = done”.
6. Full QA is premature on a dirty tree; A11y is valuable but secondary to outdoor claim honesty.

DO NOT START:
- P3-REALTIME implementation
- P7-WEAR product integration
- Open Gym feature expansion
- Push / FCM product phase
- Broad P8-PERF optimization without baselines
- P11 mega QA campaign
- Production GO claims
- Dependency upgrades / migrations / secret configuration

CRITICAL BLOCKERS (for recommended phase):
- Physical Android phone + location permission (HUMAN)
- Optional: clear protocol under docs/qa for outdoor run evidence

HUMAN DEPENDENCIES:
- Device access for GPS (required for this phase’s PASS)
- Firebase/FCM/Play signing/legal/Redis remain CRITICAL for production GO but **out of scope** for this phase

IF PHYSICAL PHONE UNAVAILABLE:
Authorize **P8-A11Y focused TalkBack certification** (athlete Train + Guided) as fallback next phase.

PRODUCTION:
NO-GO

IMPLEMENTATION FROM THIS AUDIT:
NONE
