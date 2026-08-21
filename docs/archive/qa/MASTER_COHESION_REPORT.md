# FitConnect — Master cohesion report

**Date:** 2026-08-19  
**Certification:** **NOT COHESIVE**

This report answers the golden question with evidence only. Compilation is not quality. Screen existence is not a flow.

---

## Scorecard (derived from checklists)

Scoring rule: each dimension lists N binary items. PASS=1, PARTIAL=0.5, FAIL=0. BLOCKED and PENDING_HUMAN are **excluded from the denominator** (they do not inflate the score).

### VISUAL COHESION — 4.5 / 7 = **64 / 100**

| # | Item | Result |
|---|---|---|
| 1 | Landing uses floor + Volt + Elite OS wordmark | PASS (live `/`) |
| 2 | Athlete dashboard uses same token language | PASS (live `/dashboard?demo=1` tree) |
| 3 | Coach OS uses same token language | PASS (live `/coach/dashboard?demo=1`) |
| 4 | Wear screenshot uses floor + Volt + LOCAL_DEMO | PARTIAL (file exists, **not recaptured** this run) |
| 5 | Live Android screens recaptured | BLOCKED (`adb` empty) — excluded |
| 6 | Surfaces share one nav philosophy | FAIL (5 Android tabs ≠ web Today/Sessions/Coach/Inbox/Profile) |
| 7 | Landing social-proof numbers consistent | FAIL (12,418 vs 318 coaches) |
| 8 | Health figures labeled LOCAL_DEMO where shown | PASS (landing, coach map, wear file) |

### FUNCTIONAL COHESION — 1.5 / 5 = **30 / 100**

| # | Item | Result |
|---|---|---|
| 1 | Same activity object on phone and watch | BLOCKED live; unit lease only — excluded |
| 2 | Same activity object on web | FAIL |
| 3 | Athlete start exists on Android (code + compile) | PARTIAL (compiled, not executed) |
| 4 | Coach command center loads | PASS (Tomás Ribeiro) |
| 5 | Social post propagates all surfaces | FAIL |
| 6 | Squad join/leave | FAIL (no product) |

### DATA COHESION — 2 / 7 = **29 / 100**

| # | Item | Result |
|---|---|---|
| 1 | One user id Android↔Wear | PASS after `LocalDemoIdentity` (`ath-1`) — **code**, not live pair |
| 2 | One user id native↔web | FAIL (`ath-1` vs `a-ines`) |
| 3 | One display name | FAIL (Costa / Inês M. / Correia) |
| 4 | One XP store | FAIL |
| 5 | One session id after workout | FAIL (not executed end-to-end) |
| 6 | Idempotent XP in AscendEngine | PASS (store.append duplicate) |
| 7 | Idempotent XP across platforms | FAIL |

### NAVIGATION COHESION — 2 / 4 = **50 / 100**

| # | Item | Result |
|---|---|---|
| 1 | Android athlete 5 tabs present in code | PASS |
| 2 | Web uses the same 5 concepts | FAIL |
| 3 | Watch is companion pager, not a 5-tab phone clone | PASS (code inspection; live BLOCKED separately) |
| 4 | Deep link / role switch on web profile | FAIL (coach session stuck on `/profile?demo=1`) |

### MOTION COHESION — **n/a this run** (0 items measured). Dimension score **excluded**. Treat as BLOCKED, not 0 and not 100.

### BRAND COHESION — 3 / 4 = **75 / 100**

| # | Item | Result |
|---|---|---|
| 1 | Wordmark recognizable Elite OS | PASS |
| 2 | Volt used as accent not rainbow | PASS |
| 3 | Logo not sprayed on every card | PASS (strategic on chrome) |
| 4 | Honest capability claims on landing | FAIL (conflicting coach counts; ecosystem overclaim vs matrix) |

### SOCIAL COHESION — 0.5 / 4 = **13 / 100**

| # | Item | Result |
|---|---|---|
| 1 | One social graph | FAIL |
| 2 | Android community module exists | PARTIAL |
| 3 | Web in-app social | FAIL |
| 4 | Reactions/comments cross-surface | FAIL |

### GAMIFICATION COHESION — 1.5 / 5 = **30 / 100**

| # | Item | Result |
|---|---|---|
| 1 | Native AscendEngine exists in tree | PARTIAL (`:ascend:test` not re-run this session) |
| 2 | Web uses same engine | FAIL |
| 3 | Wear uses same user as phone for Ascend | PASS in code (`ath-1`) |
| 4 | Squad XP | FAIL |
| 5 | Feed story from workout | FAIL |

### WATCH COHESION — 2 / 3 = **67 / 100**

| # | Item | Result |
|---|---|---|
| 1 | Companion architecture (not phone clone) | PASS (code) |
| 2 | Same identity as phone | PASS (code after fix) |
| 3 | Live start/pause/finish with phone | BLOCKED — excluded |
| 4 | Real HR | FAIL (UNAVAILABLE by design/stub) |

### ATHLETE/COACH COHESION — 2 / 5 = **40 / 100**

| # | Item | Result |
|---|---|---|
| 1 | Distinct athlete vs coach shells | PASS |
| 2 | Coach not shown as athlete chrome | PASS on loaded dashboards |
| 3 | Same athlete in coach roster | FAIL (Correia vs Costa vs M.) |
| 4 | Privacy four-level model | FAIL (missing) |
| 5 | Coach sees live activity from athlete workout | FAIL (not executed; seed only) |

### OVERALL

Dimensions with a score: 9 (motion excluded).

```
(64+30+29+50+75+13+30+67+40) / 9 = 398 / 9 = 44.222…
```

**OVERALL COHESION SCORE: 44 / 100**

---

## Defects

### P0 (engineering still open)

1. **Identity fork** — `ath-1` Inês Costa vs `a-ines` Inês M. vs roster Inês Correia. Prompt rule: same user becomes different identity = P0.
2. **XP fork** — AscendEngine vs web Helium 120 XP. Prompt rule: XP differs across platforms = P0.

These need a real identity + progression service. An alias in code would be a fake pass.

### P0 fixed this session

3. Phone could START while watch-owned (in-process). **Fixed + unit tested.** Live pair still BLOCKED.

### P1

4. Navigation philosophy split (Android 5 tabs vs web Today/Sessions/Coach/Inbox/Profile).
5. `/insights` was unprotected — **fixed + unit tested.**
6. Accent picker unwired — **fixed in compile; live UI BLOCKED.**
7. Wear userId `wear-local` — **fixed in code; live BLOCKED.**
8. Auth-gate SIGNING IN flash / coach session sticky on `/profile?demo=1`.
9. Landing coach-count contradiction (12,418 vs 318).
10. Squad / Social / Ascend / Journey / Memory / Stories / Reels missing as one product.
11. Four-level privacy model not implemented (telemetry coach-share exists instead).

### P2

12. Dual nav chrome on web (sidebar + app tabs + mobile dock).
13. Community post `idempotencyKey = UUID.randomUUID()` on create (replay-unsafe).
14. Wear default `sessionId = "wear-local"` still looks like a user id.
15. Expo Path A frozen vs Compose phone.

### P3

16. Wear compile warning Elvis always non-null.
17. Deprecated WindowWidthSizeClass in AthleteScaffold.

---

## Counts

| Severity | Open | Fixed this session |
|---|---|---|
| P0 | **2** | 1 (session lease on phone) |
| P1 | **8** | 3 (insights, accent, wear id) |
| P2 | **4** | 0 |
| P3 | **2** | 0 |

---

## FITCONNECT MASTER COHESION QA

ENGINEERING: **FAIL**  
ANDROID: **FAIL**  
WEB: **FAIL**  
WATCH: **BLOCKED**  
ATHLETE: **FAIL**  
COACH: **FAIL** (shell PASS, cohesion FAIL)  
SOCIAL: **FAIL**  
SQUAD: **FAIL**  
ASCEND: **FAIL**  
DATA COHESION: **FAIL**  
REALTIME: **PENDING_HUMAN**  
VISUAL COHESION: **FAIL** (partial token match is not certification)  
BRAND: **FAIL** (conflicts on landing stats)  
MOTION: **BLOCKED**  
NAVIGATION: **FAIL**  
ACCESSIBILITY: **BLOCKED**  
PERFORMANCE: **BLOCKED**  
E2E: **2 / 6** journeys had a web shell load (A athlete dashboard, B coach dashboard). C–F not a single product. See `MASTER_CROSS_PLATFORM_E2E.md`.

P0: **2** open  
P1: **8** open  
P2: **4**  
P3: **2**

OVERALL COHESION SCORE: **44 / 100**

FINAL STATE: **NOT COHESIVE**

---

## Golden question

**Does Android + Web + Watch + Athlete + Coach + Social + Squad + ASCEND feel like ONE FitConnect?**

**No.** Evidence: three Inês identities, two XP systems, no squad product, no shared social graph, watch/phone pair not runnable this session, web nav is a different IA. They share an Elite OS *look* on the surfaces we opened. That is a design-system rhyme, not one ecosystem.
