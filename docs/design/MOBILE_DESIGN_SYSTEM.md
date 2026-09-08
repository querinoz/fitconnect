# FitConnect Mobile Design System — Zenith (Path A)

**Canonical redesign rules:** [MOBILE_REDESIGN_SYSTEM.md](./MOBILE_REDESIGN_SYSTEM.md)  
**Neu-glass:** [ELITE_OS_NEU_GLASS.md](./ELITE_OS_NEU_GLASS.md)  
**Date:** 2026-09-08  
**Surfaces:** Android `design-ui` · SwiftUI `iosApp/FitConnect/Design`

## Brand

| Token | Hex | Role |
|-------|-----|------|
| Floor | `#070B14` | Layer 0 |
| Voltline | `#C8FF00` | Primary CTA / active |
| Iris | `#6C63FF` | Secondary depth |
| Telemetry | `#3CD7FF` | Live metrics |
| Alert | `#FF3A5C` | Errors |

Logo + wordmark FitConnect — never replace.

## Composition languages

| Language | Use |
|----------|-----|
| Honeycomb | Atmosphere, dividers, hex metrics — thin, low opacity |
| Glass | Nav, overlays, floating chrome (≤2 blur layers/screen) |
| Neumorphism | Selective controls / readiness wells |
| Bento | Home, analysis, coach dashboard KPIs |

## Component library (minimum)

| Component | Android | iOS |
|-----------|---------|-----|
| AppShell / Screen | AthleteScaffold / CoachScaffold | AthleteShell / CoachShell |
| BottomNav + Train FAB | EliteNavigation + EosTrainActionFab | TabView + Train button |
| GlassCard / GlassSurface | EosGlassSurface | GlassCard |
| NeoButton / NeoMetric | EosPremium* / EliteReadinessNeumorphic | NeoControl |
| Bento / Metric | ElitePerformanceCommand | BentoMetric |
| HexMetric / HexProgress / HexBadge | HexMetric.kt + Honeycomb* | HexMetric.swift |
| Session / Workout / Coach / Program cards | Elite* + feature screens | *Card.swift |
| HoneycombBackground | HoneycombAtmosphere | HoneycombBackground |
| Motion tokens | EliteMotionTokens (fast/medium/slow + spring.*) | MotionTokens |

## Motion tokens

| Token | Android | iOS |
|-------|---------|-----|
| motion.fast | 120ms | 0.12s |
| motion.medium | 240ms | 0.24s |
| motion.slow | 400ms | 0.40s |
| spring.soft / standard / strong | SpringSpec | spring response/damping |
| reduced motion | ThemeSettings / Accessibility | accessibilityReduceMotion |

## Do not

- Expo revival / purple primary CTAs / full-screen hex wallpaper / fake HealthKit PASS.
