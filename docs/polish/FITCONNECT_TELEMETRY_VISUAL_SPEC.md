# FitConnect Telemetry Visual Spec

**Applies to:** Web UI components with telemetry surfaces  
**Status:** DOCUMENTED — partial implementation in `lib/theme/elite-tokens.ts`

## Zone Colors (Canonical)

| Zone | Color | Token | Use |
|------|-------|-------|-----|
| Zone 1 | `#5B8DEF` | cool/recovery | Rest, recovery |
| Zone 2 | `#2DD4BF` | green | Aerobic base |
| Zone 3 | `#F5B844` | amber | Tempo |
| Zone 4 | `#FF8C42` | orange | Threshold |
| Zone 5 | `#FF5470` | crimson | Max effort |

```ts
// lib/theme/elite-tokens.ts
export const TELEMETRY_ZONES = {
  zone1: "#5B8DEF",
  zone2: "#2DD4BF",
  zone3: "#F5B844",
  zone4: "#FF8C42",
  zone5: "#FF5470"
};
```

## Display Rules

1. Always show **numeric value + label + zone**
2. Never use color as the only signal
3. User accent theme must not override zone semantics
4. Live updates: small, fast transitions (≤120ms)

## Existing Components

- `components/ui-glass/hr-ribbon.tsx` — HR visualization
- `components/ui-glass/readiness-ring.tsx` — readiness score
- `components/loops/live-session/live-metrics.tsx` — session metrics

## GPS Source Documentation

| Source | Status in Web Repo |
|--------|-------------------|
| Real GPS | Not implemented |
| Emulator GPS | N/A (web) |
| Simulated | `lib/realtime/synthetic.test.ts` |
| Local Demo | Live session loops use fixtures |

**GPS_SOURCE:** Not applicable for web PWA in current build.

## Map (Planned)

- Dark, minimal base
- Voltline route accent `#C8FF00`
- Intensity sections use zone semantic colors
- Glass bottom sheet for overlays

**Status:** No map component in current web polish pass.
