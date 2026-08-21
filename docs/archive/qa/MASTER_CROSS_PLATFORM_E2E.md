# FitConnect — Master cross-platform E2E

**Date:** 2026-08-19  
**Rule:** A journey PASSes only if continuity was observed after each major step.

## Journey A — Athlete

OPEN → AUTH → ONBOARDING → HOME → RECOVERY → START ACTIVITY → GPS → TELEMETRY → FINISH → SUMMARY → XP → BADGE → PROFILE → POST → REACTION → SQUAD → MISSION → WATCH → WEB

| Step | Result |
|---|---|
| OPEN web | PASS — landing Elite OS |
| AUTH web | PARTIAL — SIGNING IN flash then demo Inês M. |
| ONBOARDING | NOT EXECUTED (marketing `/onboarding/athlete` not walked) |
| HOME | PASS as dashboard seed (not Android Home) |
| RECOVERY / START ACTIVITY / GPS / FINISH | **BLOCKED** (no Android) |
| XP / BADGE | Web shows Helium 120 XP — **not** AscendEngine |
| POST / REACTION / SQUAD | **FAIL** missing product |
| WATCH | **BLOCKED** |
| Same user on WEB after Android | **FAIL** different ids even in code |

**Journey A: FAIL** (2 web shells ≠ the specified chain).

## Journey B — Coach

OPEN → AUTH → ONBOARDING → COMMAND CENTER → SQUAD → LIVE ATHLETE → DETAIL → ACTION → SESSION → PROGRAM → COMMUNITY → PROFILE

| Step | Result |
|---|---|
| OPEN + AUTH | PARTIAL — SIGNING IN then Tomás Ribeiro |
| COMMAND CENTER | PASS (loaded) |
| SQUAD | FAIL — LiveSquadCard LOCAL_DEMO only; no squad id |
| LIVE ATHLETE | Seed HRV cards (Inês Correia, Pedro, Aoife) — not a live session |
| PROGRAM builder | Visible Publish UI on seed blocks — not verified publish I/O |
| COMMUNITY | `/community` is marketing, not coach community graph |
| PROFILE | `/profile?demo=1` stayed on Coach OS |

**Journey B: FAIL** (command center loaded; ecosystem chain did not).

## Journey C — Social

Open Feed → post → profile → react → comment → share → squad → challenge → return.

**FAIL.** No in-app `/social`. Android `:community` not executed on device. Navigation context not testable.

## Journey D — Squad

Create → invite → join → challenge → activity → XP → momentum → badge → feed → season.

**FAIL.** Squad is not a product. Momentum/season **MISSING**.

## Journey E — Ascend

Complete activity → XP → badge → streak → level → title → profile → publish → squad contribution.

Native engine can do a subset **in one process** (duplicate event id → 0 XP). Web 120 XP is another system. **FAIL** as cross-platform.

## Journey F — Watch

Start on watch → phone updates → finish → phone summary → Ascend → squad → web → coach.

**BLOCKED.** `adb` empty. Code path: Wear `claimLocalStart` + phone coordinator lease. Not a golden run.

## Score

**E2E: 0 / 6 PASS. 2 / 6 had a web entry shell. 1 / 6 BLOCKED (Watch). 3 / 6 FAIL missing product.**

Counted as **2 / 6 partial entry**, **0 certified**.
