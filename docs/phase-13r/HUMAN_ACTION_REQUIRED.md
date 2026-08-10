# HUMAN_ACTION_REQUIRED.md

**Updated:** 2026-08-09  
**Phase state:** BLOCKED (EXIT_GATE FAIL)  
**Do not paste secrets into chat.**

---

## 1. Production Supabase (LIVE_AUTH)

| | |
|--|--|
| **Blocker** | B-AUTH-01 |
| **Why** | Release requires real IdP; adapter exists but no URL/anon configured |
| **Action** | Create/select Supabase project; enable Email auth |
| **Location** | `android/local.properties` → `supabase.url=` / `supabase.anonKey=` **or** CI env `FITCONNECT_SUPABASE_*` |
| **Safe method** | Dashboard → Settings → API → copy URL + **anon** key only (never service_role on device) |
| **Expected** | `AppConfig.usesLiveAuth == true`; sign-in returns real session |
| **Verify** | Auth E2E on attached device; never unit-only |
| **Agent after** | Rebuild; run auth journeys; re-run PHASE_EXIT_GATE |

## 2. Release keystore (SIGNING)

| | |
|--|--|
| **Blocker** | B-SIGN-01 / SIGN-02 |
| **Why** | `assembleRelease` now **hard-fails** without keystore (verified) |
| **Action** | Generate keystore offline; fill `android/keystore.properties` from example |
| **Location** | `android/keystore.properties` + `.jks` path (both gitignored) |
| **Expected** | `assembleRelease` SUCCESS; `apksigner verify` PASS |
| **Verify** | See `ANDROID_SIGNING_VERIFICATION.md` CASE 2 |
| **Agent after** | Signed AAB/APK; fingerprint record |

## 3. Firebase / FCM

| | |
|--|--|
| **Blocker** | B-FCM-01 |
| **Why** | Code path exists (`FcmNotificationGateway`) but `google-services.json` absent → `FCM_CONFIGURED=false` |
| **Action** | Firebase Console → Android app `com.fitconnect.android` → download JSON; add signing SHA |
| **Location** | `android/app/google-services.json` (gitignored) |
| **Expected** | Release build accepts FCM config; token registration on device |
| **Verify** | Real push foreground/background/killed on hardware |
| **Agent after** | Device push certification |

## 4. Android device (DEVICE / E2E)

| | |
|--|--|
| **Blocker** | B-DEV-01 / B-E2E-01 |
| **Why** | `adb devices` empty; Maestro not installed; no gcloud Test Lab |
| **Action** | USB/wireless physical device **or** authorize Firebase Test Lab (`gcloud`) |
| **Expected** | `adb devices -l` shows a device; Maestro runs smoke |
| **Verify** | Install debug/release APK; athlete/coach journeys |
| **Agent after** | Full device matrix + E2E evidence |

## 5. Maestro (optional install by human if agent cannot)

| | |
|--|--|
| **Blocker** | MAESTRO_NOT_INSTALLED |
| **Action** | Install Maestro CLI per https://maestro.mobile.dev |
| **Verify** | `maestro --version` then `maestro test maestro/android/smoke-foundation.yaml` |

---

After ANY human action: agent must **revalidate**, not assume.
