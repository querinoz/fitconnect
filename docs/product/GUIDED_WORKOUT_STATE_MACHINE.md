# Guided Workout State Machine

```
IDLE → PREP → ACTIVE ⇄ REST
               ⇄ PAUSED
               → COMPLETING → COMPLETED → SYNC_PENDING → SYNCED
FAILED
RECOVERING → restored phase from Room
```

| State | Screen awake | Network |
|-------|--------------|---------|
| PREP | No | No |
| ACTIVE | Yes | No |
| REST | Yes | No |
| PAUSED | Timeout release (2 min) | No |
| COMPLETED / SYNC_* | No | Yes for drain |
| FAILED | No | No |

Illegal transitions reject with an explicit error string and leave the durable phase unchanged.
