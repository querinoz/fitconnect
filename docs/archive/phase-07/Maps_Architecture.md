# Phase 07 — Maps Architecture

```
:foundation
:sports
:geo            ← Maps / Discovery / Booking backbone (no Compose)
:athlete ──► :geo (Discover)
:coach   ──► :geo (Bookings + Availability)
:app     ──► GeoContainer
```

## Engines

Location · Maps (MapLibre preferred + Google abstraction) · Discovery · Booking · Availability · Routes · Nearby · Events · Reviews · Offline store

## Rules

- Coordinates live in `PlacesCatalog` / services — never in screens  
- Map UI binds to `MapController` / `MapScene` — never vendor SDKs directly  
- Booking UI calls `BookingEngine` only  
