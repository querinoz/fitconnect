# Mobile Polish — Visual Evidence Matrix (Cycles 2–5)

**APK:** `FitConnect-POLISH5-v16.apk` · versionCode **16** · `0.1.0-rc.1-polish5`  
**Date:** 2026-09-09  
**Device push:** `/sdcard/Download/FitConnect-POLISH5-v16.apk` (WiFi ADB; MIUI blocks `adb install`)

## Capture status

Physical screenshots after manual install are **pending user** (INSTALL_FAILED_USER_RESTRICTED on MIUI). Place captures here using names below.

| Surface | Expected file | Status |
|---------|---------------|--------|
| Splash | `01-splash.png` | Pending install |
| Auth (ONE LOGIN) | `02-auth.png` | Pending install |
| Feed | `03-feed.png` | Pending install |
| Athlete Dashboard | `04-athlete-dashboard.png` | Pending install |
| Coach Dashboard / What Now | `05-coach-dashboard.png` | Pending install |
| Profile + Mode Switcher | `06-profile-mode.png` | Pending install |
| Telemetry insight | `07-telemetry.png` | Pending install |
| Map | `08-map.png` | Pending install |
| Sports | `09-sports.png` | Pending install |
| Community | `10-community.png` | Pending install |
| Settings | `11-settings.png` | Pending install |

## Consistency scan (Compose, Cycles 2–5)

| Check | Result |
|-------|--------|
| Athlete feature hex colors (`Color(0x` / `#RRGGBB`) | None in `android/athlete` feature UI |
| MapLibre route colors | Tokenized → `EliteSurfaceColors.VOLTLINE/CONNECT/TELEMETRY` |
| CreatePost sheet | `EliteBottomSheet` |
| Spot sheet | `EliteBottomSheet` + Elite buttons |
| Coach bottom chrome | `EosPremiumBottomNavigation` (parity with athlete) |
| Coach offline | `EliteOfflineBanner` |
| Coach rail ≥600dp | `EliteNavRail` |
| Auth Athlete/Coach chooser | Absent (ONE LOGIN intact in `AuthScreen`) |

## Comparison notes (code-level)

**Before (Cycle 1):** Coach floating pill nav + separate FAB; athlete neu-glass dock; telemetry as raw numbers; orphan Spot card; MapLibre hex strokes.

**After (Cycle 5):** Shared dock + cradle FAB language; coach WHAT NOW priority card; `EliteTelemetryInsight` on Home + Telemetry; sheets/dialogs on Elite tokens; map route colors from DS.
