# P2-CORE Architecture

**Date:** 2026-09-03
**Status:** engineering (see `docs/audit/P2_CORE_RESULT.md`)

```
FITCONNECT
    │
┌───┴────┐
│        │
WORKOUT  HEALTH CONNECT
WAVE 2   sleep/steps/HR
│        │
Room     Room telemetry
│        │
└───┬────┘
    │
SYNC LAYER
    │
017 + 018 DB
    │
activities + ASCEND/XP

Coach (parallel):
Firebase identity → role=COACH → GET roster/sessions → source=postgres|empty
LOCAL_DEMO only when session.isLocalDemo
```

## Rules

- Workout activity ≠ Health Connect telemetry (separate sources).
- ProgressionEngine 017 remains canonical for strength progression.
- No silent seed fallback when `DATABASE_URL` is configured for coach roster/sessions.
- Finish workout must not block UI on HTTP (Wave 2 enqueue-only preserved).
