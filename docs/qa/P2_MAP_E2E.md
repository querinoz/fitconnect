# P2-MAP E2E

## Test

`OutdoorMapE2EInstrumentationTest`

```powershell
adb -s emulator-5554 devices
adb -s emulator-5554 shell getprop sys.boot_completed
adb -s emulator-5554 shell pm clear com.fitconnect.android
cd android
.\gradlew.bat :app:connectedDebugAndroidTest `
  "-Pandroid.testInstrumentationRunnerArguments.class=com.fitconnect.android.athlete.OutdoorMapE2EInstrumentationTest"
```

## Sequence (deterministic)

1. Local demo sign-in
2. Same-activity deep link via `callActivityOnNewIntent` (`fitconnect://app/athlete/activity`) — does **not** replace MAIN Intent
3. Grant location (UiAutomation)
4. Wait `outdoor_start` (floating controls — always composed)
5. Start → wait **PREPARING**
6. Inject geo (`cmd location set-location` / `geo fix`) — **TEST / SIMULATED DEVICE GPS INPUT**
7. Wait **TRACKING** + accepted points ≥ 2
8. Assert route chrome (`fitconnect_route_map`, `route_a11y_summary`) — canvas fallback under E2E hook
9. Pause → inject → assert point count frozen
10. Resume → inject → count increases
11. Finish via semantics OnClick → assert **SYNC_PENDING** / COMPLETED

## Labels

Emulator evidence ≠ physical GPS hardware.

See also: [`P2_MAP_E2E_HARDENING.md`](./P2_MAP_E2E_HARDENING.md).
