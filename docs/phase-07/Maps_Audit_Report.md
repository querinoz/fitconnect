# Phase 07 — Maps Audit Report

**Branch:** `phase-07/maps-discovery-booking` · **Date:** 2026-08-07

## Pre-engine Android state

| Area | Finding |
|------|---------|
| Maps | No MapLibre/Google Android SDK; web has `react-map-gl/maplibre` |
| Discovery | Athlete `discoverCoaches` used hardcoded coach list in repository |
| Bookings | Coach `LocalCoachRepository` owned booking list + approve/reject |
| Availability | Coach calendar slots hardcoded in repository |
| Location | Foundation permission enum only — no location engine |
| Routes / Events / Reviews | Absent on Android |

## Duplication risk (resolved)

Booking + discovery logic moved into `:geo`. Athlete Discover and Coach Bookings/Availability now call engines — UI stays presentation-only.
