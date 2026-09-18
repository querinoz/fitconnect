# Real-Time Sports Intelligence (V10)

## Bounded contexts
- **Events** — schema-versioned athlete events with dedupe
- **Context engine** — reduces events → `AthleteContext`
- **Training load** — ACWR-lite from completed session strain
- **Live adaptation suggestions** — explainable, confirm-required, never silent

## APIs
- `GET/POST /api/v1/events`
- `GET /api/v1/context`

## UI
- Dashboard `LiveAthleteContextCard` — shows MISSING/STALE honestly; never fabricates LIVE HR

## Safety
- SPIKE load → caution flag (not diagnosis)
- STALE HR during ACTIVE → not shown as LIVE
