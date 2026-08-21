# ANDROID_RC_1_REPORT.md

## Identity

| Field | Value |
|-------|-------|
| Name | FitConnect Android RC-1 |
| versionName | `0.1.0-rc.1` |
| versionCode | `13` |
| applicationId | `com.fitconnect.android` |
| Branch | `phase-13/android-release-candidate` |
| Channel | `rc` (`BuildConfig.RELEASE_CHANNEL`) |
| Timestamp | 2026-08-08 |

## Artifacts (local build)

| Artifact | Path | Notes |
|----------|------|-------|
| Release APK | `android/app/build/outputs/apk/release/app-release-unsigned.apk` | ~2.3 MB, R8 minify, **unsigned** |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | ~5.2 MB — **not Play-production-signed** without keystore |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | local QA / Maestro |

## Build commands verified

```powershell
cd android
.\gradlew.bat :foundation:testDebugUnitTest --tests "*LocalAuthRepositoryTest"
.\gradlew.bat :app:assembleRelease :app:bundleRelease
```

Result: **BUILD SUCCESSFUL**

## What RC-1 certifies

- Release compile + R8 shrink
- Bundle packaging
- Production API URL in release BuildConfig
- Local auth disabled in release
- Cleartext denied in release NSC
- CI uploads release artifacts (workflow updated)

## What RC-1 does **not** certify

- Play Store upload readiness
- Production authentication
- Push, realtime, payments E2E
- Real-device matrix
- Wear OS product

See `ANDROID_RELEASE_BLOCKERS.md` and `PHASE_13_FINAL_QA.md`.
