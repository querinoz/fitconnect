# Wear sync protocol

Schema: `telemetry.v1` envelopes, `session.v1` control.

## Paths (`WearPaths`)

| Path | Direction | Payload |
|---|---|---|
| `/telemetry/live` | watch → phone | TelemetryEnvelope wire |
| `/telemetry/batch` | watch → phone | same, queued |
| `/session/control` | phone → watch | `v=;op=;sport=` |
| `/session/state` | either | outbox session text |
| `/sync/status` | phone → watch | empty ping |
| `/sync/metrics` `/sync/route` `/sync/health` `/sync/profile` | reserved | not yet populated |

## Ops

START / START_WORKOUT, PAUSE / PAUSE_WORKOUT, RESUME / RESUME_WORKOUT, END / STOP_WORKOUT, SYNC_METRICS.

Aliases normalize on parse.

## Idempotency

- Outbox duplicate sequence numbers ignored
- Inbox `DUPLICATE` if sequence seen
- `WorkoutRegistry` rejects a second `complete(sessionId)`

## Connection states

`NOT_PAIRED | PAIRED | CONNECTING | CONNECTED | SYNCING | OFFLINE | DISCONNECTED | RECONNECTING | ERROR`

CONNECTED **only** when CapabilityClient returns a reachable `fitconnect_telemetry` node that is not the local node.
