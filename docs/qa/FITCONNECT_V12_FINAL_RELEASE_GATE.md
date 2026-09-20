# FitConnect V12 — Final Release Gate

**Date:** 2026-09-20  
**Git SHA:** `3a62174372591182ed42fbab55755913911db70e`  
**Branch:** `feat/fitconnect-roadmap-v10-v11`  
**Freeze ancestor `c78c2fd`:** OK  

## Final status

# FITCONNECT V12 — VERIFIED WITH EXTERNAL LIMITATIONS

## Artifact

```text
File: FitConnectV12-Final.apk
Paths:
  - D:\fitconnect\FitConnectV12-Final.apk
  - docs/qa/physical/FitConnectV12-Final.apk
Package: com.fitconnect.android
versionCode: 18
versionName: 0.1.0-rc.1-ia-polished
Size: 151405730 bytes
SHA-256: D34B1DE1FD61AC501B6D7AFE178AEE2130B322D04302BDD643EB9380381C3041
Label: FitConnect DEBUG
Signing: LOCAL DEBUG (not Play-signed)
Build type: assembleDebug (google-services present → no .debug suffix)
```

Wi‑Fi handoff (same LAN as PC):

```text
http://192.168.1.76:8765/FitConnectV12-Final.apk
```

## Gate matrix

| Gate | Result | Evidence |
| --- | --- | --- |
| Android release build (`assembleRelease`) | **NOT VERIFIED** | SIGN-02 fail-closed: `keystore.properties` missing |
| APK validation (debug final) | **PASS** | aapt badging vc18 · ZIP/SHA above |
| Signing / Play-distributed | **NOT VERIFIED** | signing credentials unavailable · no Play pipeline exercised |
| Xiaomi install | **NOT VERIFIED** | USB Redmi Note 9S present; ADB Interface = Unknown · wireless ADB none |
| Xiaomi cold launch / journeys | **NOT VERIFIED** | physical ADB unavailable |
| AVD install Final APK | **PASS** | emulator-5554 · vc18 |
| AVD cold launch | **PASS** | COLD ~5550 ms · FATAL 0 |
| Maestro A sport | **PASS** | EXIT=0 |
| Maestro B plan | **PASS** | EXIT=0 |
| Maestro C nutrition | **PASS** | EXIT=0 |
| Maestro D GPS | **PASS** | EXIT=0 |
| Maestro E domain separation | **PASS** | `maestro/smoke/v12_ia_e_domains.yaml` EXIT=0 |
| V12 security unit regression | **PASS** | 51/51 (gateway/devices/roadmap/context/sport-registry.ia) |
| Web production Playwright (subset) | **PARTIAL** | 8 PASS · 2 FAIL (prod APIs return **404**) |
| Production pages | **PARTIAL** | `/` `/train` `/dashboard` `/feed` `/profile` = 200 · `/nutrition` `/ascend` = **404** |
| Production V10–V12 APIs | **NOT VERIFIED / FAIL vs branch** | `/api/v1/events|context|devices|nutrition/*|network` = **404** on prod |
| Production demo leakage (landing HTML) | **PASS** | DEMO_MODE string hits = 0 |
| Accessibility physical | **NOT VERIFIED** | needs Xiaomi ADB |
| WearOS / Garmin / WHOOP | **NOT VERIFIED** | hardware/OAuth unavailable |

## Root findings (external)

1. **Release signing** — by design fail-closed without `android/keystore.properties`. Engineering Final APK is debug-signed vc18.
2. **Xiaomi** — device on USB but Windows ADB driver unauthorized; no wireless debugging session. APK available via Wi‑Fi HTTP for manual install.
3. **Production web** — live site does **not** yet serve V10–V12 API routes or `/nutrition`/`/ascend` pages from this branch tip. Prod is behind `feat/fitconnect-roadmap-v10-v11` tip `3a62174`. Do not claim production feature parity with AVD-verified IA.

## Manual Xiaomi install (required for physical gate)

```text
FitConnect V12 Final APK was transferred via Wi‑Fi to:

http://192.168.1.76:8765/FitConnectV12-Final.apk
→ save as Download/FitConnectV12-Final.apk

Install it manually on the Xiaomi.
Do not install another version.
After install, enable Wireless debugging (or fix USB ADB authorize)
and keep ADB connected so post-install smoke can resume.
```

## What is verified on this SHA

- IA de-clutter product on Android AVD with Final APK vc18
- Maestro sport/plan/nutrition/GPS journeys
- V12 security honesty unit suite
- Production landing reachable without obvious DEMO_MODE strings in HTML

## What blocks FINAL RELEASE VERIFIED

1. Xiaomi physical ADB + full physical journeys  
2. Local/Play signing credentials + release artifact  
3. Production deploy of branch tip (APIs + nutrition/ascend routes)

## Commands run

```powershell
git rev-parse HEAD  # 3a62174
aapt dump badging FitConnectV12-Final.apk
.\gradlew.bat :app:assembleRelease  # SIGN-02 FAIL
adb -s emulator-5554 install -r FitConnectV12-Final.apk
maestro --device emulator-5554 test maestro/smoke/v12_ia_{a,b,c,d}_*.yaml
$env:PLAYWRIGHT_BASE_URL="https://fitconnect-phi.vercel.app"; playwright …
pnpm vitest run lib/mcp/gateway.test.ts …  # 51/51
```
