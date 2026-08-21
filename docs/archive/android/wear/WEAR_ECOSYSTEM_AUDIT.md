# Wear ecosystem audit

**Date:** 2026-08-17  
**Scope:** existing FitConnect Android tree — evolve, do not replace.

## Modules inspected

| Module | Role | Notes |
|---|---|---|
| `:app` | Phone host, auth, Wear listener | `FitConnectWearListenerService` ingest `/telemetry/*` only |
| `:wear` | Wear OS application | Compose instrument (HOME…SETTINGS), Health Services **probe only** |
| `:shared` | kotlin-jvm contracts | Session SM, route math, Wear paths, outbox, export, recognition, intelligence |
| `:core-capture` | `LiveActivityEngine` | GPS route + countdown + replay; default GPS is QA fixture |
| `:telemetry` | Device Center, Data Layer, Health Connect probe | Garmin/WHOOP/Oura LOCAL_DEMO adapters; official APIs PENDING_HUMAN |
| `:geo` | Maps / location | `DefaultLocationEngine` still mock-seeded; Discover LOCAL MAP |
| `:athlete` | Cockpit | Activity map/replay, Sleep, Daily, Recovery labels |
| `:coach` | Command | LIVE SQUAD card — location hidden without consent |
| `:design` / `:design-ui` | Elite Surface | Volt/Connect tokens; `EliteRouteMap` / `EliteShareCard` |
| `:foundation` | Auth, session, offline | LOCAL_DEMO personas preserved |
| `:ai` | Insights | Evidence-grounded; insufficient data stays insufficient |

## Search (TODO / stub / NoOp / LOCAL_DEMO)

Honest LOCAL_DEMO remains on auth personas, geo tiles, telemetry fixtures, recovery numbers without a sensor.  
`NoWearCompanion` / `NoOpAnalytics` are fail-closed adapters, not fake CONNECTED.  
`FailClosedRealtimeClient.subscribe` = `emptyFlow()` — no invented realtime.  
Xiaomi = `BLOCKED_EXTERNAL_DEPENDENCY`.

## What already existed

- Wear Data Layer paths + outbox + sequence dedupe
- Phone Activity LOCAL_DEMO monitor + watch feed card
- Health Connect SDK probe (not reads)
- Device Center companion states from CapabilityClient
- Athlete + Coach OS, auth, onboarding, offline queue

## What this cycle added

- Workout sport catalog, QA 5-point GPS route, route math, replay
- Activity state READY / COUNTDOWN / FINISHING
- Wear instrument panes (not a scaled phone UI)
- Session adopt/duplicate registry
- Sleep / Daily screens that refuse fabricated stages/steps
- Coach live squad with explicit location consent
- `WearableDataSource` + PENDING_HUMAN vendor catalog
- `make android-wear-test`

## Not claimed

- Production FusedLocation binding (engine supports LIVE ingest; UI default is simulated)
- Real Health Services BPM on emulator
- Wear emulator pairing until an image + reachable node exist
- Garmin / WHOOP / Oura / Strava OAuth
