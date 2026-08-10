# Phase 05 — Coach OS scope decisions

**Date:** 2026-08-07 · **Authority:** Phase 04 Athlete OS approval + ADR-005

## What ships

Native Kotlin/Compose `:coach` module — Coach Operating System. Depends on `:foundation` + `:design-ui` only. **Does not depend on `:athlete`** (no duplicated athlete components).

## Auth entry

`coach@fitconnect.app` → `UserRole.COACH` → `CoachOsApp`. Athlete demo remains `demo@fitconnect.app`.

## Data

`LocalCoachRepository` + payment/file/AI **ports** (architecture adapters). Screens are fully interactive offline-first.

## Explicitly out of scope (STOP)

- Sports Engine product work  
- Maps  
- Telemetry product  
- AI logic / model runtime (ports only)
