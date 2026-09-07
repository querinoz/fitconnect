# FitConnect — Surface system (D4 + neu-glass)

Floor is always `#070B14` (never `#090402`).

## Elevation ladder (web + legacy glass)

| Level | Token | Use |
| ----- | ----- | --- |
| 0 Atmosphere | FLOOR | Screen |
| 1 Carbon | CARBON | Nav pill |
| 2 Surface | SURFACE / CONTAINER | Solid cards |
| 3 Glass L2 | `EliteGlass.L2` + highlight | Elevated cards |
| 4 Glass L4 | `EliteGlass.L4` | Bottom sheets |
| 5 Glass L5 | scrim | Modals |
| 6 Telemetry | high contrast, no blur | Live metrics |

Glass L2 opacity **equals** `OPACITY.glass` (0.72). Inner highlight uses `onSurface` at `GLASS.highlight` — not white hex.

**No fullscreen blur.** `blurL3–L5` exist as tokens for localized overlay later. D4 ships highlight + translucency only.

## Neu-glass (Android athlete, 2026-09)

Canonical spec: [ELITE_OS_NEU_GLASS.md](./ELITE_OS_NEU_GLASS.md)

| Layer | Role | Primitive |
|-------|------|-----------|
| **Neumorphic** | Anchored data (metrics, lists, route cards) | `EosNeumorphic`, `EosPremiumCard`, `EosPremiumWell` |
| **Glass** | Floating chrome (nav, FAB, badges) | `EosGlassSurface`, `EosGlassBadge` |

| Rule | Detail |
|------|--------|
| Neumorphic surface | `#0D1321`, 20dp radius, dual shadow |
| Glass fill / border | `rgba(255,255,255,0.06–0.08)` / `0.12–0.14` |
| Blur budget | ≤2 visible blur layers per screen |
| Voltline hero | One semantic hero per screen |
| Destructive | Plain text only (no glass/neumorphic) |

Neumorphism on Android is **not** limited to circular Prime instruments anymore — it applies to anchored data cards across athlete surfaces. Do not use neumorphic chrome for navigation or FABs.

Legacy `EliteGlassCard` in the design catalog remains for reference; athlete surfaces use `EosGlassSurface`.
