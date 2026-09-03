# P1-AUTH — Real device / emulator test plan

**Status:** Emulator certification **partial** (2026-08-31). Physical Redmi **BLOCKED** (MIUI `INSTALL_FAILED_USER_RESTRICTED`).

## Preconditions

```text
[x] google-services.json in android/app/
[x] FIREBASE_CONFIGURED=true in installed build
[x] NEXT_PUBLIC_DEMO_MODE=false
[x] node scripts/p1-auth-config-diagnostic.mjs → PRODUCTION_AUTH_READY=true
[x] Emulator AVD fitconnect_phone (emulator-5554)
[ ] Supabase Third-Party Firebase Auth configured (JWT bridge)
[ ] Physical device install (optional OEM validation)
```

## Emulator run (2026-08-31)

| Step | Result | Evidence |
| --- | --- | --- |
| `adb devices -l` (emulator-5554) | PASS | Pixel API emulator online |
| `gradlew :app:assembleDebug` | PASS | BUILD SUCCESSFUL |
| `adb -s emulator-5554 install -r app-debug.apk` | PASS | Success |
| Launch `com.fitconnect.android` | PASS | MainActivity displayed |
| Firebase init | PASS | `FirebaseInitProvider: FirebaseApp initialization successful` |
| Identity Core auth screen | PASS | Google / Apple / Email providers visible |
| Email/password in-app sign-in | **BLOCKED** | ADB `input text` does not update Compose `remember` state; Sign in submits empty credentials |
| Google sign-in | **BLOCKED** | Requires Play-signed Google account on emulator (not automated) |
| Session persistence | **BLOCKED** | Depends on successful in-app login |
| Network interruption | **BLOCKED** | Depends on authenticated session |

### Commands

```powershell
$env:ADB = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $env:ADB -s emulator-5554 install -r android/app/build/outputs/apk/debug/app-debug.apk
& $env:ADB -s emulator-5554 shell am start -a android.intent.action.VIEW -d "fitconnect://app/auth" -p com.fitconnect.android
& $env:ADB -s emulator-5554 logcat -d -t 200 -s FirebaseInitProvider:I FirebaseApp:I FitConnectApplication:I
```

## Physical device (Redmi Note 9S)

```text
REAL_DEVICE = BLOCKED
REASON = MIUI INSTALL_FAILED_USER_RESTRICTED (ADB install path blocked)
```

Use emulator for P1-AUTH engineering certification until OEM install is resolved separately.

## Result stamp

```text
REAL_DEVICE = BLOCKED
EMULATOR = PARTIAL (init/install/start PASS; live in-app login BLOCKED)
Date: 2026-08-31
Device: sdk_gphone16k_x86_64 (fitconnect_phone)
Evidence: automated agent run + logcat (no secrets)
```
