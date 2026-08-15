# ANDROID_FULL_QA_REPORT

**Date:** 2026-08-15  
**Scope:** FitConnect Android (Kotlin / Compose) product completion pass  
**STITCH_ACCESS:** `BLOCKED` (HTTP 500 on https://stitch.withgoogle.com/projects/14054299058988485854)  
**AI Studio:** not used as a visual source (sign-in wall in prior session; not re-authenticated)

No Stitch screenshots were fabricated. Visual source of truth for this pass: existing Elite Surface tokens (`packages/design-tokens`), generated Kotlin tokens, landing identity (`--eos-floor` `#070B14`, Voltline `#C8FF00`, Connect `#00DDB4`), and in-repo Compose screens.

---

## 1. What was found (audit)

| Area | Pre-pass state | Notes |
|------|----------------|-------|
| Modules | 12 Gradle modules (`app`, `athlete`, `coach`, `wear`, `core-capture`, …) | Native Android is the production mobile track |
| Activity monitor | Stub / placeholder capture | No Start/Pause/Resume/End UI |
| Athlete nav | Home · Discover · Sessions · Programs · Community | Profile nested under Home “You” |
| Locale | `LocaleManager` existed (EN/PT/ES) | No Settings UI, no `values-pt`, not applied to `LocaleManager` / `LocaleList` |
| Theme | `ThemeMode` SYSTEM/DARK/LIGHT existed | Appearance picker + light roles added in prior visual pass |
| Wear OS | Empty F0 `WearMainActivity` | No operational controls |
| Emulator | AVD `fitconnect_phone` | Hypervisor driver missing (`accel: 6`) — unchanged |
| Production IdP / FCM / signing | Unconfigured | Must stay `PENDING_HUMAN` |

Canonical floor remains **`#070B14`** (`--eos-floor`). The brief’s `#090402` was **not** applied as a new hue.

---

## 2. What was changed (this product pass)

### Live activity (`LOCAL_DEMO`, not hardware GPS/BLE)

- `LiveActivityEngine` — IDLE / RUNNING / PAUSED / ENDED; simulated distance/HR/zones; `sourceLabel = LOCAL_DEMO`; `GpsFeedStatus.SIMULATED`
- Athlete `ActivityScreen` — Start / Pause / Resume / End / Discard + telemetry cards
- Bottom tab **Activity** (`athlete_tab_activity`)
- Unit tests: `LiveActivityEngineTest`

### Navigation / profile / settings

- Athlete tabs: **Home · Discover · Activity · Community · Profile**
- Sessions + Programs remain nested (Home still has Sessions / You / Start monitoring)
- `SettingsScreen` + `CoachSettingsScreen` — appearance + language
- `EliteLanguagePicker`, `LocaleApplier` (API 33 `applicationLocales`, else `updateConfiguration`)
- `AppLocale`: EN / PT / ES / FR / DE
- `values-pt/strings.xml` + `locales_config.xml`

### Wear OS

- Operational LOCAL_DEMO shell: START / PAUSE / RESUME / END using the same engine
- Phone ↔ watch DataLayer **not bound** (`NoWearCompanion` = `NOT_PAIRED`)
- `:wear:assembleDebug` PASS

### Maestro (authored, not executed)

- Updated `03_athlete_navigation.yaml`, `09_profile_settings.yaml`, `10_full_athlete_journey.yaml`
- Added `19_activity.yaml`, `20_language.yaml`

---

## 3. Files (primary)

**New:** `LiveActivityEngine.kt` + test, `ActivityScreen.kt`, `SettingsScreen.kt`, `CoachSettingsScreen.kt`, `EliteLanguage.kt`, `LocaleApplier.kt`, `LocaleManagerTest.kt`, `values-pt/strings.xml`, `locales_config.xml`, Maestro `19`/`20`

**Updated:** `AthleteNav.kt`, `AthleteScaffold.kt`, `AthleteContainer.kt`, `WearMainActivity.kt`, `WearPorts.kt`, `LocaleManager.kt`, `AppTheme.kt`, `AndroidManifest.xml`, coach nav/scaffold/profile, Home/Discover/Community/Training as needed

---

## 4. Commands run (this session)

| Command | Result |
|---------|--------|
| `.\gradlew.bat :core-capture:testDebugUnitTest :foundation:testDebugUnitTest :athlete:compileDebugKotlin :coach:compileDebugKotlin :wear:assembleDebug :telemetry:compileDebugKotlin` | BUILD SUCCESSFUL |
| `.\gradlew.bat :athlete:testDebugUnitTest :coach:testDebugUnitTest :design-ui:testDebugUnitTest :app:assembleDebug` | BUILD SUCCESSFUL |
| `.\gradlew.bat test :app:lintDebug` | BUILD SUCCESSFUL — **152/152** unit tests, **0 failures**, lint **0 errors / 49 warnings** |
| `$SDK\emulator\emulator.exe -accel-check` | **accel: 6** — hypervisor driver not installed |
| `adb devices` | empty (no emulator/device) |
| `emulator` on PATH | not found (used SDK binary) |
| Maestro CLI | not on PATH; no device → **not executed** |
| Stitch fetch | HTTP **500** |

Detekt: **not configured** in this Gradle tree (not run).

`clean` was **not** re-run after assemble (would discard the hashed APK). `assembleDebug` + `test` + `lintDebug` were run on the current tree.

---

## 5. Artifacts

| Artifact | Path | SHA-256 | Size |
|----------|------|---------|------|
| Phone debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | `A269251825A99D4EE6CE4FDA675C4A741D7408DB100BD22CB56681D27580F9E8` | 17 589 822 B |
| Wear debug APK | `android/wear/build/outputs/apk/debug/wear-debug.apk` | `76E51897A69D5A5E26A995BA5C7AA6006AF0BA03EDB44CF4E09F601E8142EFC5` | 27 947 399 B |
| QR copy | `.fitconnect-local-distribution/app.apk` | same as phone APK | same |

Package: `com.fitconnect.android.debug`  
Launch: `com.fitconnect.android.MainActivity`

---

## 6. Crashes / ANRs

**Not measured on a device.** `adb logcat` was not captured because no device reached `sys.boot_completed=1`.

Crashes found this session: **0** (no runtime).  
Crashes fixed this session: **0**.

---

## 7. LOCAL_DEMO vs PRODUCTION

| Surface | Mode shown to user |
|---------|--------------------|
| Auth personas (Inês / Marina / Tomás) | LOCAL_DEMO |
| Activity GPS / HR | LOCAL_DEMO simulated — copy states sensors not bound |
| Community / booking / sessions live preview | LOCAL_DEMO engines |
| Wear home | LOCAL_DEMO, unpaired |
| Splash (debug) | “LOCAL_DEMO” label |
| Production Supabase / FCM / LiveKit | **not claimed working** |

---

## 8. Risks

1. **No device evidence** — UI regressions on a phone cannot be certified from this machine.
2. Athlete Compose copy is still mostly English; only `app` `strings.xml` has PT. Changing locale updates system strings + picker, not every cockpit label.
3. Wear and phone engines are **independent** — starting on the watch does not start the phone activity.
4. Lint IconLauncherShape / unused resources remain warnings (pre-existing + launcher densities).
5. Locale apply on API 33 uses `Context.getSystemService(LocaleManager)` from Compose `LocalContext` — if that is not the Activity context, per-app locale may no-op until next process start. Unit-tested persistence only.

---

## 9. Recommendations (human)

1. Enable VT-x in firmware, install AEHD, boot `fitconnect_phone`, run Maestro `maestro/android/*.yaml`.
2. Install the hashed APK via `pnpm android:qr` on a physical phone and walk Athlete + Coach.
3. Provide production Supabase / FCM / signing when going beyond LOCAL_DEMO.
4. Pair a Wear OS device and implement DataLayer (`WearableCompanionPort`) — currently `NOT_PAIRED`.
5. Extract remaining athlete/coach UI strings into resources for full PT/ES/FR/DE.

---

## 10. Exit

`ENGINEERING_COMPLETE = FAIL` — build and unit tests passed; **emulator, Maestro, logcat, and visual QA on device did not run.**

See `ANDROID_FINAL_EXIT_GATE.md`.
