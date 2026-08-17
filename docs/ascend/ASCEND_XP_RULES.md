# ASCEND XP™ rules (`ascend.xp.v1`)

Weights (quality index, must sum 100): Activity 25 · Consistency 20 · Recovery 15 · Goals 15 · Performance quality 10 · Personal records 5 · Skill 5 · Community 5.

SLEEP and COACH_PLAN still award dimension XP; they are not a separate slice of the 100% mix (sleep rolls into recovery behavior).

## Awards

- Workout: activity from distance + duration, capped; quality from sustainable pace + HR presence.
- If `recoveryScore < 45`: activity XP × 0.5 (`xp.activity.recovery_weighted`). More volume is not an efficient XP path.
- Per-workout cap: 80 XP before achievement bonuses.
- Duplicate `eventId` → 0 XP.
- Rejected anti-abuse → 0 XP, event still recorded.

## Rank vs volume

Rank names map 1:1 to levels 1–15 from **total XP**. Total XP is recovery-weighted, so rank is not raw volume. Unlocks at levels 3/5/7/9/11/13 never include safety-critical health features.

Thresholds: see `LevelTable.BANDS` (0 … 25000).
