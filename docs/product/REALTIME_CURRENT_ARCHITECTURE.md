# Realtime — Current Architecture (Wave 2)

**Engineering:** PASS (contract + hub)
**Production delivery:** PENDING_HUMAN (Supabase Realtime env + multi-device proof)

## Transport

| Build | Client |
|-------|--------|
| Live auth (`usesLiveAuth`) | `SupabaseRealtimeClient` (WebSocket) |
| Debuggable | `InProcessRealtimeClient` |
| Release without live auth | `FailClosedRealtimeClient` |

**Forbidden on native Android:** `BroadcastChannel`.

## Canonical product topics

Defined in `ProductRealtimeTopics`:

- `fitconnect:session`
- `fitconnect:booking` — also published from web `publishSessionBooking` (alongside `coach:{id}:bookings`)
- `fitconnect:message` — also published from `publishDirectMessage`
- `fitconnect:activity`

Web may also use role-scoped channels (`coach:{id}:bookings`, `*:messages`) for dashboards. Android product hub subscribes to the `fitconnect:*` topics.

## Codec

`com.fitconnect.shared.realtime.RealtimeEventCodec` encodes/decodes `FitConnectRealtimeEvent` JSON for session/watch/telemetry signals.

## Product hub

`ProductRealtimeHub`:

- connect / subscribe / receive / reconnect status / dedupe / disconnect
- unauthorized when no session and not LOCAL_DEMO
- Wired from Coach Overview (`REALTIME · {state}` chip)

## What is NOT claimed

- Cross-device production delivery without live Supabase credentials
- Stories / presence / typing indicators
- Silent fake live squad packets
