# 01 — ENVIRONMENT (Native Run #2 — executed)

**Date:** 2026-08-24 · **Host:** Windows 10.0.26200 (`querino`) · **Action mode:** TEST ONLY.

This file supersedes the earlier Cowork “three walls / click-only” write-up in the same folder. That write-up remains historically true for the Cowork session. **This Cursor session had a typeable shell, ADB, and running emulators.**

## Runtime availability — re-verified 2026-08-24 (this session)

| Check | Result | Evidence |
|---|---|---|
| Java | **PASS** — 17.0.12 LTS | `java -version` |
| Node | **PASS** — v25.9.0 | `node -v` |
| pnpm | **PASS** — 9.15.9 | `pnpm -v` |
| Android SDK | **PASS** | `ANDROID_HOME=C:\Users\duhqu\AppData\Local\Android\Sdk` |
| ADB | **PASS** — 1.0.41 / 37.0.1 | WinGet Platform Tools |
| `emulator.exe` | **PASS** (not on PATH; used SDK path) | `%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe` |
| AVD `fitconnect_phone` | **PASS** — already booted | `emulator-5554` `sdk_gphone16k_x86_64` `sys.boot_completed=1` |
| AVD `fitconnect_wear` | **PASS** — started this run | `emulator-5556` `sdk_gwear_x86_64` |
| Gradle wrapper | **PASS** | `android\gradlew.bat` present |
| Prebuilt phone APK | **PASS** | `app-debug.apk` 31 391 478 B, SHA-256 `718F14E7…AD34C65`, `0.1.0-rc.1` / versionCode 13, `com.fitconnect.android.debug` |
| Prebuilt Wear APK | **PASS** | `wear-debug.apk` 44 292 075 B, SHA-256 `4601D099…134AE9`, `0.1.0` / versionCode 1, `com.fitconnect.android.wear` |
| Playwright | **PASS** — 1.60.0 | `npx playwright --version` (not the primary web driver this run) |
| Maestro | **NOT INSTALLED** | — |
| Firebase CLI | **NOT INSTALLED** | — |
| gcloud | **PRESENT** | not used |
| BIOS/SVM | **UNBLOCKED vs Run #1** | emulator boots x86_64 (see also `26_NATIVE_BOOT_RUN2b.md`) |

## Test-only setup

- Installed debug APKs via `adb install -r` (does not change product source).
- Granted `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` for GPS tests.
- `adb emu geo fix` used for injection (did **not** change app GPS mode; UI still labeled simulated QA route).
- `pm clear com.fitconnect.android.debug` used once to switch athlete → coach persona after Sign out was not reached in the profile scroller.
- `svc wifi/data disable` for offline banner; re-enabled after.
- `font_scale` 1.3 then restored to 1.0.
- **No product code, DB, production config, or security policy modified.**

## Pre-existing local product diff (NOT this run)

`apps/web/components/landing/landing-os-nav.tsx` still has an uncommitted `overflow-hidden` removal from an earlier session. **Live Vercel still clips the language listbox.** This run did not edit that file.

## Known limitations

- Phone + Wear emulators are **not** a Play-services companion pair; Data Layer reports `MISSING_COMPANION_APP`.
- Health Connect HR / fused GPS not claimed in LOCAL_DEMO.
- TalkBack not enabled (too disruptive for remaining scripted taps); semantics dumped via uiautomator instead.
