# PHASE_15_FUNCTIONAL_QA.md

**Date:** 2026-08-10  
**Mode:** LOCAL_DEMO (debug)  
**Device:** none attached (`adb devices -l` empty)  
**Method:** code + unit tests + assembleDebug — **not** instrumented UI E2E on hardware

## Remediation vs Phase 15 audit

| ID | Fix | Evidence |
|----|-----|----------|
| P0-ID | Places + coach roster + booking seeds → Inês / Marina / Tomás | PlacesCatalog, CoachRepository, BookingEngine |
| P0-BOOK | `BookingEngine.revisions()` + coach BookingsScreen collect | GeoEngineTest + BookingsScreen |
| P0-OFF | Offline enqueue `decline`; app handles `decline` + `reject` | FitConnectApplication |
| P1-CTA | Sports chips select sport; Athletes group filter | SportsScreen, AthletesScreen |
| P1-MAP | LOCAL MAP route polyline + zones + HR/pace/distance | DiscoverScreen LocalMapPreview |
| P1-LIVE | `LiveSessionPreviewMachine` + TrainingScreen | LiveSessionPreviewMachineTest |
| P1-ONB | OnboardingPrefsTest | foundation unit tests |
| P1-MAR | Partial — Marina on roster/bookings/places; athlete home still ath-1 seed | Documented remaining |

## Flow checklist (LOCAL_DEMO — engineering)

| Flow | Status | Notes |
|------|--------|-------|
| Auth demo personas | PASS | Inês, Marina, Tomás, password `password1` |
| Athlete role → onboarding → home | PASS | Prefs persistence tested |
| Coach role → onboarding → overview | PASS | |
| Readiness / recovery | PASS | Deterministic local repo |
| Telemetry | PASS | |
| Training live preview FSM | PASS | Explicitly not production LiveKit |
| Discover search/filter | PASS | |
| Coach profile / booking | PASS | Session-persistent BookingEngine |
| Coach booking refresh | PASS | revisions Flow |
| Community feed actions | PASS | Local engines |
| Programs enroll | PASS | |
| LOCAL MAP | PASS | Labeled demo overlay |
| Offline booking decline path | PASS | Handler alias |
| Dead CTAs (sports/athletes chips) | PASS | Wired |
| Production Auth / FCM / Realtime | PENDING_HUMAN | Fail-closed preserved |

## Offline

LOCAL_DEMO repositories and geo offline cache do not require network for core navigation and demo mutations. No crash-on-offline claim beyond engineering review + existing offline unit tests.

## Accessibility / Motion

Engineering/static from Phase 14 components (semantics, floating nav, reduce-motion). **No TalkBack device evidence.**

## Visual QA on device

**VISUAL_DEVICE_EVIDENCE = BLOCKED** — no device; no screenshots fabricated.
