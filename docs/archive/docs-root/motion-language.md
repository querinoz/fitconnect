# FitConnect Motion Language — Voltline OS v2

> Catalog of motion patterns, timings, and fallbacks. All new animation must comply.

## Global policy

- Respect `prefers-reduced-motion: reduce` **and** `html[data-motion="reduced"]`.
- Animate **only** `transform` and `opacity` (no layout thrash).
- One scroll engine: **Lenis** synced to **GSAP ScrollTrigger** via `scrollerProxy`.
- Single GSAP context per page — register plugins once in `lib/motion/gsap-register.ts`.

## Duration tokens

| Token | Value | Use |
|-------|-------|-----|
| `--fc-motion-micro` / `--eos-duration-micro` | 150ms | Hover, press |
| `--fc-motion-ui` / `--eos-duration-ui` | 220ms | Panels, tabs |
| `--fc-motion-screen` / `--eos-duration-screen` | 400ms | Route, modal |
| `--fc-motion-data` / `--eos-duration-data` | 1200ms | Rings, counters, live pulse |

**Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (`--fc-ease-kinetic`)

## Landing narrative (9 acts)

| Act | Section | Motion pattern | Fallback (reduced) |
|-----|---------|----------------|-------------------|
| I | Hero gate | Progress bar + logo fade | Skip gate (`shouldReduceMotion`) |
| II | Hero cinematic | SplitText char reveal, pinned shrink | Static headline visible |
| III | Trust strip | Velocity-linked marquee | Static logos |
| IV | Section breaks | Horizontal scrub typography | Static words |
| V | Coach reel | Pinned horizontal filmstrip | Vertical stack |
| VI | Pull quotes | Word scrub color | Full quote visible |
| VII | Feature manifesto | Sticky left / scroll right | Stacked layout |
| VIII | Science | SVG path draw | Static diagram |
| IX | Final CTA | Aurora breathe | Static gradient |

**Current production:** Acts I–II partial (`hero-gate.tsx`, `hero-elite-os.tsx`); Acts III–IX use `landing-v2/*` with Lenis + lazy sections.

## Web app

- Readiness ring: interpolated score changes (no jump).
- Route transitions: View Transitions API where supported.
- Command palette: 220ms enter/exit.
- Bento hover: `--eos-duration-ui`, border glow only.

## Mobile

- Tab indicator: Reanimated spring.
- Haptics: `expo-haptics` on primary actions.
- Pull-to-refresh: custom volt ring (planned Skia).

## Testing

```bash
pnpm test:e2e --grep @elite-os
# Always verify with reduced motion in same pass
```

## Implementation files

- `apps/web/lib/motion/gsap-register.ts`
- `apps/web/lib/motion/lenis-provider.tsx`
- `apps/web/lib/motion/should-reduce-motion.ts`
- `apps/web/hooks/use-split-text-reveal.ts`
- `packages/design-tokens/src/motion-policy.ts`
