# ANDROID_POST_LAUNCH_MONITORING.md

**Status:** PLAN ONLY — do not start launch clocks until APPROVED.

## Windows

| Window | Focus |
|--------|-------|
| 0–1h | Crash-free, auth, API 5xx, ANR |
| 0–6h | Push (when live), deep links, bookings |
| 0–24h | Telemetry sync errors, map failures, payment webhooks |
| 0–72h | Retention drop, SEV triage backlog |
| 0–7d | Performance regressions, battery complaints |

## Halt criteria (examples)

- Crash-free users < agreed SLO  
- Auth failure rate spike  
- Confirmed cross-user data leak → **immediate halt**  
- Payment mismatch → halt checkout  

## Owners

Assign before launch. Unassigned = **NOT APPROVED** for observability gate.
