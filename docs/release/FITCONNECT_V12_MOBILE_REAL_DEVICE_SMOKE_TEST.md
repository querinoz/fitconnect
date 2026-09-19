# FitConnect V12 — Mobile Real Device / Emulator Smoke Test

**Date:** 2026-09-19  
**Git SHA tested:** `f7095a7`  
**Target requested:** physical Xiaomi (Wi‑Fi) → **ADB unavailable** → user authorized **Android emulator** fallback  

## Artifact

```text
Artifact: FitConnectV12.apk
Package: com.fitconnect.android
VersionCode: 16
VersionName: 0.1.0-rc.1-polish5
Size: 151149647 bytes
Build: PASS (:app:assembleDebug)
Installability: PASS
SHA256: 151F23AB6B14E1287F3C895DF3325C8A8A46C15B4500188352B0B4C17771B9A7
```

## Emulator device

| Field | Value |
| --- | --- |
| AVD | `fitconnect_phone` |
| Serial | `emulator-5554` |
| Model | `sdk_gphone16k_x86_64` |
| Android | 17 (API 37) |
| Resolution | 1080×2400 @ 420dpi |
| Transport | local emulator ADB |

## Install (emulator)

```text
adb install -r FitConnectV12.apk → Success
pm path com.fitconnect.android → present
versionCode=16 / versionName=0.1.0-rc.1-polish5 → MATCH APK
```

## Cold launch

| Check | Result | Evidence |
| --- | --- | --- |
| `am start -W` COLD | PASS | TotalTime ≈ 13849 ms · Status ok |
| Process alive | PASS | pidof after launch |
| FATAL/ANR | PASS (0 hits) | `logcat-fatals.txt` |
| First UI | PASS | Feed · FITCONNECT · nav bar |
| Maestro `cold_launch.yaml` | PASS | `maestro-cold.log` exit 0 |

## Smoke matrix

| Area | Test | Result | Evidence |
| --- | --- | --- | --- |
| Install | APK identity | PASS | dumpsys versionCode 16 |
| Launch | Cold launch | PASS | cold-launch.txt + screenshot |
| Auth | Login/session | NOT VERIFIED | Session already present as Inês demo — no fresh login exercised this run |
| Feed | Open/scroll/cards | PASS | feed texts + gfx swipe |
| Ascend | Progression surface | PASS | Level/XP/Streak/Performance Vault |
| Train | Real session surface | PASS | LOCAL paused workout · Resume/Finish visible (not auto-applied) |
| Dashboard | TODAY command center | PASS | Readiness/Load/TODAY · DEMO readiness labeled |
| Profile | Account / mode | PASS | Athlete · Coach locked honest (“unavailable / Upgrade plan”) · same account copy |
| Athlete/Coach | Mode switch | PASS (honest lock) | Coach not unlocked — no fake bypass |
| Nutrition | Targets/logging | NOT VERIFIED | Not reached in this emulator pass |
| Network | Privacy/join | NOT VERIFIED | Not reached in this emulator pass |
| Devices | Status/provenance | NOT VERIFIED | Profile mentions devices; no adapter session exercised |
| AI/MCP | Honesty | NOT VERIFIED | No Zenith path exercised this pass |
| Offline | Recovery | NOT VERIFIED | Not toggled |
| Lifecycle | Home / restart / rotate | PASS | RESUME_FROM_HOME · RESTART_PID · rotation exercised |
| Performance | gfxinfo sample | PARTIAL | 60 frames · 14 janky (23%) after Feed swipe — noted, not optimized away |
| Accessibility | Basic | PARTIAL | Nav labels present; no TalkBack pass |
| Xiaomi physical | Full smoke | NOT VERIFIED | Wireless ADB never connected |
| WearOS | — | NOT VERIFIED | Separate AVD not used this run |
| Garmin/WHOOP | OAuth | NOT VERIFIED | External |

## Notable honesty checks (emulator)

- Dashboard readiness marked **DEMO** — not presented as device-backed live.
- Coach experience **unavailable** with upgrade CTA — no second login invented.
- TRAIN shows **PHASE PAUSED / LOCAL** with explicit Resume/Finish — no silent completion.
- Ascend is progression (XP/streak), not clinical ACWR UI (ACWR-lite lives primarily on web Live Context).

## Build commands

```powershell
cd android
.\gradlew.bat :app:assembleDebug
Copy-Item app\build\outputs\apk\debug\app-debug.apk ..\FitConnectV12.apk
emulator -avd fitconnect_phone
adb -s emulator-5554 install -r ..\FitConnectV12.apk
adb -s emulator-5554 shell am start -W -n com.fitconnect.android/.MainActivity
maestro --device emulator-5554 test maestro/smoke/cold_launch.yaml
```

## Evidence directory

`docs/qa/physical/v12-emulator/` — screenshots, UI XML, texts, logcat, maestro log, gfxinfo.

## Final status

## MOBILE V12 VERIFIED — EXTERNAL/DEVICE LIMITATIONS REMAIN

**Verified on emulator:** install identity, cold launch, Feed / Ascend / Dashboard / Profile / TRAIN navigation, lifecycle, Maestro cold launch, no FATAL during smoke.

**Remain NOT VERIFIED:** physical Xiaomi ADB, WearOS, Nutrition/Network/Devices/AI deep flows, fresh auth login, offline airplane matrix, Garmin/WHOOP.
