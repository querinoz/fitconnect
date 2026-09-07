# FITCONNECT MOBILE FULL QA REPORT

**Date:** 2026-09-05
**Mode:** Etapa A (Diagnóstico) complete · Etapa B (Correção) **blocked**
**Primary device:** Redmi Note 9S · Wireless ADB `adb-44dc5ec6-ipogZP._adb-tls-connect._tcp`
**Emulator:** `emulator-5554` present — **not** used as primary QA target

---

## EXECUTIVE SUMMARY

Full Mobile QA **cannot proceed past installation** on the physical Redmi.

| Fact | Evidence |
|------|----------|
| Wireless ADB | PASS — device online |
| Preflight (model/API/size/density) | PASS — matches expected Redmi Note 9S |
| FitConnect package on device | **FAIL — none installed** |
| `adb install` canonical APK | **FAIL** — `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user` (MIUI) |
| Stale `.debug` package | Removed earlier (was Aug 15 stale) |
| Expected id in prompt (`com.fitconnect.android.debug`) | **Incorrect for current workspace** when `google-services.json` exists |
| Canonical debug APK id | **`com.fitconnect.android`** |
| Metro / Expo driving UI | N/A — native Compose; Expo not installed |
| Feature QA (auth, athlete, map, …) | **NOT RUN** — no app to launch |
| Automated host checks | assembleDebug PASS · MapWave unit PASS · web 478/478 — **not** a device PASS |

**FINAL VERDICT: `BLOCKED`**

Do **not** treat host unit/web tests as Full Mobile QA PASS.

---

## DEVICE

| Field | Value |
|-------|-------|
| Model | Redmi Note 9S (`curtana` / `curtana_global`) |
| Android | 11 |
| API | 30 |
| Resolution | 1080x2400 |
| Density | 440 |
| Battery | ~37% |
| Storage `/data` | ~34G avail |
| Timezone | Europe/Lisbon |
| Locale props | pt-PT / en-GB |
| ADB | `adb-44dc5ec6-ipogZP._adb-tls-connect._tcp` **device** |

Screenshots: `docs/qa/mobile-full-qa/00-preflight-home.png`, `01-downloads-attempt.png`, `02-install-page-or-browser.png`

---

## BUILD

| Field | Value |
|-------|--------|
| Local APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| APK time | 2026-09-04 12:23:28 |
| Size | ~80.3 MB |
| aapt package | **`com.fitconnect.android`** |
| versionName / Code | `0.1.0-rc.1` / `13` |
| Label | FitConnect DEBUG |
| Debuggable | yes |
| Launchable | `com.fitconnect.android.MainActivity` |
| Git HEAD | `0a9155f` (branch ahead 14; worktree dirty) |
| assembleDebug | PASS (UP-TO-DATE) |

Also pushed to phone:

- `/sdcard/Download/FitConnect-canonical-debug.apk`
- `/data/local/tmp/fitconnect-debug.apk`

LAN installer helper: `http://192.168.1.76:8765/` (`pnpm android:qr` / `run-local-distribution.ps1 -SkipBuild`) — Chrome was opened on device; QR server may need restart if dropped.

---

## APP IDENTITY

| Field | Status |
|-------|--------|
| Package on Redmi | **NONE** (after stale uninstall + failed reinstall) |
| Historical wrong vintage | `com.fitconnect.android.debug` lastUpdate **2026-08-15** (removed) |
| Canonical product applicationId | `com.fitconnect.android` |
| Debug suffix `.debug` | Only when **no** `google-services.json` |
| Entry point | `MainActivity` → `FitConnectNavHost` (Compose) |
| JS bundle / Metro | **Not applicable** to canonical native app |
| Expo | `com.fitconnect.expo` frozen — **not** on device |

**Correction to the QA prompt assumption:**
Do **not** force-stop / target `com.fitconnect.android.debug` for current builds with FCM json present. Target:

```text
com.fitconnect.android / com.fitconnect.android.MainActivity
```

---

## TEST MATRIX

| Feature | Emulator | Redmi Physical | Result |
|---------|----------|----------------|--------|
| ADB / preflight | — | PASS | PASS |
| Installation | — | FAIL (MIUI restricted) | **BLOCKED** |
| Launch | — | NOT RUN | BLOCKED |
| Auth | — | NOT RUN | BLOCKED |
| Onboarding | — | NOT RUN | BLOCKED |
| Athlete | — | NOT RUN | BLOCKED |
| Coach | — | NOT RUN | BLOCKED |
| Sports | — | NOT RUN | BLOCKED |
| Map | — | NOT RUN | BLOCKED |
| Telemetry | — | NOT RUN | BLOCKED |
| Sessions | — | NOT RUN | BLOCKED |
| Realtime | — | NOT RUN | BLOCKED |
| Notifications / FCM | — | NOT RUN | BLOCKED |
| Offline | — | NOT RUN | BLOCKED |
| Background | — | NOT RUN | BLOCKED |
| Permissions | — | NOT RUN | BLOCKED |
| Performance | — | NOT RUN | BLOCKED |
| Accessibility | — | NOT RUN | BLOCKED |
| Security smoke | — | NOT RUN | BLOCKED |
| Crash-free happy path | — | NOT RUN | BLOCKED |

Emulator columns intentionally blank for primary gate (physical-first rule).

---

## FEATURES TESTED (physical)

**None** after installation failure. Prior identity audit only.

Known from prior audit / code (not device-proven this session):

- Debug `API_BASE_URL` = `http://10.0.2.2:3001` → **emulator loopback**; physical API will fail unless LAN IP used (P1 env once install works).
- `ALLOW_LOCAL_AUTH=true` / LOCAL_DEMO personas exist on debug — report, do not treat as production auth.
- Realtime BroadcastChannel default / Wear ID issues remain architectural debt (see next-phase audit pack).

---

## BUGS FOUND

| ID | Severity | Feature | Device | Reproduction | Expected | Actual | Root Cause | Evidence | Fix | Verification | Status |
|----|----------|---------|--------|--------------|----------|--------|------------|----------|-----|--------------|--------|
| MQ-001 | **P0** | Installation | Redmi | `adb -s $PHONE install -r app-debug.apk` | Install succeeds | `INSTALL_FAILED_USER_RESTRICTED` | MIUI “Install via USB” / user cancel | adb output | HUMAN: enable Install via USB + approve; or sideload Download APK | Re-run install + `pm list packages` | **OPEN** |
| MQ-002 | **P0** | App presence | Redmi | `pm list packages \| fitconnect` | Canonical package present | Empty | Follows MQ-001; stale package already removed | adb | Install canonical `com.fitconnect.android` | Package + launch proof | **OPEN** |
| MQ-003 | **P1** | Identity / docs | — | Prompt assumes `.debug` | Match current APK | Current APK is `com.fitconnect.android` | `applicationIdSuffix` gated on missing google-services | aapt + build.gradle.kts | Update QA scripts to use canonical id | Documented | **DOCUMENTED** |
| MQ-004 | **P1** | API env | Physical (pending) | Debug build on phone | Reach host API | `10.0.2.2` unreachable from phone | Emulator-only BuildConfig | build.gradle.kts | After install: use LAN IP / cleartext config for debug physical | Pending install | **DEFERRED** |
| MQ-005 | **P2** | Version signal | — | Compare device vs workspace | Distinct versionCode when code changes | Both claim 13 / 0.1.0-rc.1 | versionCode not bumped | dumpsys historical + aapt | Bump versionCode on meaningful builds | Pending | **OPEN** |

No P3/P4 UI defects filed — **cannot** classify UI until correct APK launches.

---

## BUGS FIXED

| Item | Result |
|------|--------|
| Stale `com.fitconnect.android.debug` on phone | **Removed** (controlled; was wrong vintage) |
| Product UI / navigation / map / auth code | **None** — Etapa B not started (blocked on install) |

---

## REMAINING BLOCKERS

1. **MIUI USB install restriction** (MQ-001) — human action required.
2. **No FitConnect package on Redmi** (MQ-002).
3. Until launch works: all acceptance gates FAIL / BLOCKED.

### Human unblock (choose one)

**A — Developer options (preferred for adb)**

1. Settings → Additional settings → Developer options
2. Enable **Install via USB** (may require Mi Account)
3. Approve any on-device prompt
4. Run:

```powershell
$PHONE="adb-44dc5ec6-ipogZP._adb-tls-connect._tcp"
adb -s $PHONE install -r d:\fitconnect\android\app\build\outputs\apk\debug\app-debug.apk
adb -s $PHONE shell am start -n com.fitconnect.android/com.fitconnect.android.MainActivity
adb -s $PHONE shell dumpsys package com.fitconnect.android | Select-String "versionCode|versionName|lastUpdateTime|codePath"
```

**B — Sideload**

Open Files → Download → `FitConnect-canonical-debug.apk` → Install.

**C — LAN page**

Same Wi‑Fi as PC → Chrome → `http://192.168.1.76:8765/` → download/install (restart `pnpm android:qr` if page fails).

---

## PERFORMANCE / CRASHES / NETWORK / AUTH / REALTIME / FCM / MAP / TELEMETRY / ATHLETE / COACH / ACCESSIBILITY / SECURITY / REGRESSION

All: **NOT RUN on physical device** this session.

Host-only (insufficient for PASS):

- `:app:assembleDebug` PASS
- `:design-ui` MapWave unit PASS
- `:athlete:testDebugUnitTest` BUILD SUCCESSFUL
- `@fitconnect/web` **478/478** PASS

---

## ACCEPTANCE GATE (Phase 38)

| Gate | Status |
|------|--------|
| BUILD | PASS (host) |
| INSTALLATION | **FAIL** |
| LAUNCH … CRASH FREE / REGRESSION | **BLOCKED** |

→ Overall **BLOCKED** (installation is a blocker rule item).

---

## TOTALS

```text
TOTAL TESTS (physical feature matrix rows exercised): 1 (preflight) + identity attempts
PASSED:   preflight / ADB / aapt identity of local APK / host assemble+web
FAILED:   installation
BLOCKED:  all product feature suites
WARNINGS: versionCode stagnation; prompt assumed .debug; API 10.0.2.2 for physical

P0: 2 (MQ-001, MQ-002)
P1: 2 (MQ-003, MQ-004)
P2: 1 (MQ-005)
P3: 0
P4: 0

FINAL VERDICT: BLOCKED
```

---

## ETAPA A vs ETAPA B

| Stage | Status |
|-------|--------|
| **A — Diagnóstico** | **DONE** — correct conclusion: no app / install restricted; canonical id is `com.fitconnect.android`; do not fix UI yet |
| **B — Correção** | **NOT STARTED** — waiting on human install unblock; then resume launch → smoke → P0/P1 fixes → regression |

---

## FINAL OBJECTIVE (honest)

The desired outcome (“validated on physical Android, critical features exercised, blockers fixed, Full Mobile QA without known blockers”) is **not met**.

Next authorized step: **HUMAN installs canonical APK**, then re-run this prompt from Phase 2 (Clean Launch) with package `com.fitconnect.android`.

---

## EN / PT-BR

**EN:** Full Mobile QA is **BLOCKED** at MIUI install. The Redmi has **no** FitConnect package. Canonical APK is ready as `com.fitconnect.android`. Enable Install via USB or sideload, then continue Etapa B.

**PT-BR:** Full Mobile QA está **BLOCKED** na instalação MIUI. O Redmi **não tem** pacote FitConnect. O APK canônico está pronto como `com.fitconnect.android`. Ative “Instalar via USB” ou faça sideload; depois continue a Etapa B.
