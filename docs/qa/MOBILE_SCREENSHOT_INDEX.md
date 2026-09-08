# Mobile Screenshot Index — Path A Zenith

**Date:** 2026-09-08 (FINAL HARDENING)

Distinguish carefully: **VISUAL_SOURCE** ≠ **SIMULATOR_CAPTURE**.

## FINAL HARDENING captures (Android emulator)

### Athlete (`docs/qa/screenshots/android/athlete/after/`)

| Screen | File | Source | Visual |
|--------|------|--------|--------|
| Home | `hardening-athlete-home.png` | SIMULATOR_CAPTURE | PASS |
| Analysis | `hardening-athlete-analysis.png` | SIMULATOR_CAPTURE | PASS |
| Achievements / Vault | `hardening-athlete-vault.png` | SIMULATOR_CAPTURE | PASS |
| Profile | `hardening-athlete-profile.png` | SIMULATOR_CAPTURE | PASS |
| Telemetry | `hardening-athlete-telemetry.png` | SIMULATOR_CAPTURE | PASS |
| Workout | `hardening-athlete-workout.png` | SIMULATOR_CAPTURE | PASS |
| Map / Activity | `hardening-athlete-map.png` | SIMULATOR_CAPTURE | PASS |
| Home (prior remake) | `athlete-home-after.png` | SIMULATOR_CAPTURE | PASS |
| Analysis (prior) | `athlete-analysis-after.png` | SIMULATOR_CAPTURE | PASS |

### Coach (`docs/qa/screenshots/android/coach/after/`)

| Screen | File | Source | Visual |
|--------|------|--------|--------|
| Home / Overview | `hardening-coach-home.png` | SIMULATOR_CAPTURE | PASS |
| Athletes | `hardening-coach-athletes.png` | SIMULATOR_CAPTURE | PASS |
| Calendar | `hardening-coach-calendar.png` | SIMULATOR_CAPTURE | PASS |
| Inbox | `hardening-coach-inbox.png` | SIMULATOR_CAPTURE | PASS |
| More / Profile | `hardening-coach-more.png` | SIMULATOR_CAPTURE | PASS |
| Settings | `hardening-coach-settings.png` | SIMULATOR_CAPTURE | PASS |
| Overview (prior) | `coach-overview-after.png` | SIMULATOR_CAPTURE | PASS |

### iOS

| Screen | Platform | Source | Note |
|--------|----------|--------|------|
| Athlete/Coach surfaces | iOS | VISUAL_SOURCE | `iosApp/` SwiftUI — no SIMULATOR_CAPTURE on Windows |

## FINAL HARDENING

Visual regression: **PASS** (major Athlete + Coach surfaces captured). Discover tab not a bottom destination (entry from Home); Programs/Bookings/Earnings deep captures partial when More panel scrolled past action row — primary shells covered.
