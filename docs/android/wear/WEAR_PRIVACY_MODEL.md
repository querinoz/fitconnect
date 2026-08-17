# Privacy model

Location and live HR are sensitive.

## Rules

1. No silent athlete location sharing to coaches.
2. `TelemetryPrivacyManager.shareWithCoach` requires `actorId == athleteId`.
3. Coach LIVE SQUAD map reads `MetricType.LOCATION` via `coachMayRead`. Default: denied → copy “Location sharing off”.
4. Delete/export: existing provider deletion + `ActivityExportPayload` (OAuth not performed).
5. Runtime location permission is requested by feature, not at process start (manifest still declares fine/coarse).
6. Auth screens may use `FLAG_SECURE` — emulator screencap of identity can be black by design.

## Error / source states

Connection: CONNECTED, CONNECTING, RECONNECTING, OFFLINE, ERROR, DISCONNECTED, NOT_PAIRED, PAIRED, SYNCING.  
Data: AVAILABLE, UNAVAILABLE, PERMISSION_DENIED / PERMISSION_REQUIRED, SYNCING, FAILED, UNSUPPORTED.
