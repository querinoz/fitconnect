# 13 — WATCH / WEAR OS QA

**Device:** emulator-5556, `com.fitconnect.android.wear` 0.1.0 (1). Cold start TotalTime **3989 ms**.

## Boot / Home

READINESS **88**, READY · LOCAL_DEMO, **HR UNAVAILABLE**, MORE, START. **PASS**.

## Workout

START (coordinate tap; text nodes lack content-desc — **P3 a11y**). ELAPSED ticking, LOCAL_DEMO. PAUSE → PAUSED 00:37, RESUME → ELAPSED 00:46, FINISH → COMPLETE 00:48, **ASCEND 01 · LOCAL_DEMO**, DONE. **PASS**.

MORE button: clickable row present; dedicated settings tree **PARTIAL** (not fully mapped).

## Layout

320×640 dump; START at y=581–637 (chin). Text small; HR UNAVAILABLE honest. Touch targets: START bar is full width (good); inner text bounds are small.

## vs Run #1

Wear runtime **RESOLVED** (was BLOCKED). App **runs**.

## Evidence

`wear/01_startup.png`, `03_workout.png`, `04_paused.png`, `06_finish.png`, `dumps/wear_*.xml`.
