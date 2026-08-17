# ASCEND™ domain model

Immutable snapshots. Mutable state lives only in `AscendStore` (event log + prefs).

**Events:** `PerformanceEvent` (`eventId`, `userId`, `type`, `timestamp`, `source`, `payload`).

**Progression:** `PerformanceXP` (dimension map + total), `PerformanceLevel`, `PerformanceRank` (01–15).

**Identity:** `Achievement` (+ category, rarity, progress), `Streak`, `Challenge`, `Mission`, `PersonalRecord`, `AthleteDNA`, `MotivationProfile`.

**Output:** `EnergyDeployment`, `RealWorldConversion`, `MapSegment` (demo labeled), `Unlock`, `ProgressionSnapshot`.

Projector: `AscendEngine.snapshot(userId)` folds the event log deterministically.
