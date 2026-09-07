# Mobile Full User Journeys

**Date:** 2026-09-07
**Rule:** Screen opened ≠ journey PASS. Mutations must change canonical state.

## Athlete

| Step | Expected | Current | Status |
|------|----------|---------|--------|
| install → launch | Splash → guest/auth/home | Eng boot + loading surfaces | ENG |
| auth | Firebase / demo explicit | CompositeAuth | ENG |
| onboarding | Persist + relaunch | KV + remote | ENG |
| home | Real readiness when HC synced | Sleep/steps now synced on grant | PARTIAL |
| profile | Canonical identity | Mixed | PARTIAL |
| discover | Real coaches | LOCAL_DEMO geo | DEMO_ONLY |
| coach / program / booking | Remote enroll | Athlete side still local | DEMO_ONLY |
| workout | Guided FSM → activity → XP | Wave 2 | ENG PASS |
| outdoor | GPS → route → sync | P2 GPS/Map | ENG PASS |
| health | HC permissions → Room | Wired sync | PARTIAL (device) |
| ASCEND | Idempotent XP | ProgressionEngine | ENG |
| settings / logout / relaunch | Clear session | Auth logout | ENG |

## Coach

| Step | Expected | Current | Status |
|------|----------|---------|--------|
| auth / onboarding | Role COACH | Eng | ENG |
| dashboard | Remote overview | Roster+sessions+bookings count | PARTIAL |
| athletes | Remote roster | Wired | ENG |
| athlete detail | Remote | NOT_IMPLEMENTED | STUB |
| programs | Remote list | `/coaches/programs` | ENG list |
| sessions | Remote list | Wired | ENG |
| bookings | List + approve/reject | `/coaches/bookings` | ENG |
| earnings | Honest unavailable or Stripe | Fail-closed live | HONEST STUB |
| inbox | Messages | `/messages` | ENG |
| logout | Clear session | Auth | ENG |

## Journey execution this cycle

| Environment | Result |
|-------------|--------|
| Automated contracts | P2CORE-001…006 |
| Emulator full UI journey | NOT RUN (program focus = implement) |
| Physical | BLOCKED |
