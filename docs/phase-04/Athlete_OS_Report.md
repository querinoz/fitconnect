# Phase 04 — Athlete OS Report

**Branch:** `phase-04/athlete-os` · **Date:** 2026-08-07 · **Module:** `:athlete`

## Verdict

Athlete Operating System shell ships as a native Kotlin/Compose feature module on Design System 2.0 + Core Platform. Logged-in ATHLETE / ANONYMOUS / ADMIN roles enter `AthleteOsApp` instead of the foundation placeholder home.

## Architecture

| Layer | Implementation |
|-------|----------------|
| UI | Compose screens + `AthleteNavHost` + bottom tabs |
| Domain | `Models.kt` (readiness, recovery, sessions, programs, coaches, profile, …) |
| Sports | `SportsEngine` / `DefaultSportsEngine` — per-sport metric registry |
| Data | `AthleteRepository` + `LocalAthleteRepository` (offline-first coherent dataset) |
| Wearables | `WearableGateway` + `ArchitectureWearableGateway` (ports only) |
| DI | `AthleteContainer` → `FitConnectApplication.athleteContainer` |

## Surfaces shipped

| Center | Route | Notes |
|--------|-------|-------|
| Home | `athlete/home` | Greeting, scores, recovery/HRV, AI summary, weather, next session, coach message, tasks, quick actions, chart, recent activity |
| Recovery | `athlete/recovery` | Score, sleep, HRV, rHR, timeline chart, recommendations, warnings, history |
| Training | `athlete/training` + session detail | Upcoming/completed, exercises, notes, coach feedback, media refs |
| Sports | `athlete/sports` | Multi-sport engine UI + custom metrics |
| Programs | `athlete/programs` | Enrollment, week, progress, milestones |
| Discover | `athlete/discover` | Coach search + specialty/language/verified/distance filters |
| Profile | `athlete/profile` | Medical, emergency, goals, achievements, body/nutrition/hydration, wearables, privacy, subscription, sign-out |
| Notifications | `athlete/notifications` | Inbox list |

## Embedded vs dedicated modules

Sleep, HRV, resting HR, training load signals → **Recovery + Home**. Nutrition, hydration, body metrics, goals, achievements, settings/privacy → **Profile**. Community social hub → **deferred** (Discover + coach messages cover coach-facing social for this phase) — see `Technical_Debt.md`.

## Explicitly not built (STOP)

- Coach OS module  
- Maps  
- Telemetry product  
- AI Engine product (AI summary text is local OS copy, not a model runtime)

## Design System

All athlete UI uses `:design-ui` (`EliteCard`, `EliteButton`, `EliteChip`, `EliteChart`, `EliteMetricCard`, `ElitePersonCard`, `EliteLazyList` patterns via `LazyColumn`, tokens/spacing). No ad-hoc hex in athlete screens.
