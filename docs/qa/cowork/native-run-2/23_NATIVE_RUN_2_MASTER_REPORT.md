# 23 — NATIVE RUN #2 MASTER REPORT (executed)

**Date:** 2026-08-24 · **Executor:** Cursor agent (shell + emulators + browser MCP) · **Action mode:** TEST ONLY.

---

## EXECUTIVE SUMMARY

The native-testing gap from QA Run #1 **is closed for local emulators**. FitConnect Android **installs, launches, and is walkable**. Wear OS **installs, launches, and records a LOCAL_DEMO workout**. Phone ↔ Watch **does not sync** on this AVD pair (`MISSING_COMPANION_APP`). GPS is **honestly simulated**, not fused live. Web showcase remains **GO** with the same class of P2/P3 defects; language clipping is **re-confirmed on production**.

**Separated statuses**

| Dimension | Verdict |
|---|---|
| WEB_SHOWCASE | **GO** (demo) |
| ANDROID_LOCAL | **GO** (LOCAL_DEMO) |
| WATCH_LOCAL | **GO** (LOCAL_DEMO) |
| CROSS_PLATFORM_LOCAL | **NO-GO** |
| PRODUCTION | **NO-GO** |

**Improvement-phase gate:** **READY_FOR_IMPROVEMENT** — evidence quality is now sufficient even though bugs exist.

---

## WHAT WAS TESTED / ACTUALLY EXECUTED

Phone emulator 5554 + Wear 5556 + live Vercel. Installed `app-debug.apk` / `wear-debug.apk`. Athlete Inês journey (onboarding through activity finish). Coach Tomás after `pm clear`. Wear start/pause/resume/finish. Geo inject. Offline banner. Web landing, language listbox metrics, dashboard `?demo=1`, curl smoke.

**Not executed:** 10 km event, physical devices, TalkBack, production Google/Apple auth, second coach tab BroadcastChannel, full secrets audit.

---

## PER-AREA STATUS

| Area | Status |
|---|---|
| ANDROID | **PASS** (LOCAL_DEMO) |
| ATHLETE | **PASS** with P2 score mismatch / back-exit |
| COACH | **PASS** LOCAL_DEMO |
| ASCEND | **PASS** LOCAL_DEMO; watch not mirrored |
| SOCIAL | **PARTIAL** / Stories **NOT_IMPLEMENTED** |
| SQUAD | **PARTIAL** (challenge UI, not Squad OS) |
| GPS | **FAIL** real fused; **PASS** labeled simulation |
| MAP | **PASS** honest empty/demo |
| TELEMETRY | **PASS** SIMULATED |
| WATCH | **PASS** LOCAL |
| PHONE↔WATCH | **FAIL / BLOCKED** GMS |
| REALTIME | **FAIL / BLOCKED** |
| WEB REGRESSION | **PASS** with open issues |
| LANDING | **PASS** with lang clip + `/#` |
| VISUAL COHESION | **FAIL** IA |
| ACCESSIBILITY | **FAIL** (web 7 unnamed; Wear unlabeled START) |
| PERFORMANCE | **FAIL** cold start ~4.8s; jank |
| SECURITY | **PASS** fail-closed APIs; rate limit **FAIL** P2 |

---

## COUNTS

- **P0:** 0
- **P1:** 1 — native GPS not fused (runtime-confirmed)
- **P2:** 6 — lang clip; rate limit disabled; secrets-on-disk (carry); Android back-to-launcher; recovery score mismatch; web vs Android IA
- **P3:** 7 — unnamed dashboard buttons; pricing €12 copy; footer `/#`; sleep deeplink; Sign out buried; Wear unlabeled controls; `/auth` 404
- **BLOCKED:** 4 — TalkBack; production auth; true Data Layer pair; 10 km cross-platform event
- **NOT_IMPLEMENTED:** 2 — Stories/Reels; full Squad OS

(Web email/password P1 from earlier Cowork Run #2: **not re-typed**; `/auth` 404 is additional. Keep as **STILL OPEN** pending modal retest — not double-counted as extra P1.)

---

## NEW FINDINGS

- Android and Wear **actually run** on this machine.
- GPS labeled **simulated QA route**; geo fix unused.
- Data Layer **MISSING_COMPANION_APP**.
- Home recovery 59 vs Recovery Center 78.
- Back from Today → launcher.
- Sleep deeplink stub.
- PAIR WATCH → Bluetooth settings.
- `/auth` 404.
- Cold start ~5s phone / ~4s watch.

## RESOLVED vs Run #1

- Native/Wear **runtime blocked (hypervisor)** → **RESOLVED**.
- “Cannot install APK” from Cowork click-only → **RESOLVED** in this shell.

## STILL OPEN (web/product)

Lang clip, rate limit, placeholder links, pricing copy, icon a11y, demo backend, Social/Squads incomplete, GPS unwired.

---

## FINAL NATIVE QA STATUS

`WEB_SHOWCASE = GO` · `ANDROID_LOCAL = GO` · `WATCH_LOCAL = GO` · `CROSS_PLATFORM_LOCAL = NO-GO` · `PRODUCTION = NO-GO`

**READY_FOR_IMPROVEMENT**
