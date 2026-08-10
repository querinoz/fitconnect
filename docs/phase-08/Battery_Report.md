# Phase 08 — Battery Report

## Policy-first design
`BackgroundSyncPolicy` is a pure, testable domain object; the future WorkManager scheduler in `:app` consumes it rather than embedding constraints in worker code.

Defaults:
- Minimum interval: 60 min (no polling loops; interval enforced in `shouldRun`).
- `requiresBatteryNotLow = true` — never syncs on low battery.
- `respectDoze = true` — scheduled work only (WorkManager honors Doze/App Standby natively; no alarms, no foreground services).
- No realtime streaming is active in this phase; `supportsRealtime` capability exists but no provider declares it yet.

## Anti-drain guarantees
- No continuous polling: sync is user-initiated (Sync now), event-driven (network recovery drain), or scheduled ≥ 60 min.
- Retry storms impossible: max 3 retries with exponential backoff; auth/permission failures short-circuit with zero retries (tested).
- Offline: zero network attempts; requests queue and drain once, on recovery.
- Rate limits declared per provider (capability) so the scheduler can throttle below vendor caps.

## Measured / verified
- `CapabilityAndFacadeTest.backgroundPolicyRespectsBatteryAndInterval`: refuses on low battery, refuses offline, refuses < 60 min since last run, allows otherwise.
- `SyncReport.durationMs` gives per-sync cost accounting; observability counts sync frequency per provider — the inputs needed for on-device battery attribution.

## Deferred (device required, logged as debt)
Battery Historian / `adb bugreport` measurement across Android 13/14/15 once real Health Connect I/O lands.
