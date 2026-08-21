# FitConnect Design System — Voltline OS (Unified)

> **Single source of truth** for visual identity across web, mobile, and marketing.  
> Supersedes duplicated Voltline / Elite OS docs. Last updated: 2026-08-06.

## Canonical stack

| Layer | Location | Consumption |
|-------|----------|-------------|
| CSS variables | `apps/web/app/elite-os.css` | Web components, Tailwind `eos.*` |
| FC aliases | `packages/design-tokens/tokens.css` | Legacy `--volt-*` / `--fc-*` shims |
| JS tokens | `packages/design-tokens/index.ts` → `COLOR_TOKENS` | Mobile, Recharts, programmatic |
| Web helpers | `apps/web/lib/design-system/tokens.ts` | Radius, spacing, typography (re-exports colors) |
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

## Typography

| Role | Family | Tailwind / class |
|------|--------|------------------|
| Display | Syne | `font-display` |
| Body | Plus Jakarta Sans | `font-sans` |
| Metrics / labels | JetBrains Mono | `font-mono`, `.eos-label-caps` |

## Components

| Library | Path | Status |
|---------|------|--------|
| **Elite OS (preferred)** | `components/elite-os/` | BentoCard, EliteButton, decorators |
| ui-glass (legacy) | `components/ui-glass/` | Shim — migrate on touch |
| Shell | `components/shell/elite/` | Authenticated app chrome |

## Rules

1. **Zero hex in new components** — use `var(--eos-*)` or `COLOR_TOKENS`.
2. **Dark-first** — light mode optional; glass on light needs `bg-white/80+`.
3. **Motion** — see [design/ELITE_OS_MOTION_LANGUAGE.md](./design/ELITE_OS_MOTION_LANGUAGE.md); respect `data-motion="reduced"`.
4. **i18n** — new copy → `apps/web/lib/i18n/types.ts` + 6 locales.

## Migration

Run token audit:

```bash
node scripts/codemod-tokens.mjs --report
node scripts/codemod-tokens.mjs --dry-run
```

## Related docs

- [design/ELITE_OS_MOTION_LANGUAGE.md](./design/ELITE_OS_MOTION_LANGUAGE.md)
- [archive/docs-root/art-direction.md](./archive/docs-root/art-direction.md) (HISTORICAL)
- [ADR-002 Token format](./adr/ADR-002-token-format.md)
- [ADR-003 Stack modernization](./adr/ADR-003-stack-modernization.md)
