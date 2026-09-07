# P2-MAP E2E HARDENING

**Date:** 2026-09-04
**Branch:** `feat/elite-os-v2`
**Emulator:** `fitconnect_phone` / `emulator-5554` · API **37** · `sys.boot_completed=1`
**Package:** `com.fitconnect.android`

## Command

```powershell
adb -s emulator-5554 shell getprop sys.boot_completed
adb -s emulator-5554 shell pm clear com.fitconnect.android
cd android
.\gradlew.bat ":app:connectedDebugAndroidTest" `
  "-Pandroid.testInstrumentationRunnerArguments.class=com.fitconnect.android.athlete.OutdoorMapE2EInstrumentationTest"
```

## Baseline failure (reproduce-first)

| Field | Value |
|-------|--------|
| Method | `startGeoPauseResumeFinish_rendersPersistedRoute` |
| Exact timeout | **WAIT_FOR_START_BUTTON** — `waitForTag("activity_start", 20_000)` |
| Preceding success | `athlete_activity` found after deep link |
| Misleading report | “Compose timeout ~20s” |

## Root cause

**Primary category: C. COMPOSE SYNCHRONIZATION** (with **A. TEST HARNESS**)

`activity_start` lived mid-`LazyColumn` below map/telemetry. On phone AVD it was **off-screen and not composed**, so `onAllNodesWithTag` never saw it.

Secondary issues uncovered while hardening:

| Issue | Category | Fix |
|-------|----------|-----|
| MapLibre MapView blocks Compose idle + SlotWriter crash on destroy | H / A | `MapRenderHooks.forceCanvasFallback` for E2E (GPS/Room independent) |
| `ActivityScenario` intent replaced with VIEW | A | Deep link via `callActivityOnNewIntent` without `setIntent(VIEW)` |
| HoldToConfirm wall-clock hold unreliable under Compose test | A | Semantics `onClick` a11y activate + `performSemanticsAction` |
| Route-detail Nav destroy races ActivityScenario | A / I | Skip auto-nav to route detail when E2E canvas hook is on |
| Finish tag overwritten by HoldToConfirm default tag | A | Caller `modifier` applied first |

## Synchronization strategy

1. Floating always-composed controls (`outdoor_start` / pause / resume / finish)
2. Explicit phases: **PREPARING → inject → TRACKING** (never TRACKING on Start alone)
3. Point count via `outdoor_accepted_points` / phase via `outdoor_phase_value`
4. Emulator geo only after PREPARING — **TEST / SIMULATED DEVICE GPS INPUT**
5. Pause: assert accepted count does not advance
6. Finish: durable **SYNC_PENDING** (no sync HTTP wait)

## Emulator reset (each run)

- `pm clear com.fitconnect.android`
- Runtime location + notification grants via UiAutomation
- No manual taps

## Artifacts

`docs/qa/p2-map-e2e/` — `harden-run*.txt`, `matrix-run1..5.txt`, logcats as needed.

## Remaining limitations

- Physical GPS: **NOT_VERIFIED**
- E2E uses canvas map fallback (MapLibre still used in normal app)
- Route-detail auto-nav skipped under E2E canvas hook
- Full web monorepo `pnpm typecheck` may fail on unrelated `@fitconnect/strava-integration` test typing
