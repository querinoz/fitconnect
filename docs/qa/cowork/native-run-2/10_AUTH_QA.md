# 10 — AUTH QA

## Classes observed

| Class | Where | Result |
|---|---|---|
| LOCAL_AUTH / DEMO_AUTH | Android personas Inês / Marina / Tomás | **PASS** — tap persona enters OS |
| PRODUCTION_AUTH | Android Google / Apple / Email buttons | **NOT EXERCISED** (would need Google Play accounts) — **PENDING_HUMAN** |
| PRODUCTION_AUTH web | `/api/health` auth=ok supabase | Server present; client demo still primary |
| Web demo session | `/dashboard?demo=1` | **PASS** — Inês Athlete OS |
| Web `/auth` `/login` | dedicated pages | **404** — **NEW** vs “broken password form” (form never reached this path) |
| Protected API | `/api/v1/readiness` | **503** `auth_not_configured` — fails closed **PASS** |
| `/api/v1/integrations/status` | — | **503** (curl) |

## Android specifics

- Welcome: Continue vs Continue anonymously (anonymous not fully walked).
- Email button present; invalid-credentials form **not filled** this run.
- Sign out exists in Profile (`testTag athlete_sign_out`) but was **not reached** in the LazyColumn under device cards — **FAIL** discoverability (P3). Session ended via `pm clear` for coach switch.
- Warm start restored Inês without re-login **PASS** persistence.
- Coach elevation: Tomás persona **PASS**.

## vs Run #1

Email/password live breakage **not re-typed** (no sign-in modal this pass). **STILL OPEN** until the modal is retested. Demo dashboard **PASS**. Sign-out-clears-session on web was NOT_REPRODUCED in prior Run #2 web; not retested here.

## Evidence

`dumps/02_after_continue.xml`, `dumps/51_auth_coach.xml`, curl 503/404.
