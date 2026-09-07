# 08 — ASCEND QA

## Current implementation (not the roadmap)

Athlete Profile: rank **INICIADO · I**, “8 sessions to grade II”, **19 DAY STREAK · LOCAL_DEMO** (was 18 before completing a session), featured titles DAILY RUNNER, CONSISTENCY BEAST, UNBREAKABLE, ROAD WARRIOR. Achievements unlocked: Signal acquired, First kilometer, Daily runner, Cardio initiate, First PR. Locked: Recovery discipline, Sleep architect, Multi-sport.

Wear finish screen: **ASCEND 01 · LOCAL_DEMO** (watch-local).

## Activity → reward

One phone session (`fc-session-1-1787569066267`) completed. Streak **18 → 19**. Duplicate-reward proof: only one completion this identity; no second identical fire observed. Persistence: streak 19 after warm relaunch **before** `pm clear`. After `pm clear`, athlete identity wiped (expected).

## Gaps

- XP numeric ticker not shown as a dedicated XP field on Home (streak/rank instead).
- Watch ASCEND did **not** appear on phone Activity after watch finish (Data Layer down).
- 10 km completion event **not executed** (demo route ~0.18 km).

## Status

**PASS** as LOCAL_DEMO gamification. **FAIL** as cross-device ASCEND. **NOT** production XP ledger.

## Evidence

`dumps/12_athlete_home.xml` (18 streak), `dumps/29_profile.xml` (19 streak), `wear/06_finish.png`.
