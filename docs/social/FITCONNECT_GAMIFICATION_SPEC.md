# FitConnect — Gamification spec

**Canonical engine:** `android/ascend` (`eventId` idempotent).  
**Web Zustand gamification is a fork** — do not extend it. Future: consume ASCEND or a shared package.

## XP sources (performance first)

| Source | Notes |
| ------ | ----- |
| Workout completed | Anti-abuse first; 0 XP if impossible kinematics |
| Missions (daily/weekly) | Already in `MissionLogic` |
| Achievements | Registry XP once |
| Social | Caps required; never infinite self-like |

## Caps / anti-farm

- Idempotent `eventId`
- Impossible speed/distance rejected (`AntiAbuse`)
- No XP for reacting to own posts (to implement when reactions award XP — **they currently do not**)
- Rest/recovery missions are valid XP

## Levels

ASCEND `LevelTable` bands 1–15 (Initiate → Legacy).  
**Not** the web periodic-table curve.

## Badges

ASCEND `AchievementRegistry` + rarity COMMON → MYTHIC.  
Showcase: 3–6 featured on profile (Phase C shows earned list; pin comes later).

## Titles

Mapped 1:1 from selected achievements (see `TitleRegistry` in code).  
Equipped title = athlete choice among **unlocked** titles only.

## Squad XP

Contribution slice of the same processed event. Not a humiliation ranking. No “zero rest day.”

## Streaks

Performance streak **protects recovery days** (existing copy). Do not punish rest.
