# Mobile P1 API Gaps

| Gap | Disposition | Notes |
|-----|-------------|-------|
| Athlete create-booking API | **CLOSED** | `POST /api/v1/bookings` |
| Booking authorization | **CLOSED** | Auth subject only; impersonation 403 |
| Booking duplication | **CLOSED** | Natural key athlete+coach+scheduledAt → idempotent |
| Remote comments | **CLOSED** | `/comments` + migration 019 |
| Remote reactions | **CLOSED** | `/reactions` + PK idempotency |
| Social authorization | **CLOSED** | author/user from auth |
| Coach reschedule | **CLOSED** | `PATCH/PUT /api/v1/sessions/[id]` |
| Coach cancel | **CLOSED** | `CANCELLED` status |
| Coach authorization | **CLOSED** | owner-only; athlete 403 |
| Emulator journey transcript | **CLOSED** | docs + instrumentation class |

## Duplicate booking rule (documented)

One **pending/SCHEDULED** booking per `(athleteId, coachId, exact scheduledAt)`.
Repeat create → **200** with `idempotent: true` and same booking id.
Optional `idempotencyKey` / `Idempotency-Key` header also reuses the same external id.

## Reaction semantics (documented)

Primary key `(post_id, user_id, emoji)`.
Re-POST same emoji → keep existing (idempotent).
DELETE → remove that emoji for the auth user.
