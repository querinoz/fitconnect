# ANDROID_RELEASE_BLOCKERS.md

## CRITICAL (must fix before Play publish) — Phase 13R update

| ID | Blocker | 13R status |
|----|---------|------------|
| B1 | Production Supabase IdP | **IN_PROGRESS** (adapter + secret injection); live **BLOCKED_EXTERNAL** |
| B2 | Production signing | **BLOCKED_EXTERNAL** |
| B3 | FCM push | **BLOCKED_EXTERNAL** (still NoOp) |
| B4 | Realtime | **BLOCKED_EXTERNAL** (still NoOp) |
| B5 | Real-device / emulator online certification | **BLOCKED_EXTERNAL** (ADB empty) |
| B6 | Athlete/Coach E2E | **OPEN** (depends on B1+B5) |

See `docs/phase-13r/PHASE_13R_INTAKE.md` and `HUMAN_ACTION_REQUIRED.md`.

## HIGH

| ID | Blocker |
|----|---------|
| H1 | Crash reporting / Sentry not wired in release |
| H2 | Play App Links assetlinks not verified |
| H3 | Stripe/payments client still demo-oriented on web |
| H4 | Instrumented / connectedAndroidTest not in CI |
| H5 | Store listing assets / Data Safety form incomplete |

## Accepted for RC engineering package (not Play)

- Wear OS scaffold only (`WEAR_OS_STATUS.md`)
- `apps/mobile` Expo frozen — not this RC surface
- Local debug auth remains for development APK only

## Gate rule

Until CRITICAL blockers are cleared and retested: **Phase 13 ≠ COMPLETE for store release.**
