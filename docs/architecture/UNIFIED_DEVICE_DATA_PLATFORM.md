# Unified Device / Data Platform (V10.1)

## Pipeline
```
DEVICE CONNECTORS → NORMALIZATION → UNIFIED METRICS → EVENT STREAM → CONTEXT ENGINE
```

## Contract (`DeviceAdapter`)
connect · disconnect · authorize · sync · getCapabilities · getStatus · subscribe? · fetchHistory? · getLatestMetrics · handleError

## Honesty
- Default registry status: `NOT_CONNECTED`
- Conflict resolution records rejected sample + reason
- Freshness: LIVE / RECENT / STALE / UNKNOWN
- Strava constraints enforced (non-shareable)

## API
`GET/POST /api/v1/devices/status` — POST requires `confirm:true`
