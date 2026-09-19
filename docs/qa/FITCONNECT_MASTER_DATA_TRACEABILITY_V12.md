# FitConnect V12 — Master Data Traceability

| Source | Domain | API | Persistence | UI | AI/MCP | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| AthleteEvent ingest | Training/Recovery/Nutrition/Device | `/api/v1/events` | in-memory Map | context consumers | get_training_load | Idempotent via dedupeKey |
| AthleteContext | Dashboard | `/api/v1/context` | derived | LiveAthleteContextCard | — | No invented biometrics |
| DeviceRegistry | Devices | `/api/v1/devices/status` | per-user Map | Devices links | get_device_status | Cross-user isolated (V12) |
| TrainingLoad / ACWR-lite | Training | context + MCP | calculated | Live card | get_training_load | Auxiliary; disclaimer in UI |
| CoachAthleteLink | Coach | `/api/v1/coach/roster` | in-memory + consent | roster | — | Athlete consent required (V12) |
| SportSpot / SportEvent | Network | `/api/v1/network` | in-memory | network | — | Secret coords owner/shared only |
| Nutrition periodization | Nutrition | today/nutrition paths | rules | nutrition cards | get_nutrition_targets | ESTIMATE targets |
| Health Connect / Garmin / WHOOP | Devices | adapters | NOT live in this cycle | — | — | OAuth NOT VERIFIED |
| Strava | Devices | constraints | owner-only | never social | — | Non-shareable enforced in conflict resolver |

## Honesty rules enforced in V12

1. No client-asserted CONNECTED without adapter session  
2. MANUAL HR → ESTIMATED, not REAL  
3. Hydration totals day-filtered  
4. MCP strainScore cannot rewrite historical session strain  
5. Private events cannot be joined by strangers
