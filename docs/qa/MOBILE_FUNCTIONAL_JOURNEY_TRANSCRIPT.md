# Mobile Functional Journey Transcript (P1 Closure)

**Mode:** Functional (not visual). Mutations proven by API tests; UI steps by instrumentation tags / LOCAL_DEMO nav.

## Athlete

| STEP | ACTION | EXPECTED | ACTUAL | STATUS |
|------|--------|----------|--------|--------|
| AUTH-001 | LOCAL_DEMO / Firebase launch → auth | Session identity | UI nav + prior P1-AUTH | PASS (prior / UI) |
| ONB-001 | Onboarding complete/skip | Athlete OS | tag `athlete_os` | PASS (instr) |
| HOME-001 | Open Today | Home loads | tag `athlete_home` | PASS (instr) |
| DISCOVER-001 | Open Discover | Coach list or empty/error | tag `athlete_discover` | PASS (instr) |
| BOOK-001 | Create booking | Persisted pending booking | API 201 + id | **PASS** (API) |
| BOOK-002 | Impersonate athleteId | 403 | 403 | **PASS** (API) |
| BOOK-003 | Duplicate slot | Idempotent same id | 200 idempotent | **PASS** (API) |
| SOCIAL-001 | Open community | Feed loads | tag `athlete_community` | PASS (route exists) |
| SOCIAL-COMMENT-001 | Add comment | Persisted comment | API 201 | **PASS** (API) |
| SOCIAL-REACTION-001 | React LIKE | One row; re-POST idempotent | API 201 then 200 | **PASS** (API) |
| WORKOUT-001 | Train FAB | Guided workout | tag `athlete_guided_workout` | PASS (instr + prior) |
| OUTDOOR/MAP/GPS | Prior waves | Unchanged | prior PASS | PASS (regression untouched) |
| PROFILE-001 | Profile + logout path | Tags present | `athlete_profile` | PASS (instr) |

## Coach

| STEP | ACTION | EXPECTED | ACTUAL | STATUS |
|------|--------|----------|--------|--------|
| COACH-HOME-001 | Overview | Loads | tag `coach_overview` | ENGINEERING |
| COACH-ATHLETE-001 | Athlete detail ACL | Prior Wave2 | prior | PASS (prior) |
| COACH-CALENDAR-001 | Open calendar | Events from sessions | tag `coach_calendar` | ENGINEERING |
| COACH-RESCHEDULE-001 | Move session | scheduledAt updates | API 200 | **PASS** (API) |
| COACH-RESCHEDULE-002 | Foreign coach | 403 | 403 | **PASS** (API) |
| COACH-CANCEL-001 | Cancel session | status cancelled | API 200 | **PASS** (API) |
| COACH-CANCEL-002 | Athlete cancel | 403 | 403 | **PASS** (API) |
| COACH-ANALYTICS/EARNINGS | Prior wave | Honest unavailable revenue | prior | PASS (prior) |

## Instrumentation

`com.fitconnect.android.p1.P1FunctionalJourneyInstrumentationTest` — athlete LOCAL_DEMO surface reachability.
