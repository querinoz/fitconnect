# Watch ↔ mobile sync (Wear Data Layer)

Data Layer is **device-to-device only**. Backend remains system of record for cloud.

## Capability

Name: `fitconnect_telemetry` (`WearPaths.CAPABILITY`)

Both `:app` and `:wear` call `CapabilityClient.addLocalCapability` on start.

`GmsWearCompanion.state()`:

| Remote nodes | State |
|---|---|
| FILTER_REACHABLE non-empty (excluding local) | CONNECTED |
| FILTER_ALL non-empty, none reachable | PAIRED |
| none | NOT_PAIRED |

A Bluetooth-paired watch **without** the FitConnect Wear app advertising this capability is **NOT_PAIRED**.

## Paths (`telemetry.v1` / `session.v1`)

| Path | Direction | Payload |
|---|---|---|
| `/telemetry/live` | watch → phone | `TelemetryEnvelope.toWire()` |
| `/telemetry/batch` | watch → phone | same schema |
| `/session/state` | phone → watch | outbox session events |
| `/session/control` | phone → watch | `SessionControlCommand` START/PAUSE/RESUME/END |
| `/sync/status` | phone → watch | empty ping |
| `/watch/status` | reserved | — |

## Pairing UX

FitConnect does not invent QR pairing. **PAIR WATCH** / **UNPAIR** open system Bluetooth settings. Companion Device Manager association is not claimed.

## Evidence vs hardware

| Path | Evidence |
|---|---|
| Envelope round-trip + dedupe | unit tests (`SharedDomainTest`, `WearPipelineTest`) |
| GMS send/receive on device | PENDING_HUMAN (no Wear AVD; phone emulator blocked: no hypervisor) |
| Empty node = NOT_PAIRED | `NoWearCompanion` + GMS catch → NOT_PAIRED |
