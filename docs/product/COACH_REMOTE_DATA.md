# Coach Remote Data

## Android

| Surface | Implementation |
|---------|----------------|
| DI | `HttpCoachRepository` wraps API; `LocalCoachRepository` only when `session.isLocalDemo` |
| Roster | `GET /api/v1/coaches/roster` → `{ roster, source }` |
| Sessions | `GET /api/v1/sessions?coachId=` → paginated `{ data, source }` |
| Programs | `GET /api/v1/coaches/programs` → `{ programs, source }` |
| Bookings | `GET/POST /api/v1/coaches/bookings` (list + approve/reject) |
| Inbox | `GET /api/v1/messages?coachId=` |
| Earnings | Fail-closed unless LOCAL_DEMO (`SessionAwareCoachPaymentsGateway`) |
| Other | `NOT_IMPLEMENTED:*` errors — never fake success |

## Web

| Function | When DB configured | When no DB |
|----------|--------------------|------------|
| `listCoachRoster` | postgres rows or `source=empty` on error | `source=seed` |
| `listCoachSessions` | same | `source=seed` |
| `listCoachPrograms` | prisma `Program` rows | `source=seed` |
| `listCoachBookings` | scheduled sessions as pending requests | `source=seed` |

Seed is **development-only**. Remote Android path rejects `source=seed`.

## Authorization

`requireCoachId`: unauthenticated → 401; athlete → 403; coach may only use own id (admin may override).
