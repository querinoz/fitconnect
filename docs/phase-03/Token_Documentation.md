# Phase 03 — Token Documentation

## Source

| File | Tokens |
|------|--------|
| `packages/design-tokens/index.ts` | `COLOR_TOKENS` |
| `layout.ts` | spacing, radius, elevation, opacity, border |
| `typography.ts` | type scale |
| `semantic.ts` | semantic + chart colour roles |
| `motion.ts` | duration (s) → Kotlin ms |

Regenerate: `pnpm tokens:kotlin` · CI: `pnpm tokens:kotlin:check`

## Kotlin objects (`:design`)

`EliteSurfaceColors` · `EliteSurfaceSpacing` · `EliteSurfaceRadius` · `EliteSurfaceElevation` · `EliteSurfaceOpacity` · `EliteSurfaceBorder` · `EliteSurfaceMotion` · `EliteSurfaceType` · `EliteSurfaceSemantic` · `EliteSurfaceCharts`

## Compose accessors (`:design-ui`)

`EliteSpace` · `EliteRadius` · `EliteElevation` · `EliteOpacity` · `EliteBorder` · `Long.toColor()`

## Palette (unchanged hues)

Voltline `#C8FF00` · Connect `#00DDB4` · Telemetry `#3CD7FF` · Iris `#6C63FF` · Floor `#070B14` · Performance / Recovery / Alert semantics preserved.
