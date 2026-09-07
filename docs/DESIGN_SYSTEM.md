# FitConnect Design System — Elite OS (canonical)

> **Single source of truth** for visual identity across web, Android Compose, and marketing.
> Last updated: **2026-09-01** (neu-glass Android athlete surfaces, chart palette, typography mapping).

## Canonical stack

| Layer | Location | Consumption |
|-------|----------|-------------|
| CSS variables | `apps/web/app/elite-os.css` | Web components, Tailwind `eos.*` |
| FC aliases | `packages/design-tokens/tokens.css` | Legacy `--volt-*` / `--fc-*` shims |
| JS tokens | `packages/design-tokens/index.ts` → `COLOR_TOKENS`, `CHART_TOKENS` | Web, Recharts, programmatic |
| Web helpers | `apps/web/lib/design-system/tokens.ts` | Radius, spacing, typography (re-exports colors) |
| Kotlin (generated) | `android/design/.../EliteSurfaceTokens.kt` | Compose via `pnpm tokens:kotlin` |
| Tailwind | `apps/web/tailwind.config.ts` | `eos-*` utilities |

**Import order (web):** `elite-os.css` → `tokens.css` → `globals.css` → `fc-system.css`

See [ADR-001](./adr/ADR-001-token-unification.md) for migration rationale.

## Palette (non-negotiable hues)

| Role | CSS var | Value | Usage |
|------|---------|-------|-------|
| Floor | `--eos-floor` | `#070B14` | Deepest background |
| Primary / CTA | `--eos-voltline` | `#C8FF00` | Athlete identity, peaks, CTAs |
| Trust / links | `--eos-connect` | `#00DDB4` | Integrations, coach trust |
| Live data | `--eos-telemetry` | `#3CD7FF` | Streaming metrics |
| Focus | `--eos-iris` | `#6C63FF` | Rings, focus states (secondary) |
| Good | `--eos-performance` | `#00E090` | Readiness green |
| Warning | `--eos-recovery` | `#FFB020` | Amber strain |
| Alert | `--eos-alert` | `#FF3A5C` | Errors, live stop |

Extend with alpha ramps and gradients — **never replace core hues**.

## Chart palette (2026-09)

Defined in `packages/design-tokens/semantic.ts` (`CHART_TOKENS`). Used on Android Analysis, Achievements, and Train surfaces.

| Role | Key | Hex |
|------|-----|-----|
| Hero | `chartVoltline` | `#C8FF00` |
| Success | `chartSuccess` | `#7ED957` |
| Negative | `chartNegative` | `#E24B4A` |
| Secondary | `chartSecondary` | `#5B9BD1` |
| Muted | `chartMuted` | `#262F47` |
| Axis | `chartAxis` | `#5B6478` |
| Effort zones Z1–Z5 | `chartZone1` … `chartZone5` | see `index.ts` |

Series order for multi-line charts: `CHART_SERIES_ORDER` (max 4 series; 5th → “Other”).

## Typography

| Role | Family | Web | Android Compose |
|------|--------|-----|-----------------|
| Display | Syne | `font-display` | `EliteTypography` display slots |
| Body | Plus Jakarta Sans | `font-sans` | body / title slots |
| Metrics / labels | JetBrains Mono | `font-mono`, `.eos-label-caps` | `EliteSysLabel`, tabular figures |

**Android (wave 6):** all Material3 typography slots map to bundled fonts in `EliteTypography.kt`. Unmapped slots previously fell back to Roboto and caused overlap — do not add ad-hoc `TextStyle` without extending the theme.

## Android neu-glass (athlete surfaces)

**Status:** ENGINEERING COMPLETE (waves 0–6 on `feat/elite-os-v2`).

| Primitive | Path | Use |
|-----------|------|-----|
| `EosGlassSurface` | `android/design-ui/.../neumorphic/EosGlassSurface.kt` | Floating chrome (nav, FAB, badges) |
| `EosNeumorphic` | `android/design-ui/.../neumorphic/EosNeumorphic.kt` | Anchored data cards (do not refactor casually) |
| `EosPremiumCard` / `EosPremiumWell` | design-ui | Neumorphic content |
| `EliteChartPalette` | design-ui/charts | Chart colors from tokens |

Full spec: [design/ELITE_OS_NEU_GLASS.md](./design/ELITE_OS_NEU_GLASS.md)

**Rules:** neumorphic = data; glass = chrome; ≤2 blur layers/screen; one voltline hero/screen; destructive = plain text.

## Components

| Library | Path | Status |
|---------|------|--------|
| **Elite OS (web, preferred)** | `components/elite-os/` | BentoCard, EliteButton, decorators |
| **Android design-ui** | `android/design-ui/` | Neu-glass primitives, charts, catalog |
| ui-glass (legacy) | `components/ui-glass/` | Shim — migrate on touch |
| Shell | `components/shell/elite/` | Authenticated app chrome |

In-app catalog (debug): `fitconnect://app/catalog` → `DesignSystemCatalog.kt`.

## Rules

1. **Zero hex in new components** — use `var(--eos-*)`, `COLOR_TOKENS`, or generated Kotlin tokens.
2. **Dark-first** — light mode optional; glass on light needs `bg-white/80+`.
3. **Motion** — see [design/ELITE_OS_MOTION_LANGUAGE.md](./design/ELITE_OS_MOTION_LANGUAGE.md); respect `data-motion="reduced"`.
4. **i18n** — new copy → `apps/web/lib/i18n/types.ts` + 6 locales.
5. **Athlete IA** — Today · Analysis · Achievements · Profile + Train FAB ([03-ux-m3-expressive.md](./03-ux-m3-expressive.md)).

## Token pipeline

```bash
pnpm tokens:kotlin          # Generate EliteSurfaceTokens.kt
pnpm tokens:kotlin:check    # Drift check (add to CI on token PRs)
```

## Migration

Run token audit:

```bash
node scripts/codemod-tokens.mjs --report
node scripts/codemod-tokens.mjs --dry-run
```

## Related docs

- [design/ELITE_OS_NEU_GLASS.md](./design/ELITE_OS_NEU_GLASS.md) — Android neu-glass waves 0–6
- [design/FITCONNECT_SURFACE_SYSTEM.md](./design/FITCONNECT_SURFACE_SYSTEM.md) — surface ladder
- [design/ELITE_OS_MOTION_LANGUAGE.md](./design/ELITE_OS_MOTION_LANGUAGE.md)
- [ADR-002 Token format](./adr/ADR-002-token-format.md)
- [ADR-003 Stack modernization](./adr/ADR-003-stack-modernization.md)
