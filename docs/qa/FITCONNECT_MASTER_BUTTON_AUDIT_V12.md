# FitConnect V12 — Master Button / Interaction Audit

**Method:** Code + API wiring review of V10–V11 surfaces (not exhaustive product-wide click inventory).  
**Rule:** Dead interactions = BLOCKER.

## Live Context card (`live-athlete-context-card.tsx`)

| Control | Handler | API | State | A11y | Test | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Open TRAIN | Link `/train` | — | — | link | e2e dashboard mount | REAL |
| Devices | Link `/profile` | — | — | link | — | REAL |
| Refresh | `load()` | GET `/api/v1/context` | LOADING/ERROR/UNAVAILABLE | button | unit + e2e | REAL |

## Device status API

| Action | Handler | Auth | Confirm | Status |
| --- | --- | --- | --- | --- |
| GET status | listDeviceRegistry(userId) | requireAuth | — | REAL |
| POST status | setDeviceRegistryEntry | requireAuth | confirm:true | REAL — CONNECTED blocked without adapter |

## Coach roster

| Action | Who | Result |
| --- | --- | --- |
| GET roster | coach capability | lists consented links |
| check | coach | 200/403 ACL |
| consent | athlete | creates link |
| link | coach | **403** athlete_consent_required (V12) |
| revoke | either | clears link |

## Network

| Action | Auth | Gate | Status |
| --- | --- | --- | --- |
| create_spot | auth + confirm | visibility redaction | REAL |
| create_event | auth + confirm | — | REAL |
| join_event | auth | public or owner | REAL (V12 private deny) |

## MCP tools (relevant)

| Tool | Write? | Honesty |
| --- | --- | --- |
| get_device_status | no | per-actor NOT_CONNECTED default |
| get_training_load | no | no fake biometrics; ACWR disclaimer |
| create_workout | draft only | requiresApproval |

## Residual

Full product-wide button crawl (every Android Compose / Wear chip) = **PARTIAL** — source reviewed for V10–V11 APIs; Wear adb interaction NOT VERIFIED.
