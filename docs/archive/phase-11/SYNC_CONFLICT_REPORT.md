# SYNC_CONFLICT_REPORT.md

| Mutation | Strategy | Notes |
|----------|----------|-------|
| athlete.task.toggle | SERVER_AUTHORITATIVE | Idempotency key per minute bucket |
| athlete.program.enroll | SERVER_AUTHORITATIVE | Idempotency key = enroll:programId |
| coach.session.* | SERVER_AUTHORITATIVE | Local ack after optimistic UI |
| coach.booking.* | MANUAL (declared) / local ack demo | Payments/bookings must not last-write-wins blindly |
| Reactions / community | MERGE (future) | Set semantics |
| Prefs | LAST_WRITE_WINS | Non-critical |

Flush is fail-closed: unknown types stay queued. No silent discard.
