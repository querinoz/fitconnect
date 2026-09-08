# Live vs Phase 0 — MATCH verification (2026-09-08)

**IA lock unchanged:** Feed · Ascend · [TRAIN FAB] · Dashboard · Profile (no CONNECT/CHAT clone).

**Chrome diet:** `AppConfig.visualQaChromeDiet = true` hides DEMO banners / LOCAL_DEMO chips on athlete surfaces.

## Emulator evidence pack — `docs/qa/v100/`

| Shot | File | Result |
|------|------|--------|
| Splash | `01-splash.png` | PASS — multisport full-bleed + FitConnect wordmark + dual taglines + Voltline **Get Started** |
| Feed | `02-feed.png` | PASS — photo story row (`fc_story_*`) + media post + wordmark + Zenith nav |
| Ascend | `03-ascend.png` | PASS — greeting + single LEVEL ring hero + progression rows; vault demoted |
| Train | `04-train.png` | PASS — photo hero card + PERFORMANCE badge + **START SESSION** only |
| Dashboard | `05-dashboard.png` | PASS — dual Readiness/Load rings; charts labeled **Load Trend / Session Volume** (not CPU/Memory); FAB clear of CTA |
| Profile | `06-profile.png` | PASS — banner + Voltline avatar ring + camera affordances + ATHLETE pill + email |
| Profile a11y | `06-profile-ui.xml` | PASS — `Change profile banner`, `Change profile photo` |

## Checklist vs practical MATCH path

| # | Need | Status |
|---|------|--------|
| 1 | Splash cinematic + Get Started | PASS (emulator) |
| 2 | Train photo hero + START SESSION | PASS |
| 3 | Feed photo stories + media posts | PASS |
| 4 | Demo chrome diet | PASS (no LOCAL_DEMO on Feed/Ascend/Profile in shots) |
| 5 | FAB docked / no Start Session overlap | PASS on Dashboard shot |
| 6 | Ascend greeting + one hero ring | PASS |
| 7 | Screenshot pack live vs Phase 0 | PASS on emulator (layout/photo twin; not pixel-diff CI) |
| 8 | Maestro + real device | **NOT PASS** — Maestro CLI not on PATH; physical MIUI `INSTALL_FAILED_USER_RESTRICTED` |

## Profile media (Marina reference)

- Banner: default `fc_profile_banner` + Photo Picker → `filesDir/profile_media/banner.jpg`
- Avatar: Voltline ring + Photo Picker → `avatar.jpg`
- Prefs: `PROFILE_AVATAR_PATH` / `PROFILE_BANNER_PATH`

## Explicitly out of scope (unchanged)

- Renaming tabs to CONNECT / CHAT / HOME
- “Active Clients” on athlete Dashboard
- Claiming photographic scenes without drawable assets

## Build

- `:app:assembleDebug` — PASS
- Package id on this APK: `com.fitconnect.android` (no `.debug` suffix in current badging)
- Launch: `com.fitconnect.android/com.fitconnect.android.MainActivity`
- Emulator: `fitconnect_phone` / `emulator-5554`
