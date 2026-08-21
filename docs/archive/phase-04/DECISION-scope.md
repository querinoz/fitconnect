# Phase 04 — Athlete OS scope decisions

**Date:** 2026-08-07 · **Authority:** Phase 03 approval + ADR-005

## What ships

Native Kotlin/Compose `:athlete` module — Athlete Operating System shell + centers (Home, Recovery, Training, Sports, Programs, Discover, Profile, Notifications) on Design System 2.0 + Core Platform.

## Data

`LocalAthleteRepository` provides a **complete, coherent offline-first dataset** (same pattern as `LocalAuthRepository`). Screens are fully interactive against this port. Live API adapters plug in behind `AthleteRepository` without UI rewrites.

## Explicitly out of scope

- Coach OS module  
- Maps / Telemetry / AI Engine products  
- Live Garmin/WHOOP/Oura SDKs (ports only)  
- Empty placeholder screens
