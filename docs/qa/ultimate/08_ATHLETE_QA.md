# 08 — Athlete OS QA (Ultimate run)

**Date:** 2026-08-28 · **Device:** `emulator-5554` (`fitconnect_phone`) · **Package:** `com.fitconnect.android.debug`  
**Persona:** Inês (athlete) · **Auth:** LOCAL_DEMO  
**Evidence:** `qa/evidence/ultimate/android/`

## Boot & install

| Test | Expected | Actual | Status |
|---|---|---|---|
| Emulator restart | `fitconnect_phone` online | emulator-5554 device | **PASS** |
| APK install | Success | `gradlew :app:installDebug` → Installed on 1 device | **PASS** |
| Cold start | Welcome visible | `02_welcome.png` | **PASS** |

## Auth & onboarding (6 steps)

| Step | Action | Status | Evidence |
|---|---|---|---|
| Welcome | Continue (231,1271) | **PASS** | `03_auth.png` |
| Persona | Inês · Athlete (540,1820) | **PASS** | `04_persona.png` |
| 1/6 Welcome | Continue (199,740) | **PASS** | `journey_02_after_ines.png` |
| 2/6 Sport | Cycling + Continue | **PASS** | `run2_step2.png` |
| 3/6 Goals | Race prep + Continue | **PASS** | — |
| 4/6 Wearables | Skip for now + Continue | **PASS** | `final_step4_wear` |
| 5/6 Plan | Continue | **PASS** | `final_step5_plan` |
| 6/6 Complete | Enter Athlete OS (479,980) | **PASS** | `final_home` |

## Athlete home

| Test | Expected | Actual | Status |
|---|---|---|---|
| Today screen | PRIME RECOVERY + greeting | "Good evening, Inês", PRIME RECOVERY 59, HRV 64ms | **PASS** |
| LOCAL_DEMO label | Visible | Yes | **PASS** |
| Health Connect banner | Honest state | "needs an update" CTA | **PASS** |

## Activity / GPS / telemetry

| Test | Expected | Actual | Status |
|---|---|---|---|
| Activity screen | Honest idle map | ROUTE · NO TRACE, "Routes are never invented" | **PASS** |
| Emulator geo inject | `adb emu geo fix` | Injected Lisbon route (15 points) | **PASS** |
| Start workout | Recording ACTIVE | session `fc-session-1-1787875763370` | **PASS** |
| GPS classification | Labeled DEMO/simulated | GPS chip **DEMO**, "GPS unavailable" + "GPS.EMULATOR" copy | **DOCUMENTED_LIMITATION** |
| Live fused GPS | Not claimed in LOCAL_DEMO | UI states FusedLocation not claimed | **DOCUMENTED_LIMITATION** |
| Distance / pace | Updates while recording | 0.07–0.14 km, 5:30/km | **PASS** (SIMULATED) |
| HR | LOCAL_DEMO | HR 148, "not a medical reading" | **PASS** (SIMULATED) |
| Pause / Resume | Controls work | Pause/Resume tapped (145,1675) | **PASS** |
| Finish | End session | Finish tapped (524,1676) | **PARTIAL** — summary screen not fully captured before nav |

## Navigation

Bottom bar observed: **Today · Analysis · Achievements · Profile** (4 tabs + FAB).

## Automation

Script added: `scripts/qa-athlete-journey.ps1` (needs coordinate hardening for Start — requires Run sport select + scroll + tap `[42,1328][227,1475]`).

## vs native-run-2

Confirms prior findings: activity telemetry is **SIMULATED** in LOCAL_DEMO; emulator geo inject does **not** switch to live fused GPS feed.
