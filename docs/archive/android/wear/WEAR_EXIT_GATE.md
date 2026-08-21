# Wear exit gate

Next phase is locked unless P0/P1 required tests and BUILD pass. Never convert fixture evidence into sensor PASS.

| Phase | Gate | Notes |
|---|---|---|
| A Architecture | PASS when docs + `:shared` contracts compile | |
| B Activity engine | PASS when unit tests for SM + sports + duplicate | |
| C GPS | PASS unit QA route; LIVE GPS = PENDING_DEVICE | |
| D Map | PASS compile EliteRouteMap; visual UNVERIFIED without screenshot | |
| E Health/recovery | PASS labels; HC production PENDING_HUMAN | |
| F Watch | PASS `:wear:assembleDebug`; emulator may be UNAVAILABLE | |
| G Phone↔watch sync | PASS unit coordinator; pairing UNVERIFIED without node | |
| H Coach live | PASS compile + default location denied | |
| I Visual QA | UNVERIFIED until screenshots | |
| J E2E | see matrix | |
| K Security | no secrets in source; location consent | |
| L Performance | 1 Hz tick; no extra GPS loop in demo | |
| M RC | BLOCKED until Wear pairing + signing + vendor creds | |

P0 remaining: Wear emulator image + official pairing, LIVE GPS binder on device, production Health Services HR.

PENDING_HUMAN: Firebase/Play, Health Connect grant on a real device, Garmin/WHOOP/Oura/Strava OAuth, production keystore.
