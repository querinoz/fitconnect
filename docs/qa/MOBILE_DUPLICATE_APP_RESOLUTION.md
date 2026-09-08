# Duplicate mobile app — resolution (2026-09-07)

## Verdict

There were **not two Android APKs** with the same package competing on device.
There **was** a dual mental/product path that caused confusion:

| Path | Role | Action |
|------|------|--------|
| `android/` | Production Jetpack Compose app (`com.fitconnect.android`) | **KEEP — only mobile product** |
| `apps/mobile` (Expo) | Frozen legacy (ADR-005) | **ARCHIVED** → `_archive/apps-mobile-frozen-adr005` |

## Why the UI looked “unchanged”

1. **Redmi Note 9S** still had an install from **16:05** (before the remade APK at **16:24**). MIUI blocked ADB reinstall (`INSTALL_FAILED_USER_RESTRICTED`).
2. Emulator install was also older than the latest APK until force-reinstall.
3. Remake strings **are** inside `app-debug.apk` (`This week performance`, `EliteWeekProgressHero`).

## Device actions taken

- Emulator: uninstall + install latest `android/app/build/outputs/apk/debug/app-debug.apk` ✅
- Redmi: pushed `/sdcard/Download/FitConnect-debug-REMAKE.apk` — **manual install required** (MIUI)

## Repo actions taken

- `git mv apps/mobile → _archive/apps-mobile-frozen-adr005`
- Removed `pnpm dev:mobile`
- Disabled EAS preview workflow
- Documented in `android/README.md`
