# Phase 05 — Coach Architecture

```
:app
  └─ CoachOsApp (role = COACH)
       └─ :coach
            ├─ ui/          Design System only
            ├─ navigation/  typed CoachDest + deep links
            ├─ data/        CoachRepository + LocalCoachRepository
            ├─ domain/      coach-owned models (not athlete models)
            ├─ payments/    CoachPaymentsGateway
            ├─ files/       CoachFileStore
            ├─ ai/          CoachAiPort (empty adapters)
            └─ di/          CoachContainer → foundation AppContainer
```

## Modular boundaries

| Rule | Enforcement |
|------|-------------|
| No `:athlete` dependency | `coach/build.gradle.kts` |
| No duplicated Design System widgets | Uses `:design-ui` only |
| Offline mutations | `OfflineCoordinator.enqueue` |
| Authz | `UserRole.COACH` + `ACCESS_COACH_OS` |

## Scale posture

Roster filtering is in-memory for local adapter; production adapter should page + index by tag/team. UI already uses `LazyColumn` keyed lists for thousands-capable rendering patterns.
