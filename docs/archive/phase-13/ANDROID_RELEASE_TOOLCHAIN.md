# ANDROID_RELEASE_TOOLCHAIN.md

**RC:** FitConnect Android `0.1.0-rc.1` (versionCode **13**)  
**Commit (at doc write):** see `git rev-parse HEAD` on `phase-13/android-release-candidate`  
**Date:** 2026-08-08

## Toolchain freeze (do not upgrade casually)

| Component | Version |
|-----------|---------|
| Java | 17.0.12 (Temurin/Oracle OK) |
| Node | 25.9.0 local / CI uses 20 |
| pnpm | 9.15.9 |
| Android Gradle Plugin | 9.3.1 (`libs.versions.toml`) |
| Kotlin | 2.4.10 (AGP built-in + Compose plugin) |
| Compose BOM | 2026.06.00 |
| compileSdk / targetSdk | 35 |
| minSdk (phone) | 26 |
| minSdk (wear skeleton) | 30 |
| Gradle wrapper | project `android/gradlew` |
| Expo / RN | **Not used by native `android/` RC** — `apps/mobile` is frozen Path A |
| EAS | N/A for this native RC |

## Product identity

| Field | Value |
|-------|-------|
| applicationId | `com.fitconnect.android` |
| namespace | `com.fitconnect.android` |
| debug suffix | `.debug` → `com.fitconnect.android.debug` |
| versionName | `0.1.0-rc.1` |
| versionCode | `13` |
| RELEASE_CHANNEL (release) | `rc` |
| ALLOW_LOCAL_AUTH (release) | `false` |

## Signing

- Production keystore: **not in repo**
- Template: `android/keystore.properties.example`
- Load path: `android/keystore.properties` (gitignored)
- Without properties: release APK is **unsigned**; AAB may use default debug signing — **do not upload to Play** until production keystore is configured

## Upgrade policy

Upgrade only one logical group at a time; re-run unit tests + `assembleRelease` + `bundleRelease` after each.
