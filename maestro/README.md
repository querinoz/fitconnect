# Maestro Zenith hardening — Path A

**App ID:** `com.fitconnect.android` (google-services present → no `.debug` suffix)

## Layout

```
maestro/
  athlete/       # full_journey.yaml — PASS (2026-09-08)
  coach/         # full_journey.yaml — PASS (Home tab, not Overview)
  cross-role/    # booking_message.yaml + coach_shell.yaml — PASS sequential
  smoke/         # cold_launch.yaml — PASS
  offline/       # kill_matrix_shell.yaml — shell probe; unit = OfflineKillMatrixTest
  android/       # legacy flows (prefer zenith folders above)
  scripts/       # adb-e2e-hardening.ps1, dump_ui_text.py
```

## Run

```powershell
$maestro = "$env:USERPROFILE\.maestro-zenith\maestro\bin\maestro.bat"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
& $maestro --device emulator-5554 test maestro/smoke/cold_launch.yaml
& $maestro --device emulator-5554 test maestro/athlete/full_journey.yaml
& $maestro --device emulator-5554 test maestro/coach/full_journey.yaml
& $maestro --device emulator-5554 test maestro/cross-role/booking_message.yaml
& $maestro --device emulator-5554 test maestro/cross-role/coach_shell.yaml
```

## Honesty

- Cross-role: single-device sequential Athlete shell → Coach shell. Dual-device live Supabase booking/message = BLOCKED_EXTERNAL.
- Receiver-state realtime evidence: `RealtimeRegressionHardeningTest` (publish → hub `lastPayload`).
- Offline kill persistence: `OfflineKillMatrixTest` (not full airplane kill/reopen automation).
