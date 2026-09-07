# Offline Workout Sync

## Flow

1. Local session mutations → Room
2. On finish → `PendingSyncEntity` + `DurableSyncQueue`
3. Types: `workout.activity.complete`, `workout.xp.award`
4. Idempotency: `activity:{userId}:{sessionId}`, `xp:{userId}:{sessionId}`
5. Flush on reconnect via existing `OfflineCoordinator`
6. Never mark SYNCED without handler `Ok` (including HTTP 409 / ASCEND DUPLICATE)

## UI chips

`LOCAL` · `SYNCING` · `SYNCED` · `SYNC ERROR`

## Server

`POST /api/v1/workout-sessions` upserts `activities` on `(MANUAL, sessionId)` and mirrors `strength_sessions`. Without `DATABASE_URL` the API returns **503** — Android keeps the queue (no fake success).
