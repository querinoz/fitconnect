# Phase 08 — Provider Capability Matrix

Declared via `ProviderCapabilities`, registered in `CapabilityRegistry`, queried at runtime (`canRead`, `providersFor`). No feature assumes any provider supports any metric.

| Capability | Health Connect | Garmin | WHOOP | Oura | Fitbit | Polar | Samsung Health | Strava |
|---|---|---|---|---|---|---|---|---|
| Heart rate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Resting HR | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |
| HRV | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| Sleep | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Steps | ✅ | ✅ | — | ✅ | ✅ | — | ✅ | — |
| Calories | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Distance | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | ✅ |
| Elevation | ✅ | ✅ | — | — | — | — | — | ✅ |
| Power | ✅ | ✅ | — | — | — | — | — | ✅ |
| Cadence | ✅ | ✅ | — | — | — | ✅ | — | ✅ |
| Speed | ✅ | ✅ | — | — | — | ✅ | — | ✅ |
| Respiratory rate | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| SpO2 | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — |
| Body temperature | ✅ | — | ✅ | ✅ | — | — | — | — |
| Weight | ✅ | — | — | — | ✅ | — | ✅ | — |
| Body composition | ✅ | — | — | — | — | — | ✅ | — |
| Blood pressure | ✅ | — | — | — | — | — | — | — |
| Stress | — | ✅ | ✅ | — | — | — | ✅ | — |
| Recovery | — | — | ✅ | ✅ | — | ✅ | — | — |
| Readiness | — | — | — | ✅ | — | — | — | — |
| Training load | — | ✅ | ✅ | — | — | ✅ | — | — |
| VO2 max | ✅ | ✅ | — | — | — | — | — | — |
| Workout import | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| GPS | ✅ | ✅ | — | — | — | ✅ | — | ✅ |
| Historical data | ✅ (30d) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Background sync | ✅ | ✅ | — | — | — | — | ✅ | — |
| Write | workout, weight | — | — | — | — | — | — | — |
| Deletion | ✅ | — | — | — | — | — | — | — |
| Rate limit/h | — | 100 | 60 | 60 | 150 | — | — | 100 |

Matrix values mirror each vendor's public API surface; they are declarations in adapter code and adjust per-adapter when real SDKs land.
