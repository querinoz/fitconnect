# FitConnect — Full Mobile QA 360° Result

**Date:** 2026-09-07
**Branch:** `feat/elite-os-v2`
**HEAD:** `0a9155f623dcf9ee091a4236a5b0bb64d2cf8364` (+ dirty worktree)
**Mode:** QA + bug-fix loop (no new features)

========================================
FITCONNECT — FULL MOBILE QA 360°
========================================

## BUILD

| Item | Value |
|------|--------|
| Branch | `feat/elite-os-v2` |
| HEAD | `0a9155f623dcf9ee091a4236a5b0bb64d2cf8364` |
| APK built | `app/build/outputs/apk/debug/app-debug.apk` |
| versionName | `0.1.0-rc.1` |
| versionCode | `13` |
| applicationId (this build) | `com.fitconnect.android` (FCM configured → no `.debug` suffix) |

## WEB

| Check | Result |
|-------|--------|
| tests | **488 PASS** / 10 skipped |
| typecheck | **PASS** |
| coverage | **PASS** (prior cycle + this baseline typecheck/test green) |

## ANDROID

| Check | Result |
|-------|--------|
| assembleDebug | **PASS** |
| DeepLinkClassifyTest + athlete nav unit | **PASS** |
| Instrumentation (full matrix) | **NOT fully re-run** this cycle (manual adb journeys used) |

## PHYSICAL DEVICE (Redmi Note 9S)

| Field | Value |
|-------|--------|
| model | Redmi Note 9S (`curtana`) |
| Android | 11 (API 30) |
| ABI | arm64-v8a |
| screen | 1080×2400 |
| network | WIFI CONNECTED |
| battery | ~82% discharging |
| adb | `adb-44dc5ec6-ipogZP (2)._adb-tls-connect._tcp` **device** (wireless) |
| MIUI | V125 |
| Latest APK install | **DEFERRED** — `INSTALL_FAILED_USER_RESTRICTED` (MIUI Install via USB policy) |
| Status | **PHYSICAL DEVICE BLOCKED — DEFERRED** |
| Classification | **HUMAN / DEVICE BLOCKER** — not a code defect |
| Physical GPS | **DEFERRED** (physical validation postponed) |

> Mandate update (2026-09-07): Do **not** spend further cycles on MIUI Install via USB, SIM, or Redmi install workarounds. Emulator is the primary validation device until feature-complete.

## EMULATOR

| Field | Value |
|-------|--------|
| AVD | `fitconnect_phone` (`emulator-5554`) |
| Role | **PRIMARY** development + QA device |
| Latest APK | **Installed SUCCESS** |
| Journeys | Athlete LOCAL_DEMO + Workout ACTIVE + Coach onboarding started |

---

## SM GATES

### SM-001
**status:** **PASS** (emulator + Redmi installed APK)

Evidence:
- Emulator cold: guest → no black screen; TotalTime ~4.4s
- Redmi cold: splash → Athlete OS Today (Inês / LOCAL_DEMO); TotalTime ~3.2–3.5s
- No FATAL EXCEPTION in filtered logcat for launches under test
- Boot surfaces show content (not empty Box/Spacer)

### SM-002
**status:** **PASS** (partial matrix; ActivityScenario not re-run)

Evidence:
- Emulator warm: `fitconnect://app/athlete/home` delivered to running instance → Today
- Emulator cold: `fitconnect://app/athlete/workout` → TRAIN / Start workout
- Redmi cold: `fitconnect://app/auth` → Auth / IDENTITY CORE (LaunchState COLD, ~3.6s)
- Uses DeepLinkInbox path (no `setIntent(VIEW)` shortcut observed in code)

Gaps: nested Activity detail / Settings deep links not exhaustively exercised.

### SM-004
**status:** **PASS** (LOCAL_DEMO + DEBUG paths) · **REAL AUTH = NOT_VERIFIED** this cycle

Evidence:
- Guest/Auth: badge **FitConnect DEBUG** / **FITCONNECT DEBUG** when not in demo session
- After LOCAL_DEMO Inês: chrome shows **LOCAL_DEMO** (not inherited solely from debug build)
- Unit: `identityBadgeLabel` tests PASS
- Real Firebase email session + badge after logout/relaunch: **not executed** on Redmi this cycle

---

## DOMAIN STATUS

| Domain | Status | Notes |
|--------|--------|-------|
| AUTH | PARTIAL | LOCAL_DEMO PASS; real Firebase physical NOT_VERIFIED |
| ATHLETE | PASS (LOCAL_DEMO emu) | Home, Analysis, Profile, onboarding complete |
| COACH | PARTIAL | Tomás LOCAL_DEMO → Coach onboarding STEP 1 observed |
| DISCOVER | PARTIAL | Analysis tab opened (Discover destination); marketplace booking not re-mutated on device |
| BOOKING | PASS (API prior) | Device UI booking mutation not re-proven this cycle |
| SOCIAL | PASS (API prior) | Device UI comment/react not re-proven this cycle |
| WORKOUT | PASS (emu) | Deep link → PREP → Start → **ACTIVE · SET 1** (bench press logging UI) |
| GPS | **IMPLEMENTED** (emu mock) / **PHYSICALLY DEFERRED** | Emulator simulated GPS enabled; physical outdoor postponed |
| MAP | PARTIAL | Map UI present; physical GPS not required to continue |
| HEALTH CONNECT | PARTIAL | Dialog “needs update” on emu+Redmi; no grant/revoke matrix |
| ACTIVITY | NOT_VERIFIED | History/detail not opened this cycle |
| ASCEND | PARTIAL | Profile shows XP/level/streak LOCAL_DEMO |
| OFFLINE | NOT_VERIFIED | Airplane matrix not run |
| SYNC | NOT_VERIFIED | Network recovery not run |
| REALTIME | ENGINEERING / PROD PENDING_HUMAN | Not dual-device proven |
| FCM | ENGINEERING only | Not production-claimed |
| ACCESSIBILITY | NOT_VERIFIED | TalkBack not run |
| SECURITY | PASS (API prior) | Device IDOR not re-run |
| PERFORMANCE | PARTIAL | Cold ~3–4.5s; no ANR in sampled logs |

========================================
DEFECTS
========================================

### P0
*(none agent-owned discovered)*

### P1
*(none agent-owned code defects discovered)*

### P1 / EXTERNAL (device-human) — DEFERRED
1. **MIUI Install via USB** — `INSTALL_FAILED_USER_RESTRICTED`. Marked **DEFERRED**. Not a code defect. Do not block mobile feature work.

### P2
1. Health Connect “needs an update” modal overlays Athlete Today on emu — environment gap.
2. Catalog deep link while HC dialog up may appear no-op (navigation masked).

### P3
1. MIUI theme_compatibility.xml ENOENT noise during `uiautomator dump` (platform, not app crash).

========================================
DEVICE STATUS (mandate)
========================================

| Device | Status | Notes |
|--------|--------|-------|
| Android Emulator | **PRIMARY / PASS** for install + smoke | Continue all feature work here |
| Redmi Physical | **DEFERRED** | MIUI install policy / INSTALL_FAILED_USER_RESTRICTED |
| Physical GPS | **DEFERRED** | Physical device validation postponed |

========================================
EXTERNAL BLOCKERS
========================================

| Kind | Item |
|------|------|
| DEVICE (DEFERRED) | Redmi MIUI Install via USB — not blocking development |
| DEVICE (DEFERRED) | Physical GPS verification postponed |
| INFRA | Realtime production dual-session |
| INFRA | FCM production credentials |
| CREDENTIAL | Real Firebase athlete/coach sign-in matrix incomplete |
| HARDWARE | Wear FUTURE PHASE |
| LEGAL/PROD | Production NO-GO |

========================================
FINAL VERDICT
========================================

**FULL MOBILE QA = PARTIAL** (by design until feature-complete + deferred physical)

**PHYSICAL DEVICE = DEFERRED** (not a code defect)

**MOBILE FEATURE COMPLETENESS = IN PROGRESS** — see `docs/qa/MOBILE_FEATURE_COMPLETENESS_REPORT.md` and `docs/qa/MOBILE_WAVE_2_IMPLEMENTATION_REPORT.md`

**PRODUCTION = NO-GO**

**DESIGN PHASE = FROZEN** until functional completeness

### Priority now (not Design, not Redmi)

1. Promote memory program/notifications stores to Postgres when persistence configured
2. Stripe Connect / FCM production credentials (HUMAN)
3. Offline airplane matrix + dual-session realtime proof on emulator
4. Only later: Full Mobile QA 360 exit + physical Redmi + Design audit

Then re-evaluate FULL MOBILE QA exit gate.
