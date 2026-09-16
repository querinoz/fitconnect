# Zenith Design Language — cross-surface contract

Shared **concepts** (platforms implement natively):

| Concept | Web | Android Compose | Wear OS |
|---------|-----|-----------------|---------|
| Floor / Voltline / Iris / Telemetry | `--eos-*` / design-tokens | `EliteSurfaceColors` | `WearTheme` / `rememberEliteWearColorScheme` |
| Motion intent | `MOTION_TOKENS` + `elite-*` presets | Compose springs | Ambient-safe, minimal motion |
| Telemetry honesty | `TelemetryCard` / `datumFromScore` | `MetricAvailability` | `WearMetricRing` + readiness sources |
| Device states | `DeviceStatusBadge` | `ProviderConnectionState` / `ConnectionState` | companion link labels |
| Primary nav | Feed · Ascend · TRAIN · Dashboard · Profile | Athlete scaffold destinations | Glance panes (workout / HR / readiness) |

Not shared as code: React DOM, Tailwind classnames, or 21st TSX on mobile.
