# 09 — GPS / MAP / TELEMETRY QA

## Implementation (code + runtime — both required)

`DefaultLocationEngine` does **not** bind FusedLocationProvider / LocationManager. `requestForegroundUpdates` returns Ok without a live provider. `LiveActivityEngine` default GPS is deterministic `QaGpsRoute` labeled **LOCAL_DEMO**. `ingestFix` is the only LIVE path.

Runtime Activity copy (verbatim):

- Idle: **“GPS unavailable”**, **ROUTE · NO TRACE**, “Routes are never invented.”
- Recording: **“GPS: simulated QA route (not hardware)”**, GPS chip **DEMO**, **“FusedLocation LIVE GPS is not claimed in LOCAL_DEMO. Emulator geo inject is GPS.EMULATOR.”**
- Watch feed: **“No Data Layer packets.”**

`adb emu geo fix` was issued (Lisbon-ish). UI **did not** switch to a LIVE fused feed. Classification:

| Feed | Class |
|---|---|
| Activity distance/pace/route while RUNNING | **SIMULATED** (QA route) |
| HR 148 / Z3 | **SIMULATED** (sine / LOCAL_DEMO) |
| Calories, elev +1–2 m | **SIMULATED** |
| Emulator geo inject | **NOT CONSUMED** as live path in this build |
| REAL FUSED LOCATION | **NO** |

## Map visual

Idle: empty map, NO DATA YET. Running: ROUTE · LIVE, modes LIVE/ROUTE/HEATMAP/PACE/HEART_RATE/ELEVATION. Discover map: “GPS · DEMO INSTRUMENT”, “not live GPS”. Contrast: dark floor + volt accents. Small-screen emulator 1080×2400: controls Pause/Lap/Finish reachable after scroll.

## Status

Map **PASS** as honest empty/demo instrument. GPS **FAIL** vs “real device GPS”. Telemetry **PASS** as labeled SIMULATED.

## vs Run #1

Code finding **CONFIRMED** at runtime (was code-only). Not BLOCKED anymore.
