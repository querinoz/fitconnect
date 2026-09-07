# 14 — PHONE ↔ WATCH SYNC QA

## Phone → Watch

Phone activity `fc-session-1-1787569066267` RUNNING/PAUSED/COMPLETED. Watch home remained READINESS 88 / not mirrored. **FAIL**.

## Watch → Phone

Watch completed ~00:48 LOCAL_DEMO. Phone Activity still showed the **same prior phone session** COMPLETED. Telemetry PAIR WATCH opened **system Bluetooth** “Pair new device” (not in-app Data Layer). **FAIL**.

## Root cause (runtime)

```
WearableService: Wear is not available on this device: MISSING_COMPANION_APP
```

Phone UI: `ERROR · DATALAYER_GMS`, “Paired means a reachable FitConnect Wear capability, not a Bluetooth-only watch.”

## ASCEND / Squad / Profile from watch

Watch-local ASCEND 01 only. Phone streak change was from **phone** session, not watch.

## Human dependency

Play companion / Wear pairing on a supported image or physical Pixel + Watch. See `25_HUMAN_ACTIONS.md`.

## Status

**BLOCKED** for true sync. **FAIL** vs product requirement phone↔watch. Apps independently **PASS**.
