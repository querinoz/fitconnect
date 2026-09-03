# P1-AUTH FINAL UNBLOCK VERIFICATION REPORT

**Date:** 2026-08-31
**Result:** **P1-AUTH = BLOCKED** Â· **P2-CORE = LOCKED**

## Executive summary

Full automated execution completed. Firebase web + Android config present; emulator boots, APK installs, Firebase initializes. Real Firebase email accounts authenticate via Identity Toolkit REST API. **Supabase rejects real Firebase ID tokens** (401/403) â€” Third-Party Firebase Auth not yet bridging. In-app Android login not certified via ADB (Compose state limitation). No demo/fake auth used as PASS evidence.

## Commands executed

```text
git check-ignore .env.local android/app/google-services.json android/local.properties  â†’ all ignored
node scripts/p1-auth-config-diagnostic.mjs                                           â†’ exit 0, PRODUCTION_AUTH_READY=true
gradlew :app:assembleDebug :foundation:testDebugUnitTest :core:fitness:testDebugUnitTest â†’ BUILD SUCCESSFUL
gradlew signingReport                                                                â†’ BUILD SUCCESSFUL
adb -s emulator-5554 install -r app-debug.apk                                        â†’ Success
adb launch + logcat Firebase init                                                    â†’ PASS
node scripts/p1-auth-live-bridge-check.mjs                                           â†’ SUPABASE_BRIDGE=FAIL (401/403)
node scripts/p1-auth-emulator-email-flow.mjs                                         â†’ Firebase account READY
P0_SEC_LIVE_RLS=1 vitest identity+activities IDOR                                    â†’ 8/8 PASS
pnpm vitest auth suite                                                               â†’ 56/56 PASS
pnpm build                                                                           â†’ PASS
pnpm typecheck                                                                       â†’ FAIL (strava-integration, unrelated)
pnpm test                                                                            â†’ FAIL (health-contract, unrelated)
```

## Gate table

| Gate | Result |
| --- | --- |
| FIREBASE_WEB | **PRESENT** |
| ANDROID_GOOGLE_SERVICES | **PRESENT** |
| OAUTH_WEB_CLIENT (local.properties) | **PRESENT** |
| DEMO_MODE | **DISABLED** |
| GRADLE / DEBUG BUILD | **PASS** |
| EMULATOR | **PASS** |
| FIREBASE_INIT (native) | **PASS** |
| FIREBASE_EMAIL (REST, production) | **PASS** |
| FIREBASE_EMAIL (Android UI) | **BLOCKED** |
| GOOGLE_AUTH (emulator) | **BLOCKED** |
| SUPABASE_THIRD_PARTY_JWT | **FAIL** |
| RLS / IDOR | **PASS** (8/8 live) |
| PHYSICAL_REDMÄ° | **BLOCKED** (MIUI) |
| WATCH | **PENDING_P7** |
| P1-AUTH | **BLOCKED** |
| P2-CORE | **LOCKED** |

## Next human actions

1. **Supabase Third-Party Firebase Auth** â€” see `HUMAN_AUTH_CONFIGURATION.md` Â§ Firebase Console step 8. Re-run `node scripts/p1-auth-live-bridge-check.mjs`.
2. **Optional:** Register App Check debug token from emulator logcat in Firebase Console (debug builds only).
3. **Optional:** Complete in-app login on emulator manually or add Compose UI instrumentation test (`auth_email`, `auth_password`, `auth_submit` testTags exist).
4. Physical Redmi: enable USB install in MIUI separately (not required for emulator gate).
