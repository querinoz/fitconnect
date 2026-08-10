# HUMAN_FINAL_CONFIGURATION.md

Only these four items require a human. Everything else for LOCAL_DEMO product use is engineering-owned.

---

## 1. Production Supabase / IdP

**WHY:** Live authentication and user identity for real accounts.  
**WHERE:** Android build secrets / CI env — Supabase URL + anon key consumed by foundation auth (never commit service_role).  
**WHAT TO CONFIGURE:** Production project URL, anon key, redirect/deep-link allowlist for `fitconnect://`.  
**HOW TO VERIFY:** Release/debug-with-live-flag sign-in succeeds; without keys, app remains fail-closed (not silent NoOp).

---

## 2. Firebase / FCM production + `google-services.json`

**WHY:** Production push delivery.  
**WHERE:** `android/app/google-services.json` (gitignored / CI secret) + Firebase project.  
**WHAT TO CONFIGURE:** App package `com.fitconnect.android` (release), Cloud Messaging enabled.  
**HOW TO VERIFY:** Token register + test notification on a signed build with real FCM. Debug uses `DevNotificationGateway` and must not be claimed as FCM PASS.

---

## 3. Google Cloud / Firebase Test Lab authentication

**WHY:** Cloud instrumented / device lab runs.  
**WHERE:** `gcloud auth` + project with Test Lab API.  
**WHAT TO CONFIGURE:** Service account or user auth with Test Lab permissions; upload APK/test targets.  
**HOW TO VERIFY:** `gcloud firebase test android run …` returns a completed matrix (not auth error).

---

## 4. Production signing ownership / keystore

**WHY:** Play-distributable artifacts.  
**WHERE:** CI secrets for store keystore (SIGN-02). Local release without secrets must fail closed.  
**WHAT TO CONFIGURE:** Upload key / Play App Signing ownership; never invent a fake production keystore in-repo.  
**HOW TO VERIFY:** `assembleRelease` with secrets produces a signed AAB/APK; without secrets, build fails closed as designed.

---

Do **not** request these secrets in chat. Configure them in your secret store / CI only.
