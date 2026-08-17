# Telemetry pipeline

## Canonical path

```
WATCH SENSOR
      ↓  Health Services (probe; UNAVAILABLE unless capabilities exist)
Wear Telemetry Adapter
      ↓  TelemetryEnvelope telemetry.v1
Local Watch OutboxQueue
      ↓  MessageClient /telemetry/live  (queued if no remote node)
Phone WearableListenerService
      ↓  WearTelemetryInbox (SequenceDeduper)
Mobile dashboard (WATCH FEED)
      ↓  RealtimeClient (string transport; typed events in :shared)
Backend persistence (not Data Layer)
```

## Labels (never upgrade)

| Kind | Meaning |
|---|---|
| `REAL_SENSOR` | Hardware sample with Health Services AVAILABLE |
| `EMULATED_SENSOR` | Emulator sensor path |
| `TEST_FIXTURE` | Unit-test envelopes |
| `LOCAL_DEMO` | `LiveActivityEngine` sine HR / simulated distance |
| `HEALTH_CONNECT` | Interoperability layer, not a live sensor |

Phone Activity screen still runs `LiveActivityEngine` labeled **LOCAL_DEMO**. That is a phone demo monitor, not Wear HR.

Watch UI shows **HR UNAVAILABLE** when Health Services does not report AVAILABLE. Simulated engine BPM is **not** copied onto the wire as AVAILABLE.

## Duplicate / offline

- Watch `OutboxQueue`: enqueue by `sequenceNumber`; ACK removes; fail increments retry.
- Phone `WearTelemetryInbox`: first sequence ACCEPTED, replay DUPLICATE.
- Empty reachable FitConnect capability → packets stay queued (`pendingCount`).

## Realtime

`FitConnectRealtimeEvent` lives in `:shared`. Android `RealtimeClient` is still `Flow<String>`:

| Impl | When | Class |
|---|---|---|
| Supabase | live auth credentials | PARTIAL |
| InProcess | debug | LOCAL_DEMO |
| FailClosed | release without secrets | NO-OP |

Do not claim cloud realtime without production secrets.

## Health Connect precedence

1. Wear HR during ACTIVE exercise (Health Services AVAILABLE)
2. Phone passive (not implemented)
3. Health Connect historical (SDK + permission; this build does not read records)
4. LOCAL_DEMO fixtures (Device Center provider list)

`AndroidHealthDataRepository.latestHeartRate()` returns `bpm = null`. SDK_AVAILABLE is **not** a reading. Missing permission → `PERMISSION_DENIED`, not `0`.
