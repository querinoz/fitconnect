# E2E matrix

Status values: PASS / FAIL / BLOCKED / PENDING_HUMAN / UNAVAILABLE / UNVERIFIED.

| ID | Case | How verified |
|---|---|---|
| 01_boot | App launches | emulator or unit n/a |
| 02_auth | Identity core | prior auth cycle; LOCAL_DEMO |
| 03_athlete_onboarding | 6-step | existing |
| 04_coach_onboarding | coach flow | existing |
| 05_navigation | bottom tabs | existing |
| 06_readiness | home ring | LOCAL_DEMO labeled |
| 07_start_workout_phone | engine + UI | unit + assemble |
| 08_start_workout_watch | Wear START | assemble; device PENDING |
| 09_phone_watch_sync | same sessionId | unit coordinator; pairing UNVERIFIED without Wear node |
| 10_gps_route | 5-point ~2 km | unit `emulatorInjectedPointsMeasureNearTwoKm` |
| 11_pause_resume | engine | unit |
| 12_finish_workout | ENDED + score | unit |
| 13_summary | share card | UI; visual UNVERIFIED until screenshot |
| 14_history | registry duplicate | unit |
| 15_sleep | DATA SOURCE REQUIRED | UI + intelligence unit |
| 16_recovery | CALCULATED label | UI |
| 17_telemetry | Device Center | existing |
| 18_coach_live | no silent GPS | UI default denied |
| 19_offline | outbox | existing WearSessionLink tests |
| 20_reconnect | flush outbox | existing |
| 21_duplicate_prevention | WorkoutRegistry | unit |
| 22_logout | session clear | existing auth |

Hardware rows stay UNAVAILABLE until a Wear emulator or device produces logs.
