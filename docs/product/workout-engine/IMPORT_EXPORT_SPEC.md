# Import / Export — Specification

**Version:** 1.0.0 (planned P4)

## Export package

```json
{
  "schemaVersion": "fitconnect-export-v1",
  "exportDate": "ISO-8601",
  "profile": { },
  "bodyWeight": [ ],
  "exercises": [ ],
  "plans": [ ],
  "sessions": [ ]
}
```

**Never export:** auth tokens, secrets, private keys.

## Import pipeline

```
FILE → DETECT → PARSE → VALIDATE → MAP → PREVIEW → MERGE → COMMIT
```

## Sources (priority)

1. FitConnect export (round-trip)
2. FitNotes CSV
3. Strong CSV
4. Hevy JSON
5. Apple Health weight (XML)

Unknown exercise → create `is_custom` exercise — do not drop rows.

## Plan share

`fitconnect-plan-v1` — routines + schedule only; **no** body weight, HRV, or history.

Import mode: **MERGE** — never blind overwrite.
