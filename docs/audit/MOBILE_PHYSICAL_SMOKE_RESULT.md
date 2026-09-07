# FITCONNECT — PHYSICAL ANDROID SMOKE TEST RESULT

**Date:** 2026-09-05
**Mode:** Diagnose only · **no UI / navigation / business-logic code changes**
**Device:** Redmi Note 9S · Wireless ADB (session later dropped)
**Package:** `com.fitconnect.android` · `0.1.0-rc.1` (13)
**Evidence:** `docs/qa/mobile-smoke/`

---

## SMOKE TEST RESULT

| Area | Result | Notes |
|------|--------|-------|
| STARTUP | **PASS WITH WARNINGS** | Cold `TotalTime` ≈ **3148–3164 ms**; Activity displayed; **no FATAL**. Transient **black/empty Compose** observed after splash. |
| AUTH | **PARTIAL** | Firebase Auth notifies real UID (`R4WMg5y…`); UI still stamps **LOCAL_DEMO**. Logout / unauth flows **not exercised** (input inject blocked). |
| NAVIGATION | **FAIL / BLOCKED** | Deep links often ignored while splash branding shown; several destinations render **blank black** (empty a11y tree). `input tap` **INJECT_EVENTS** denied on MIUI wireless ADB → cannot complete onboarding Continues. |
| ATHLETE | **BLOCKED** | Onboarding step 1 seen once; Today / Train / Profile not reached interactively. |
| COACH | **NOT RUN** | Role not observed. |
| SPORTS | **FAIL (blank)** | Deep link → black screen / empty hierarchy (`14-sports.xml` 2424 B, 0 texts). |
| MAP / ACTIVITY | **FAIL (blank)** | Same empty hierarchy pattern for activity/sports/community/discover/profile/catalog captures. |
| TELEMETRY | **BLOCKED** | Deep link stayed on splash branding in tour; no metric values verified. |
| REALTIME | **NOT PROVEN** | No cross-device / live update exercised. **LOCAL_DEMO** label present → treat as **DEMO / LOCAL**, not production realtime. |
| BACKGROUND | **PARTIAL** | Home intent + return worked; kill→reopen cold ~3142 ms back to splash branding. |
| NETWORK | **BLOCKED** | Attempting `svc wifi disable` **dropped wireless ADB** (`device not found`). Cannot safely offline-test over Wi‑Fi ADB. |
| PERFORMANCE | **PASS (baseline)** | Cold ~3.1 s; TOTAL PSS ≈ **167 MB** earlier; 1 Activity. Looper latency warnings (~2.3–2.5 s) during first resume. |
| CRASHES | **PASS** | No `FATAL EXCEPTION` / `AndroidRuntime FATAL` in filtered logcat for FitConnect process. |

---

## IDENTITY (reconfirmed)

| Field | Value |
|-------|-------|
| Package | `com.fitconnect.android` only (no `.debug`, no Expo) |
| versionCode / Name | 13 / 0.1.0-rc.1 |
| minSdk / targetSdk | 26 / 35 |
| codePath | `/data/app/~~9x6wTsMAmUC44pPZBkzvBA==/com.fitconnect.android-…` |
| MainActivity | `com.fitconnect.android/.MainActivity` |
| Debuggable | yes |
| Location permission | **denied** at dumpsys time |

---

## LOGCAT CLASSIFICATION

| Class | Examples |
|-------|----------|
| **EXPECTED / INFO** | FirebaseApp init, Crashlytics init, `FirebaseAuth: Notifying id token listeners`, `FitConnectApplication: shell ready … shell_ready:718ms`, ProfileInstaller |
| **EXPECTED WARNING** | `Looper PerfMonitor` latency on MainActivity resume; App Check debug secret prompt |
| **APP ERROR (non-fatal)** | `ActivityInjector: ClassCastException BinderProxy…ClientTransaction` (seen once on resume) |
| **MIUI / SYSTEM / IGNORE** | `PowerUtils getSurfaceTemprature FileNotFoundException`; GameBooster; `BtGatt DeadObjectException`; ANDR-PERF-LM Invalid |
| **NOT PRESENT** | ReactNativeJS, Hermes, Expo (native Compose) |

---

## VISUAL (initial)

**Splash / branding (PASS visual):** centered F logo, “FitConnect DEBUG”, Elite OS copy, **LOCAL_DEMO** chip — no obvious clipping on 1080×2400.

**Onboarding step 1 (PASS visual structure):** LOCAL_DEMO badge, SYS.INIT STEP 1/6, Welcome copy, lime Continue — large empty lower area (layout choice, not clipping).

**Blank black (FAIL):** post-splash settle and several deep-linked athlete surfaces — process alive, hierarchy empty Compose nodes only.

---

## BUG TABLE

| ID | Severity | Feature | Expected | Actual | Root Cause | Status |
|----|----------|---------|----------|--------|------------|--------|
| SM-001 | **P1** | Startup / Nav | Splash → Guest/Home/Onboarding without blank | Transient **black screen**; empty Compose hierarchy (`ui-02`, thumbs 03/14) | Empty `Box`/`Spacer` during auth/role/onboard load | **FIXED** (eng) — device re-smoke pending |
| SM-002 | **P1** | Deep links | `fitconnect://app/…` navigates to target | Many links leave **splash branding** or **black**; `MainActivity.onNewIntent` does not forward VIEW to NavHost | Intent delivery without nav handle when not in Athlete graph | **FIXED** (eng) — `DeepLinkInbox` · device pending |
| SM-003 | **P1** | Auth honesty | Clear REAL vs LOCAL_DEMO | Firebase UID session + prominent **LOCAL_DEMO** UI | Debug/local demo labeling alongside real Firebase Auth | **FIXED** as SM-004 (eng) — `identityBadgeLabel` |
| SM-004 | **P1** | Athlete surfaces | Sports/Activity/Profile render | Deep-link captures: **blank** (0 texts) | Likely auth gate / role / incomplete onboarding blocking OS; or nav not applied | Covered by SM-001+SM-002 fixes (eng) |
| SM-005 | **P2** | A11y / touch | Continue clickable in a11y | `clickable=false` on Continue nodes | Compose semantics / merged node | OPEN |
| SM-006 | **P2** | Perf | Smooth first resume | Looper latency **~2.3–2.5 s** on cold resume | Heavy main-thread work during Firebase/shell init | OPEN |
| SM-007 | **P0 (test harness)** | Interaction QA | `adb shell input tap` works | `SecurityException: INJECT_EVENTS` | MIUI wireless ADB restriction | OPEN — needs USB debug or human taps |
| SM-008 | **P0 (test harness)** | Network QA | Offline test over wireless ADB | Disabling Wi‑Fi **disconnects** phone from ADB | Wireless ADB depends on Wi‑Fi | OPEN — use USB for offline tests |
| SM-009 | **P3** | Copy | Encoding clean | Mojibake `·` / `—` in uiautomator dump (`Elite OS �`) | Dump encoding; may be fine on device | NOTE |

No product code fixed this phase (per rules).

---

## LIMITATIONS

1. Phone **went offline** mid-run after Wi‑Fi toggle attempt; later dumps incomplete.
2. Cannot automate taps on this MIUI wireless session.
3. Map / telemetry values / coach / realtime / FCM **not** validated end-to-end.
4. Emulator was **not** used as primary (per rules).

---

## FINAL GATE

```text
SMOKE TEST:
FAIL

P0: 0 product · 2 harness (SM-007 input inject, SM-008 wifi/adb) — treat as BLOCKERS for automated smoke completion
P1: 4 (SM-001 blank, SM-002 deeplink, SM-003 demo/auth mix, SM-004 blank athlete surfaces)
P2: 2 (SM-005 a11y clickable, SM-006 looper latency)
P3: 1 (SM-009 encoding note)

TOP ISSUES:
1. Blank black Compose screens (startup race + several deep links)
2. Deep links not reliably navigating from splash / MainActivity.onNewIntent gap
3. LOCAL_DEMO UI with live Firebase Auth session
4. MIUI blocks automated taps; Wi‑Fi off kills wireless ADB

CANONICAL APP:
com.fitconnect.android

DEVICE:
Redmi Note 9S

NEXT ACTION:
1. Reconnect wireless ADB (or USB) — do NOT disable Wi‑Fi on wireless ADB.
2. Human: tap through Athlete onboarding Continues once; capture Today / Train / Profile / Map.
3. Fix phase (authorized separately): blank-screen gate (SM-001/004) + deep-link onNewIntent (SM-002) — still no cosmetic redesign.
4. Keep LOCAL_DEMO labeling honest vs Firebase session (SM-003).
```

---

## EN / PT-BR

**EN:** Physical smoke = **FAIL**. App launches (~3.1s, no crash) on canonical package, but blank screens + unreliable deep links block athlete feature proof. Interaction and offline tests blocked by MIUI/wireless ADB. No code changes made.

**PT-BR:** Smoke físico = **FAIL**. App abre (~3,1s, sem crash) no package canónico, mas ecrãs pretos + deep links fracos impedem provar Athlete. Interação e offline bloqueados pelo MIUI/ADB wireless. Sem alterações de código.

---

## FIX PHASE — SM-001 / SM-002 / SM-004

**Date:** 2026-09-05
**Branch work:** product fixes only (no redesign · no harness SM-007/008)
**APK:** `android/app/build/outputs/apk/debug/app-debug.apk` (built 2026-09-05)
**Package:** `com.fitconnect.android` when `google-services.json` present (no `.debug` suffix)

### Gate status

| ID | Engineering | Device regression (Redmi) | Verdict |
|----|-------------|---------------------------|---------|
| SM-001 | **PASS** | **NOT RUN** (ADB offline) | Engineering PASS · phase gate **OPEN** |
| SM-002 | **PASS** | **NOT RUN** (ADB offline) | Engineering PASS · phase gate **OPEN** |
| SM-004 | **PASS** | **NOT RUN** (ADB offline) | Engineering PASS · phase gate **OPEN** |

```text
SM-001 = ENGINEERING PASS (device pending)
SM-002 = ENGINEERING PASS (device pending)
SM-004 = ENGINEERING PASS (device pending)
FINAL GATE = NOT CLOSED — reconnect Redmi Note 9S and re-smoke
```

### SM-001 — Black / empty Compose surfaces

| Field | Detail |
|-------|--------|
| **ID** | SM-001 |
| **ROOT CAUSE** | `LoggedHome` rendered empty `Box` / `Spacer` while `allowed == null`, redirect in flight, or onboarding/role hydration. Same empty `Spacer` on athlete/coach onboarding before hydrate. |
| **FILE(S)** | `FitConnectNavHost.kt`, `OnboardingScreen.kt`, `CoachOnboardingScreen.kt` |
| **COMPONENT(S)** | `BootLoadingSurface` + `EliteLoading`; onboarding loading boxes |
| **FIX** | Replace empty surfaces with labeled loading (`SYS.AUTH` / `SYS.REDIRECT` / `SYS.ROLE` / `SYS.ONBOARD`) and recoverable auth-error screen. Never leave a blank black Compose tree during normal boot. |
| **TEST** | `:app:compileDebugKotlin` PASS · `:app:assembleDebug` PASS |
| **RESULT** | Engineering **PASS** |
| **REGRESSION** | Device cold/warm launch **pending** (no ADB device) |

### SM-002 — Deep link / `onNewIntent`

| Field | Detail |
|-------|--------|
| **ID** | SM-002 |
| **ROOT CAUSE** | `MainActivity.onNewIntent` did not drive NavHost (and must not `setIntent(VIEW)` — ActivityScenario E2E contract). Cold VIEW intents during Splash were dropped; nested athlete links only worked if AthleteOsApp was already mounted. |
| **FILE(S)** | `foundation/.../DeepLinkInbox.kt`, `MainActivity.kt`, `FitConnectNavHost.kt`, `AthleteScaffold.kt` (`AthleteOsApp`) |
| **COMPONENT(S)** | `DeepLinkInbox` SharedFlow + peek/clear · `classifyDeepLink` · shell `applyDeepLink` · nested `handleDeepLink` |
| **FIX** | Intent → `DeepLinkInbox.offer` on create/newIntent → after splash boot, shell routes Guest/Auth/Home/Catalog; athlete nested URIs retained for `AthleteOsApp` collector. No second NavHost / no setIntent(VIEW). |
| **TEST** | `DeepLinkClassifyTest` **7/7** PASS (matrix: cold/warm/nested/invalid/https + identity badge) |
| **RESULT** | Engineering **PASS** |
| **REGRESSION** | Device cold/warm/running/background deeplink matrix **pending** |

### SM-004 — Firebase Auth vs LOCAL_DEMO

| Field | Detail |
|-------|--------|
| **ID** | SM-004 (maps to smoke table SM-003 auth honesty) |
| **ROOT CAUSE** | Splash / athlete chrome stamped `LOCAL_DEMO` from `BuildConfig.DEBUG` or unconditional `DemoPersona.MODE_LABEL`, not from `session.isLocalDemo`. Home also showed LOCAL_DEMO when any readiness field was demo data. |
| **FILE(S)** | `identityBadgeLabel()` in `DeepLinkInbox.kt`, Splash in `FitConnectNavHost.kt`, `AthleteScreen.kt`, `TodayEditorialHeader.kt`, `HomeScreen.kt`, onboarding screens |
| **COMPONENT(S)** | Identity badge precedence · session `isLocalDemo` |
| **FIX** | Rule **REAL AUTH > LOCAL DEMO**: `identityBadgeLabel(debug, isLocalDemo)` → `LOCAL_DEMO` only if session demo; else `DEBUG` on debuggable builds; else none. Firebase `persistIdentity` already writes `isLocalDemo = false`. |
| **TEST** | `identity_badge_real_auth_beats_debug` PASS |
| **RESULT** | Engineering **PASS** |
| **REGRESSION** | Device: Firebase UID + badge ≠ LOCAL_DEMO **pending** |

### Auth / identity map (after fix)

```text
AUTH SOURCE      → FirebaseAuth / CompositeAuthRepository (live first)
SESSION SOURCE   → SecureSessionStore (isLocalDemo flag)
PROFILE SOURCE   → IdentityRemote bootstrap
ROLE SOURCE      → SessionSnapshot.role + identity role selection
UI BADGE SOURCE  → identityBadgeLabel(isDebuggable, session.isLocalDemo)
```

### Automated verification

| Command | Result |
|---------|--------|
| `:foundation:testDebugUnitTest` DeepLinkClassifyTest | **7/7 PASS** |
| `:app:assembleDebug` | **PASS** → `app-debug.apk` |
| `:app:compileDebugKotlin` / `:athlete:compileDebugKotlin` | **PASS** |
| `:athlete:testDebugUnitTest` (with assemble batch) | **PASS** (exit 0) |
| `pnpm test` | **PASS** — web 468 passed / 10 skipped |
| `pnpm typecheck` | **FAIL** — pre-existing `@fitconnect/strava-integration` test typing (unrelated) |
| `pnpm test:coverage` | **FAIL** — pre-existing coverage thresholds (auth middleware / stripe webhook) |
| Redmi install / cold / warm / deeplink / logout | **NOT RUN** — `adb devices` empty |

### Device re-smoke checklist (required to close gate)

1. Reconnect Redmi (USB preferred; wireless ADB host currently unresolvable).
2. `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
3. Cold launch · warm launch · `fitconnect://app/home` · nested athlete URI · back.
4. Confirm badge: Firebase session → **DEBUG** or none — **not** LOCAL_DEMO.
5. Logout · relaunch → unauthenticated; no LOCAL_DEMO as side effect of real auth.
6. Clean install optional only after proving no residual SecureStore demo flag needed.

### Next (after device PASS)

Return to **FULL MOBILE QA** on Redmi (Athlete · Coach · Map · Telemetry · …) — still **no redesign**.
