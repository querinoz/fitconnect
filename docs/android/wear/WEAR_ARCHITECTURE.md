# Wear architecture

```
Watch (Health Services when AVAILABLE)
    MessageClient /telemetry/live  (telemetry.v1)
Phone WearableListenerService
    WearTelemetryInbox (idempotent sequence)
    LiveSessionCoordinator → LiveActivityEngine (same sessionId)
Athlete UI  EliteRouteMap / share card
Coach UI    LIVE SQUAD  (location only if COACH_SHARING + LOCATION)
Health Connect  historical, below live Wear HR
External vendors  WearableDataSource PENDING_HUMAN
```

## Session state

IDLE → READY → COUNTDOWN → ACTIVE → PAUSED → RESUMING → FINISHING → COMPLETED

`LiveActivityEngine.start()` still jumps IDLE→RUNNING for tests and skip-countdown.

## Source labels

| Kind | Meaning |
|---|---|
| LOCAL_DEMO | In-process QA route / sine HR |
| TEST_FIXTURE | Deterministic inject (emulator geo / unit test) |
| EMULATED_SENSOR | Platform emulator, not a body sensor |
| REAL_SENSOR | Hardware — never assigned from simulation |
| HEALTH_CONNECT | Interop store, not live BPM |

## Battery

Outdoor simulated ticks 1 Hz. Production LIVE GPS should use BALANCED + foreground service (not bound in this cycle). Pause stops ticks. No busy loops besides 1 s `delay`.

## iOS

Architecturally ready via `:shared`. Not implemented.
