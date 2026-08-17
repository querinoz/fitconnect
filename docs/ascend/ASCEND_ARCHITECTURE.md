# ASCEND™ architecture

ASCEND is a **domain engine** (`:ascend`, kotlin-jvm). Compose screens consume `ProgressionSnapshot` only. UI never computes authoritative XP.

```
PerformanceEvent
        ↓
AntiAbuse.validate
        ↓
AscendStore.append (idempotent eventId)
        ↓
fold → XP + streaks + records + achievements + missions + challenges + DNA
        ↓
ProgressionSnapshot
```

## Modules

| Module | Role |
|---|---|
| `:ascend` | Domain, scoring `ascend.xp.v1`, persistence interface |
| `:athlete` | Home, Vault, Activity complete, settings prefs |
| `:coach` | Squad challenge (participation, not humiliation ranks) |
| `:wear` | Compact level/XP/streak · `wear-local` until pairing verified |
| `:design-ui` | Token-only ASCEND components |
| `:foundation` | `NotificationCategory.PROGRESSION` |

## Production boundary

LOCAL_DEMO is local-canonical. Production must validate events server-side. Client XP is not authoritative in production. Credentials remain PENDING_HUMAN.

## Canonical event IDs

`{userId}:{sessionId}:WORKOUT_COMPLETED`

Phone and watch must share `userId` + `sessionId` when Data Layer pairing is verified. Until then watch uses `wear-local` (LINK UNVERIFIED).
