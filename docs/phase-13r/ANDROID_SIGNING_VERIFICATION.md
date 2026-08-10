# ANDROID_SIGNING_VERIFICATION.md

**Date:** 2026-08-09  
**Rule:** SIGN-02 fail-closed

## CASE 1 — No production signing configuration

**Command:**

```powershell
cd android
.\gradlew.bat :app:assembleRelease --no-configuration-cache
```

**Actual result (2026-08-09):**

```
Execution failed for task ':app:verifyReleaseSigning'
SIGN-02 FAIL-CLOSED: android/keystore.properties missing or storeFile invalid
BUILD FAILED
```

**Status:** **VERIFIED** (fail-closed works)

## CASE 2 — Valid production signing

**Status:** **BLOCKED_EXTERNAL** — no `keystore.properties` / keystore on this machine.

**Required:** human creates keystore + gitignored properties (see `HUMAN_ACTION_REQUIRED.md`).

**Afterward verification (agent):**

```powershell
.\gradlew.bat :app:assembleRelease :app:bundleRelease
# then:
apksigner verify --print-certs app\build\outputs\apk\release\*.apk
```

Record packageName, versionName, versionCode, cert SHA-256 only — never passwords.
