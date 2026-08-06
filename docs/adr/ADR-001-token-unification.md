# ADR-001 — Design System Token Unification

**Date:** 2026-08-06
**Status:** Accepted
**Author:** Claude Sonnet 4.6 (Voltline OS v2 session)

## Context

The FitConnect codebase had two competing design systems in active use:

| System | Files | Namespace | Components |
|--------|-------|-----------|------------|
| **Voltline** | `globals.css`, `packages/design-tokens/tokens.css` | `--volt-*`, `--fc-*` | `components/ui-glass/` (17 files) |
| **Elite OS** | `apps/web/app/elite-os.css` | `--eos-*` | `components/elite-os/` (9 files) |

Both systems were partially implemented. Commit `15a3ce5` attempted unification ("Unify marketing and app surfaces under Elite OS visual system") but left Voltline components active in marketing routes. Bridges existed (`--volt-500: var(--eos-voltline)` in `elite-os.css:77`) but were incomplete.

The mobile app (`packages/config/src/tokens.ts`) hardcoded hex values (`"#c8ff00"`, `"#6c63ff"`) with no reference to either system.

## Decision

**Elite OS (`--eos-*`) is the single canonical token namespace.** Voltline identifiers are preserved as backward-compat aliases that point to EOS vars.

Rationale:
- EOS is the most recently structured system (commit `15a3ce5`, 541-line `elite-os.css`)
- EOS already covers all authenticated app surfaces (dashboards, shell, modals)
- The Voltline soul is preserved: `--eos-voltline: #c8ff00` is the primary accent; `--eos-connect: #00ddb4` is the trust/telemetry secondary; `--eos-iris: #6c63ff` is the interactive/focus accent
- Iris is NOT promoted — it remains secondary. Volt dominates.

## Implementation

### CSS layer
- `apps/web/app/elite-os.css` — canonical source, `--eos-*` vars with raw hex only here
- `packages/design-tokens/tokens.css` — converted to `var(--eos-*)` aliases; zero raw hex
- `apps/web/app/globals.css` — role aliases (`--bg`, `--accent`, etc.) point to `var(--eos-*)`

### Cross-platform JS layer
- `packages/design-tokens/index.ts` — exports `COLOR_TOKENS as const` mirroring EOS `:root {}` values
- `packages/config/src/tokens.ts` — mobile token bridge now derives from `COLOR_TOKENS`
- `apps/mobile/lib/tokens.ts` — unchanged (re-exports from config)

### Components
- `components/ui-glass/` — kept as compatibility shims; new work uses `components/elite-os/`
- Recharts: shared `apps/web/lib/charts/recharts-theme.ts` (updated to use `COLOR_TOKENS`)
- SVG gradients: use `style={{ stopColor: "var(--eos-voltline)" }}` pattern

## Colour palette (unchanged hues)

| Role | Token | Value |
|------|-------|-------|
| Primary CTA / athlete | `--eos-voltline` | `#c8ff00` |
| Trust / telemetry / coach | `--eos-connect` | `#00ddb4` |
| Interactive / focus | `--eos-iris` | `#6c63ff` |
| Live data / integrations | `--eos-telemetry` | `#3cd7ff` |
| Floor / deepest bg | `--eos-floor` | `#070b14` |
| Good / performance | `--eos-performance` | `#00e090` |
| Warning / recovery | `--eos-recovery` | `#ffb020` |
| Alert / danger | `--eos-alert` | `#ff3a5c` |

## Exemptions (documented raw hex — do not tokenize)

| File | Hex | Reason |
|------|-----|--------|
| `components/lang-picker.tsx` | Flag colours | Real national brand colours, must be exact |
| `components/marketing/*-frame.tsx` | Device greys | Decorative product mockups |
| `components/dashboard/strava-activity-map.tsx` | `#FC5200` | Strava brand orange (external brand) |
| `components/marketing/atmosphere.tsx` | `#ff6480` | Decorative particle tint with no semantic role |
| `components/celebration-ribbon.tsx` | Confetti palette | Pure decorative motion element |

## Consequences

- Any future colour change must be made in `elite-os.css` `:root {}` AND `COLOR_TOKENS` in `packages/design-tokens/index.ts`
- New components must use `var(--eos-*)` CSS vars or `COLOR_TOKENS` (JS/TS) — no raw hex
- `ui-glass/` components can be gradually migrated to `elite-os/` equivalents in Phase 4+
