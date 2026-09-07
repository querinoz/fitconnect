# 05 — COACH OS QA

**Persona:** LOCAL_DEMO Tomás (coach). Entered after `pm clear` (Sign out not reached in profile list). **Auth:** LOCAL_DEMO.

## Onboarding

6 steps (Profile → Specialization → Documents → Pricing → Stripe → Review). Continue through to Command Center. Stripe copy is LOCAL_DEMO / HUMAN_PENDING. **PASS** as demo.

## Command Center

Expected: coach home. Actual: **COACH OS · COMMAND**, “Good evening, Coach Tomás”, ATTENTION 1 AT RISK, BOOKINGS 1, INBOX 2, LIVE SQUAD Watch **ERROR**, athlete offline / no live packet, SQUAD CHALLENGE FC PERFORMANCE WEEK 101.7/50 km. **PASS** (honest ERROR, not fake CONNECTED).

## Navigation

| Dest | Status | Actual |
|---|---|---|
| Home | **PASS** | Command center |
| Athletes | **PASS** | Roster tab opened |
| Calendar | **PASS** | Tab opened |
| Inbox | **PASS** | Messages, mentions, files, announcements (LOCAL_DEMO) |
| More | **PASS** | Tab opened |
| Bookings / AI deeplinks | **PASS** | Intents launched |
| Role guard | **PASS** | Athlete session ignored `fitconnect://app/coach/overview` (stayed on Athlete Today) |

Live monitoring: Watch ERROR + “Connection is never faked.” **PASS** as labeled empty/error, **NOT** live multi-device monitoring.

## vs Run #1

Coach native was BLOCKED. Now **PASS** on LOCAL_DEMO surfaces.

## Evidence

`android/52_coach_onboard.png`, `60_coach_os.png`, `62_coach_athletes.png`, `65_coach_more.png`, `dumps/60_coach_os.xml`.
