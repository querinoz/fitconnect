# Phase 06 — Sports Architecture

```
:foundation
:sports          ← Sports Intelligence Engine (no Compose)
:athlete  ──► :sports
:coach    ──► :sports
:app      ──► SportsContainer + Athlete/Coach OS
```

## Layers

| Layer | Responsibility |
|-------|----------------|
| Domain | `SportId` (value class), `SportDefinition`, metric/training/competition enums |
| Registry | Register / discover / version / deprecate / validate / plugins |
| Catalog | `DefaultSportsCatalog` configuration seed |
| Exercise / Workout / Metrics / Performance / Goals / Competition | Engines |
| Integration | `AthleteSportsFacade`, `CoachSportsFacade` |
| Sync | `VersionedEntity`, conflict strategies, import/export |
| AI | `SportsAiPort` — architecture only |

## Absolute rule enforcement

Sport-specific UI never owns metric schemas. Athlete Home readiness uses `PerformanceEngine`. Coach Profile surfaces use `CoachSportsFacade`.
