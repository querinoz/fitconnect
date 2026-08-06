# ADR-002 — Token Format and Authoring Rules

**Date:** 2026-08-06
**Status:** Accepted
**Author:** Claude Sonnet 4.6 (Voltline OS v2 session)

## Context

After token unification (see ADR-001), the project needs a clear rule for where to define tokens, what format they take, and how platforms consume them.

## Decision

### Authoring layers (in priority order)

1. **`apps/web/app/elite-os.css` — raw values (one place only)**
   ```css
   --eos-voltline: #c8ff00;   /* raw hex only here */
   ```

2. **`packages/design-tokens/index.ts` — JS mirror (`COLOR_TOKENS`)**
   ```ts
   export const COLOR_TOKENS = {
     voltline: "#c8ff00",  /* must stay in sync with elite-os.css */
   } as const;
   ```

3. **`packages/design-tokens/tokens.css` — CSS aliases (no raw hex)**
   ```css
   --fc-volt: var(--eos-voltline);  /* alias only */
   ```

4. **`packages/config/src/tokens.ts` — mobile bridge (derives from COLOR_TOKENS)**
   ```ts
   import { COLOR_TOKENS } from "@fitconnect/design-tokens";
   export const tokens = { colors: { brand: { 500: COLOR_TOKENS.voltline } } };
   ```

### Consumption rules

| Context | Use |
|---------|-----|
| Web CSS/Tailwind class | `var(--eos-voltline)` or `bg-eos-voltline` |
| Web inline style / JS | `"var(--eos-voltline)"` (CSS var string) |
| SVG stop/fill attribute | `style={{ stopColor: "var(--eos-voltline)" }}` |
| Recharts / charting libs | `rechartsTheme.*` from `lib/charts/recharts-theme.ts` |
| React Native StyleSheet | `tokens.colors.brand[500]` from `@fitconnect/config/tokens` |
| New cross-platform util | `COLOR_TOKENS.voltline` from `@fitconnect/design-tokens` |

### Forbidden patterns

```ts
// ❌ Never
style={{ color: "#c8ff00" }}
fill="#00ddb4"
const VOLT = "#c8ff00"

// ✅ Always
style={{ color: "var(--eos-voltline)" }}
fill={rechartsTheme.load}
const VOLT = COLOR_TOKENS.voltline
```

### Exemptions (see ADR-001 for full list)
National flag colours, external brand colours (Strava `#FC5200`), and purely decorative animation palettes are exempt from tokenization. Any new exemption requires a `/* decorative: <reason> */` comment.

## Scroll layer decision (recorded here for completeness)

**Lenis** is the canonical smooth-scroll implementation. `apps/web/lib/motion/lenis-provider.tsx` is the integration point. ScrollSmoother (GSAP) is explicitly rejected — both modify the scroll pipeline and cannot coexist.

## Motion tokens

Motion timing and easing are defined in `packages/design-tokens/motion.ts` (`MOTION_TOKENS`) and mirrored as CSS vars in `elite-os.css` Section 6 (`--eos-duration-*`). The same values apply web and mobile.

## Sync protocol

When a colour value in `elite-os.css` changes:
1. Update the matching key in `COLOR_TOKENS` (`packages/design-tokens/index.ts`)
2. Run `pnpm typecheck` to confirm no type breakage
3. Run `pnpm test` (Vitest) — visual regression screenshots will catch unintended drifts
