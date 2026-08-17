# ASCEND™ architecture audit

**Date:** 2026-08-17  
**Product:** FitConnect Elite OS — performance progression, not a toy gamification skin.

## What already exists (reuse)

| Area | Location | Reuse |
|---|---|---|
| Elite Surface tokens | `:design` / `:design-ui` | Mandatory — no new hues |
| Motion + reduced motion | `EliteMotion` | XP/level animations |
| Haptics | ActivityScreen `LocalHapticFeedback` | optional, preference-gated |
| Notifications | `NotificationGateway` + channels | add `PROGRESSION` category |
| Athlete Home / Recovery / Activity | `:athlete` | entry points, post-workout |
| Live activity + GPS route | `:core-capture`, `EliteRouteMap` | Performance Trace |
| Performance Intelligence | `:shared` intelligence | recovery-aware streaks |
| Wear instrument | `:wear` | concise level/streak/mission |
| Sync idempotency | `OutboxQueue`, `WorkoutRegistry` | same eventId rule |
| Community achievements | `:community` AchievementEngine | keep for social awards; ASCEND is canonical XP |
| Athlete `Achievement` stub | `LocalAthleteRepository.achievements()` | 3 hardcoded titles — replace UI with Vault |
| Leaderboards | `LeaderboardEngine` | squad progress only; no public humiliation |
| LOCAL_DEMO personas | Inês / Marina / Tomás | deterministic ASCEND seeds |
| Offline queue | `OfflineCoordinator` | queue progression events |
| AI insights | `:ai` InsightEngine | directive copy, no medical claims |
| Locale | `LocaleManager` EN/PT/… | ASCEND copy EN+PT |

## What must be created

Dedicated `:ascend` kotlin-jvm domain (no Compose). UI consumes snapshots only.

## What should not be duplicated

- Do not reimplement GPS, HR zones, or Health Connect in ASCEND.
- Do not scatter XP math in Compose.
- Do not delete community AchievementEngine (different bounded context).

## Risks

- Client XP is **not** production-authoritative — architecture allows server reconcile; LOCAL_DEMO is local-canonical.
- Watch + phone double-award if eventIds diverge — canonical id = `sessionId:WORKOUT_COMPLETED`.
- Streak anxiety — recovery protection is mandatory.
- Fabricated “owned by X%” — forbidden unless population data exists (demo labeled).

## Dependencies

`:ascend` → none (pure JVM).  
`:athlete`, `:coach`, `:wear`, `:design-ui` → `:ascend`.
