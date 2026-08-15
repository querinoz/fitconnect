# ANDROID_FEATURE_MATRIX

**Date:** 2026-08-15  
**Evidence rule:** PASS only with executed proof. Code-only = `ENGINEERING_READY`. No device = not DEVICE_PASS.

| Area | Build | Unit | UI (Maestro) | Emulator | Result |
|------|-------|------|--------------|----------|--------|
| Splash | PASS (`:app:assembleDebug`) | PASS (nav route test) | NOT RUN | BLOCKED | ENGINEERING_READY |
| Auth | PASS | PASS (`LocalAuthRepositoryTest`) | NOT RUN | BLOCKED | ENGINEERING_READY · LOCAL_DEMO |
| Onboarding | PASS | — | NOT RUN | BLOCKED | ENGINEERING_READY |
| Athlete | PASS | PASS (`LocalAthleteRepositoryTest`) | NOT RUN | BLOCKED | ENGINEERING_READY |
| Coach | PASS | PASS (`LocalCoachRepositoryTest`) | NOT RUN | BLOCKED | ENGINEERING_READY |
| Discover | PASS | PASS (geo/athlete) | NOT RUN | BLOCKED | ENGINEERING_READY · LOCAL_DEMO |
| Booking | PASS | PASS (`GeoEngineTest` booking) | NOT RUN | BLOCKED | ENGINEERING_READY · LOCAL_DEMO |
| Sessions | PASS | PASS (`LiveSessionPreviewMachine`) | NOT RUN | BLOCKED | ENGINEERING_READY · not LiveKit |
| Community | PASS | PASS (`CommunityContainer` tests) | NOT RUN | BLOCKED | ENGINEERING_READY · LOCAL_DEMO |
| Programs | PASS | PASS | NOT RUN | BLOCKED | ENGINEERING_READY |
| Map | PASS | PASS (`GeoEngineTest`) | NOT RUN | BLOCKED | ENGINEERING_READY · deterministic map panel |
| Activity | PASS | PASS (`LiveActivityEngineTest` 2/2) | NOT RUN (`19_activity.yaml` authored) | BLOCKED | ENGINEERING_READY · LOCAL_DEMO GPS |
| Telemetry | PASS | PASS (telemetry suite) | NOT RUN | BLOCKED | ENGINEERING_READY |
| Profile | PASS | — | NOT RUN (`09` authored) | BLOCKED | ENGINEERING_READY |
| Settings | PASS | PASS (`ThemeSettingsTest`, `LocaleManagerTest`) | NOT RUN (`20_language.yaml`) | BLOCKED | ENGINEERING_READY |
| Language | PASS | PASS (`LocaleManagerTest` 3/3) | NOT RUN | BLOCKED | ENGINEERING_READY · EN/PT resources; ES/FR/DE catalog |
| Dark Mode | PASS | PASS (`ThemeSettingsTest`, `EliteColorRolesTest`) | NOT RUN | BLOCKED | ENGINEERING_READY |
| Light Mode | PASS | PASS (`EliteColorRolesTest`) | NOT RUN | BLOCKED | ENGINEERING_READY |
| Offline | PASS | PASS (offline coordinator / sync tests) | NOT RUN | BLOCKED | ENGINEERING_READY |
| Wear | PASS (`:wear:assembleDebug`) | N/A (no wear unit tests; engine covered in `:core-capture`) | NOT RUN | BLOCKED | WEAR_ENGINEERING_READY · WEAR_DEVICE_TEST=PENDING_HUMAN |

## Nav (athlete)

| Tab | Route | testTag |
|-----|-------|---------|
| Home | `athlete/home` | `athlete_tab_home` |
| Discover | `athlete/discover` | `athlete_tab_discover` |
| Activity | `athlete/activity` | `athlete_tab_activity` |
| Community | `athlete/community` | `athlete_tab_community` |
| Profile | `athlete/profile` | `athlete_tab_profile` |

Nested (not bottom tabs): Sessions, Programs, Recovery, Telemetry, AI, Settings, Notifications.

## Nav (coach)

Home · Athletes · Calendar · Inbox · More — Settings nested from More.

## Activity controls

`start` → `pause`/`end` → `resume`/`end`/`discard`. Always labeled **LOCAL_DEMO**. FusedLocation / Health Connect / BLE **not bound**.
