# FitConnect — KMP / Wear architecture (as implemented)

**Date:** 2026-08-17  
**Android-first.** Compose Multiplatform is not used. iOS is not implemented.

```
IOS_TARGET_STATUS = ARCHITECTURALLY_READY / NOT_IMPLEMENTED
XIAOMI_SUPPORT    = BLOCKED_EXTERNAL_DEPENDENCY
```

## Why `:shared` is kotlin-jvm, not `multiplatform`

AGP 9.3.1 uses built-in Kotlin. A full `org.jetbrains.kotlin.multiplatform` plugin on this tree risks destabilizing `:app`. `:shared` follows the proven `:design` pattern: **kotlin-jvm, zero Android APIs**. That is the extractable `commonMain` surface.

Physiology (NP / TSS / zones) stays in **elite-core Rust** (ADR-006). `:shared` does **not** reimplement those formulas.

## Modules

```
android/
  shared/          kotlin-jvm — session SM, HeartRate, envelopes, outbox, Wear paths, realtime events
  telemetry/       Android adapters — GMS Data Layer, Health Connect probe, Device Center, inbox
  core-capture/    LiveActivityEngine LOCAL_DEMO + envelope mapping
  wear/            Wear Compose UI + Health Services probe + MessageClient sender
  app/             Phone host + WearableListenerService + capability advertise
  design + design-ui  Elite Surface (unchanged identity)
  foundation       Auth + RealtimeClient (string transport)
```

## Shared contracts (no Android types)

| Type | Role |
|---|---|
| `ActivitySession` / `ActivitySessionMachine` | IDLE → ACTIVE → PAUSED → ENDING → COMPLETED |
| `HeartRate` | `bpm` null when unavailable — never `0` |
| `TelemetryEnvelope` | `telemetry.v1` wire format |
| `OutboxQueue` / `SequenceDeduper` | offline queue + replay window |
| `WearPaths` | `/telemetry/live`, `/telemetry/batch`, `/session/*`, `/sync/status` |
| `FitConnectRealtimeEvent` | typed events for Android / Wear / future iOS / web |
| `DataSourceKind` | REAL_SENSOR / EMULATED_SENSOR / TEST_FIXTURE / LOCAL_DEMO / HEALTH_CONNECT |

## Android-only (must stay)

Jetpack Compose, Wear Compose, Health Connect client, Health Services, Wear Data Layer, FCM, permissions, lifecycle, BLE, foreground services.

## Source of truth

| Layer | Owns |
|---|---|
| Watch | high-frequency acquisition when Health Services reports AVAILABLE |
| Mobile | UX, local cache, Device Center |
| Backend | cloud persistence (not Data Layer) |
| Health Connect | Android interoperability (historical), **below** live Wear HR |

## What this cycle did **not** do

- No `ios()` Gradle target
- No Compose Multiplatform
- No fake Xiaomi BLE
- No fabricated Health Services HR
- No Play Console / production unlock
