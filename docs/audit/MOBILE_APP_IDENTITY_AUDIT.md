# FitConnect Mobile — App Identity, Duplicate Build & Launch Audit

**Date:** 2026-09-05
**Mode:** Diagnostic + controlled install attempt · **NO UI redesign**
**Device:** Redmi Note 9S (`curtana`) · Android 11 · API 30 · ADB `adb-44dc5ec6-ipogZP._adb-tls-connect._tcp`

---

## Executive answer

> **What was running on the Redmi?**
> Native Kotlin/Compose **`com.fitconnect.android.debug`**, launcher **`com.fitconnect.android.MainActivity`**, **not Expo/Metro**.
> That install was **STALE** (`lastUpdateTime=2026-08-15`) while the workspace’s current debug APK is **`com.fitconnect.android`** (no `.debug` suffix) built **2026-09-04**.
> Same `versionCode=13` / `versionName=0.1.0-rc.1` on both → version numbers alone **cannot** prove freshness.

**Root cause of “wrong layout” (primary):**
`STALE BUILD` + **applicationId divergence** (old `.debug` vs current canonical without suffix).

**Not primary:** CSS/Compose visual bug, Metro mismatch, Expo Router, duplicate concurrent FitConnect packages (only one was installed).

---

## 1. APP IDENTITY

| Field | Evidence (pre-cleanup) |
|-------|-------------------------|
| Package on screen | `com.fitconnect.android.debug` |
| Activity | `com.fitconnect.android.MainActivity` |
| PID | `10319` |
| Task | `#37` |
| Process | `com.fitconnect.android.debug` |
| Debuggable | YES |
| Installer | `com.google.android.packageinstaller` |
| firstInstallTime | 2026-08-15 10:38:21 |
| lastUpdateTime | **2026-08-15 10:53:30** |
| APK | `/data/app/.../com.fitconnect.android.debug-.../base.apk` |
| Stack | **Native Compose** (`FitConnectNavHost` → `AthleteOsApp`) — **not** React Native |

Expo package `com.fitconnect.expo` was **not** installed.

---

## 2. DEVICE

| Field | Value |
|-------|-------|
| Model | Redmi Note 9S (`Redmi_Note_9S` / `curtana`) |
| Android | 11 |
| API | 30 |
| ADB serial | `adb-44dc5ec6-ipogZP._adb-tls-connect._tcp` |
| Also attached | `emulator-5554` (not removed; not a duplicate app) |

---

## 3. BUILD (project vs device)

### Variant table

| Variant | applicationId | Source | Build Type | Purpose | Status |
|---------|---------------|--------|------------|---------|--------|
| **Canonical phone (debug, FCM json present)** | `com.fitconnect.android` | `android/app` + `google-services.json` | debug | QA / LOCAL_DEMO | **CANONICAL for physical QA when google-services exists** |
| Legacy debug suffix | `com.fitconnect.android.debug` | same module when **no** google-services (`applicationIdSuffix=".debug"`) | debug | Avoid FCM package clash | **LEGACY on device (Aug 15)** — removed 2026-09-05 |
| Release | `com.fitconnect.android` | same | release | Store/RC | NOT installed; PRODUCTION NO-GO |
| Wear | `com.fitconnect.android.wear` | `android/wear` | debug/release | Watch | Separate product surface |
| Expo (frozen) | `com.fitconnect.expo` | `apps/mobile` ADR-005 | Expo | Legacy Path A | **Not on device**; do not use for native QA |

**CANONICAL MOBILE APPLICATION ID (product):** `com.fitconnect.android`
**CANONICAL QA debug target (this machine, google-services present):** `com.fitconnect.android`
**Label:** `FitConnect DEBUG`

### Local APK (workspace)

| Field | Value |
|-------|-------|
| Path | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Timestamp | 2026-09-04 12:23:28 |
| Size | ~80.3 MB |
| package (aapt) | **`com.fitconnect.android`** |
| versionCode / Name | 13 / 0.1.0-rc.1 |
| Launchable | `com.fitconnect.android.MainActivity` |
| Git HEAD at audit | `0a9155f` (worktree also DIRTY — outdoor/map/workout uncommitted) |

### Why IDs diverged

`android/app/build.gradle.kts` debug:

```kotlin
if (!fcmConfigured) {
    applicationIdSuffix = ".debug"
}
```

`google-services.json` exists (since 2026-08-30) → **current** builds omit `.debug`.
Phone still had the **pre–google-services** package id from **2026-08-15**.

---

## 4. DUPLICATES

| Location | Finding |
|----------|---------|
| Redmi packages | Only `com.fitconnect.android.debug` (before cleanup) |
| Expo on Redmi | None |
| Release on Redmi | None |
| Emulator | Separate device; left alone |
| Project APK outputs | `app-debug.apk` + androidTest APK |
| Downloads (host) | No conflicting FitConnect APKs found at audit time |
| After cleanup | **Zero** FitConnect packages on Redmi until reinstall succeeds |

---

## 5. ENTRY POINT

| Layer | Canonical |
|-------|-----------|
| Launcher Activity | `com.fitconnect.android.MainActivity` (only LAUNCHER) |
| Application | `FitConnectApplication` |
| Compose root | `FitConnectNavHost` → Splash → Auth / Onboarding / `AthleteOsApp` \| `CoachOsApp` |
| Expo Router | Exists only under `apps/mobile` — **frozen**; scheme `fitconnect-expo`; **not** this process |

No competing MainActivity in the native tree for the phone app.

---

## 6. BUNDLE / METRO

| Question | Answer |
|----------|--------|
| Metro / Expo serving UI? | **No** — native Compose bytecode in APK |
| Port 8081 listening on host? | Yes (PID 2360) — **irrelevant** to this APK’s UI |
| Hermes / RN version on device app? | N/A for canonical native app |
| Stale JS bundle? | **N/A** — classify as **STALE NATIVE APK** instead |

---

## 7. ENVIRONMENT

| Flag / config | Debug behavior | Physical device impact |
|---------------|----------------|------------------------|
| `ALLOW_LOCAL_AUTH` | `true` | Demo personas / local auth allowed |
| `RELEASE_CHANNEL` | `"debug"` | Debug channel |
| `API_BASE_URL` | **`http://10.0.2.2:3001`** | **Emulator loopback** — on physical device this does **not** reach the PC host; API calls fail unless rewritten (layout still Compose) |
| LOCAL_DEMO labels | Present in nav/onboarding/auth | Expected for debug demo UX |
| `ENFORCE_PROD_CONFIG` | false | Soft config |

So environment can change **data/auth emptiness**, but the “old looking UI” is explained first by **August APK**, not by Metro.

---

## 8. ROOT CAUSE

**Classification:** `STALE BUILD` (+ `WRONG APPLICATION ID` vs current workspace APK)

Secondary (not layout): `WRONG ENVIRONMENT` for API (`10.0.2.2` on physical).

**Not classified as UI/UX DEFECT yet** — phone was not running the September codebase.

---

## 9. ACTIONS TAKEN

1. ADB package / foreground / dumpsys identity audit.
2. Project variant / MainActivity / Expo boundary audit.
3. Compared device install date vs local APK package name.
4. `:app:assembleDebug` — UP-TO-DATE (existing Sep 4 APK).
5. **Uninstalled** obsolete `com.fitconnect.android.debug` (documented first).
6. Attempted install of canonical `com.fitconnect.android` → **MIUI blocked**: `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`.
7. Retried via `/data/local/tmp/fitconnect-debug.apk` + `pm install` → same MIUI restriction.
8. Pushed APK also to `/sdcard/Download/FitConnect-canonical-debug.apk` (~80 MB) for manual sideload.
9. **No UI code changes.** Emulator not removed.

**Current device state after actions:** **no FitConnect package installed** until user enables MIUI **Install via USB** (Developer options) and/or confirms the on-device install prompt / sideloads the Download APK.

---

## 10. REMAINING ISSUES

1. **HUMAN:** Enable MIUI **Install via USB** / approve the install prompt, then:

```powershell
$PHONE="adb-44dc5ec6-ipogZP._adb-tls-connect._tcp"
adb -s $PHONE install -r d:\fitconnect\android\app\build\outputs\apk\debug\app-debug.apk
adb -s $PHONE shell am start -n com.fitconnect.android/com.fitconnect.android.MainActivity
```

   Or open **Files → Download → FitConnect-canonical-debug.apk** on the phone and install manually.

2. After install, re-run identity proof (package must be `com.fitconnect.android`, `lastUpdateTime` = today).
3. Consider bumping `versionCode` so stale vs fresh is visible in dumpsys.
4. Debug `API_BASE_URL` should use host LAN IP (or cleartext config) for physical devices — **separate** follow-up, not UI redesign.
5. Worktree still DIRTY — APK reflects last assemble (Sep 4), not necessarily every uncommitted line unless rebuilt after edits.
6. Do **not** treat Expo as QA target.

---

## 11. FINAL CANONICAL STATE (target)

```text
FitConnect Mobile (native ADR-005)
        ↓
ONE CANONICAL APP  (android/:app)
        ↓
ONE APPLICATION ID  com.fitconnect.android   (debug w/ google-services)
        ↓
ONE ENTRY POINT     MainActivity → FitConnectNavHost
        ↓
ONE BUILD FLOW      cd android; .\gradlew.bat :app:assembleDebug
        ↓
ONE QA TARGET       Redmi Note 9S + that package
        ↓
CORRECT CURRENT UI  only after fresh install succeeds
```

**Expo** = frozen legacy (`com.fitconnect.expo`) — keep out of physical native QA.

---

## Identity proof template (run after successful install)

```text
DEVICE          Redmi Note 9S / curtana
ANDROID / API   11 / 30

PACKAGE         com.fitconnect.android
VERSION NAME    0.1.0-rc.1
VERSION CODE    13

APK PATH        (pm path)
BUILD VARIANT   debug
BUILD TYPE      debuggable

MAIN ACTIVITY   com.fitconnect.android.MainActivity
ENTRY POINT     FitConnectNavHost (Compose)

JS BUNDLE       N/A (native)
METRO STATUS    irrelevant

GIT COMMIT      0a9155f (+ dirty worktree note)
BUILD TIMESTAMP apk LastWriteTime / lastUpdateTime
```

---

## Conclusion / Conclusão

**EN:** The Redmi was showing the **correct product family** (native FitConnect) but the **wrong vintage**: an **Aug 15** `*.debug` install, not the current Sep workspace APK (`com.fitconnect.android`). Fix identity by installing the canonical debug APK (MIUI approval required). Only then judge UI defects.

**PT-BR:** O Redmi mostrava a **família de produto correta** (FitConnect nativo), mas a **versão errada**: instalação de **15/08** com id `*.debug`, não o APK atual do workspace (`com.fitconnect.android`). Corrija a identidade instalando o debug canônico (aprovação MIUI). Só depois avalie defeito de UI.
