# FitConnect V12 — Information Architecture Final QA

**Package:** `com.fitconnect.android`  
**APK:** `docs/qa/physical/FitConnectV12-IA-Polished.apk`  
**versionCode / versionName:** `18` / `0.1.0-rc.1-ia-polished`  
**SHA-256:** `D34B1DE1FD61AC501B6D7AFE178AEE2130B322D04302BDD643EB9380381C3041`  
**Primary nav frozen:** Feed · Ascend · TRAIN · Dashboard · Profile  

PASS = user journey executed (not “screen exists”).

---

## Test matrix

| ID | Journey | Result | Evidence |
|----|---------|--------|----------|
| A | Sport selector groups → confirm → TRAIN updates | **PASS** (AVD Maestro) | `docs/qa/v12-ia/A-sport-*.png` |
| B | Plan summary CTA → dedicated Train Plan | **PASS** | `B-train-plan-*.png` |
| C | Nutrition CTA → subsurface host (Today/Targets/Meals/Foods) | **PASS** | `C-nutrition-*.png` |
| D | GPS CTA when gpsSupported; absent for Strength | **PASS** | `D-gps-cta.png`, `D-routes-hub.png`, `D-no-fake-gps.png` |
| E | Domain separation (nav / Feed / Profile / Dashboard CTA) | **PASS** | `E-*.png` |
| U1 | Nav contract 4 tabs + secondary routes | **PASS** | `:athlete:testDebugUnitTest AthleteNavContractTest` |
| U2 | `gpsSupported` Running true / Strength false | **PASS** | `:sports:testDebugUnitTest SportCapabilitiesTest` |
| W1 | Web sport groups + gpsSupported | **PASS** | `vitest sport-registry.ia.test.ts` 3/3 |
| S | V12 security regression unit | **PASS** | `:foundation:testDebugUnitTest *SecurityRegression*` |
| AVD | fitconnect_phone install + Maestro A–E | **PASS** | emulator-5554 |
| PHY | Xiaomi physical | **NOT RUN** | no ADB physical device attached |

---

## Maestro flows

| Flow | File | Status |
|------|------|--------|
| A | `maestro/smoke/v12_ia_a_sport.yaml` | PASS |
| B | `maestro/smoke/v12_ia_b_plan.yaml` | PASS |
| C | `maestro/smoke/v12_ia_c_nutrition.yaml` | PASS |
| D | `maestro/smoke/v12_ia_d_gps.yaml` | PASS |
| E | `maestro/smoke/v12_ia_e_domains.yaml` | PASS |

---

## Final status

**VERIFIED** (AVD + unit/web). Physical Xiaomi and production web deploy remain **NOT VERIFIED**.
