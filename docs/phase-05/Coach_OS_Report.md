# Phase 05 — Coach OS Report

**Branch:** `phase-05/coach-os` · **Module:** `:coach` · **Date:** 2026-08-07

## Verdict

Professional Coach Operating System ships as a native Kotlin/Compose feature module. It reuses Core Platform + Design System 2.0 and **does not depend on `:athlete`**.

## Entry

| Demo email | Role | Shell |
|------------|------|-------|
| `demo@fitconnect.app` | ATHLETE | Athlete OS |
| `coach@fitconnect.app` | COACH | Coach OS |

Auth screen secondary CTA: **Enter coach demo**.

## Surfaces

| Module | Route / access |
|--------|----------------|
| Overview dashboard | `coach/overview` (tab) |
| Athletes + detail | `coach/athletes`, `coach/athletes/{id}` |
| Calendar | `coach/calendar` (day/week/month/agenda) |
| Sessions + detail | `coach/sessions`, `coach/sessions/{id}` |
| Programs + builder | `coach/programs`, `coach/programs/{id}` |
| Inbox | `coach/inbox` |
| Bookings | `coach/bookings` |
| Analytics | `coach/analytics` |
| Revenue | `coach/revenue` |
| Profile / docs / settings hub | `coach/profile` (More tab) |
| Notifications | `coach/notifications` |

## Ports (architecture)

- `CoachPaymentsGateway` — Stripe Connect ready, local revenue snapshot  
- `CoachAiPort` — suggestion/risk/search contracts, **no AI logic**  
- `CoachFileStore` — images/PDF/video/docs/exercise library  

## STOP honored

No Sports Engine product work, Maps, Telemetry, or AI implementation.
