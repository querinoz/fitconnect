# HUMAN_FINAL_CONFIGURATION.md

**Purpose:** Exact human-owned steps only. Everything else is already engineered.  
**Do not paste secrets into chat.**

Date: 2026-08-09

---

## 1. Supabase

| | |
|--|--|
| **WHAT** | Production project URL + **anon** key |
| **WHERE** | `android/local.properties` or CI `FITCONNECT_SUPABASE_*` |
| **HOW** | Dashboard → Settings → API → URL + anon public (never service_role on device) |
| **VERIFICATION** | Live sign-in on device after rebuild; `usesLiveAuth=true` |
| **GATE** | `PRODUCTION_AUTH` |

## 2. Firebase

| | |
|--|--|
| **WHAT** | `google-services.json` for `com.fitconnect.android` |
| **WHERE** | `android/app/google-services.json` (gitignored) |
| **HOW** | Firebase Console → Android app → download JSON; add SHA-1/256 |
| **VERIFICATION** | Token registration + real push on device |
| **GATE** | `PRODUCTION_FCM` |

## 3. Google Cloud / Test Lab

| | |
|--|--|
| **WHAT** | `gcloud auth login` + project with Test Lab |
| **WHERE** | Developer machine / CI SA |
| **HOW** | SDK already installed locally (579); authenticate + set project |
| **VERIFICATION** | `gcloud firebase test android run ...` |
| **GATE** | `CLOUD_TEST_AUTH` |

## 4. Signing

| | |
|--|--|
| **WHAT** | Production keystore + `keystore.properties` |
| **WHERE** | `android/keystore.properties` + `.jks` (gitignored) |
| **HOW** | Generate offline under human ownership |
| **VERIFICATION** | `.\gradlew :app:assembleRelease` SUCCESS + `apksigner verify` |
| **GATE** | `PRODUCTION_SIGNING` |

## 5. Play Console

| | |
|--|--|
| **WHAT** | App listing + internal testing track |
| **WHERE** | Google Play Console |
| **HOW** | Upload signed AAB after gates 1–4 |
| **VERIFICATION** | Internal tester install |
| **GATE** | `PLAY_CONSOLE` (does not auto-unlock FINAL_RELEASE) |

## 6. Device (certification evidence)

| | |
|--|--|
| **WHAT** | USB/wireless device or emulator + Maestro CLI |
| **HOW** | `adb devices` non-empty; `android/scripts/run-maestro-local.ps1` |
| **GATE** | `DEVICE_E2E` |

After any gate: reply with gate names only — agent re-verifies with evidence.
