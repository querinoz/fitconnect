# Phase 12 — Booking Security Report

## Domain

Booking/scheduling spans:

- Web: session API routes, maps/booking engines (`docs/phase-07/Booking_Engine.md`)
- Android coach: `android/coach/ui/bookings/BookingsScreen.kt`
- Android geo: `AvailabilityEngine` / discovery (`android/geo/`)

## Authorization model (target)

| Actor | Allowed action |
|-------|----------------|
| Athlete | Book with coach who published availability; view own bookings |
| Coach | Manage own calendar; confirm/cancel assigned athletes |
| Admin | Override (break-glass) |

## Web controls

- Session routes use `requireAuth` / `requireAthleteId` / `requireCoachId`
- Coach calendar mutations should verify coach owns slot

## Android controls

- Coach OS requires `ACCESS_COACH_OS`
- Athlete booking flows under athlete module — session-bound local repos

## Threats

| Threat | Mitigation | Status |
|--------|------------|--------|
| Book as another athlete | Web IDOR binding | Partial — route-dependent |
| Double-book slot | Server transaction / unique constraint | Not verified |
| Cancel another user's session | Authz on session ID | **Open audit** |
| Price manipulation client-side | Server-authoritative pricing | Demo pricing only |

## Gaps

- No dedicated booking IDOR test suite
- Offline booking queue conflict resolution — see `OFFLINE_SECURITY_REPORT.md`
- Maps discovery exposing coach home address — location privacy

## Verdict

Booking security **inherits session/auth helpers** on web. **End-to-end booking authz not fully audited** in Phase 12.
