# GPS Privacy

## Principles

- Tracking starts only after explicit user Start + location permission.
- Visible foreground notification while recording (“FitConnect · Recording”).
- No hidden background tracking; **no** `ACCESS_BACKGROUND_LOCATION` in this phase.
- Service stops on finish / cancel / irrecoverable failure.
- Route ownership = authenticated `user_id`; RLS on `activity_route_points`.
- Deleting an activity must cascade / remove owned route points (DB FK + delete policy).

## Logging / analytics

**Never log:** latitude, longitude, full route, Firebase tokens, Authorization headers.

Allowed: aggregate counts (`acceptedPoints`, `rejectedPoints`), verdict reasons (`gps_jump`), phase transitions.

## Emulator vs hardware

Emulator `geo fix` / mock provider → labeled `EMULATOR_INJECTED`.
That is **not** proof of physical GPS hardware.
