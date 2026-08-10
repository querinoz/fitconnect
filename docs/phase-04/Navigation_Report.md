# Phase 04 — Navigation Report

## Athlete graph

Bottom tabs: **Home · Recover · Train · Discover · You**.

Secondary (pushed): Sports, Programs, Notifications, Session detail (`athlete/training/{sessionId}`).

## Deep links

| URI | Destination |
|-----|-------------|
| `fitconnect://app/athlete/home` | Home |
| `fitconnect://app/athlete/recovery` | Recovery |
| `fitconnect://app/athlete/training/{sessionId}` | Session detail |

## App shell integration

`FitConnectNavHost` HOME route:

1. `NavGuard.authorize(CoreRoute.HOME)`
2. If role ∈ {ATHLETE, ANONYMOUS, ADMIN} → `AthleteOsApp`
3. Else → foundation home (catalog / sign-out)

Sign-out from Profile clears auth + analytics and returns to GUEST via `LocalAthleteSignOut`.

## Guardrails

- Single Athlete nav host — no duplicated screen routes  
- `launchSingleTop` + state save/restore on tab switches  
- Coach OS routes intentionally absent
