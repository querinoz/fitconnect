# Android Device Center

In-app location: Athlete **Telemetry** route (`athlete/telemetry`), title **Device Center**.

## FitConnect Watch card

Shows:

- Companion state: `NOT_PAIRED` | `PAIRED` | `CONNECTED` | `SYNCING` (from CapabilityClient, never invented)
- Transport: `DATALAYER_GMS` on device, `IN_MEMORY` in unit tests
- Battery / HR / GPS: **UNAVAILABLE** until a real status packet exists
- Health Connect SDK status (`HealthConnectClient.getSdkStatus`)
- Xiaomi HyperOS: `BLOCKED_EXTERNAL_DEPENDENCY`
- Last Data Layer envelope sequence (or none)
- Outbox pending count

Actions:

| Button | Behavior |
|---|---|
| PAIR WATCH | `Settings.ACTION_BLUETOOTH_SETTINGS` (OS pairing) |
| SYNC NOW | `MessageClient` `/sync/status` to reachable FitConnect nodes; Err if none |
| UNPAIR IN SYSTEM SETTINGS | Bluetooth settings (FitConnect cannot silently unpair the OS bond) |
| DEVICE SETTINGS | app details |

## Providers list

Garmin / Whoop / Health Connect **providers** remain **LOCAL_DEMO fixtures** (`SimulatedProviderSource`). Section title states that. Do not confuse provider CONNECTED with a Wear node.

## Live Activity

`Activity` tab: phone LOCAL_DEMO monitor + **WATCH FEED** card bound to `WearTelemetryInbox.lastEnvelope`. Empty inbox is honest (“No Data Layer packets”).
