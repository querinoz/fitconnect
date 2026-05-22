# FitConnect Design System

## Product Feel

Elite AI-powered athlete operating system.

Inspired by: Linear · WHOOP · Oura · Apple Fitness · Stripe · Vercel

---

## Architecture (Phase 1 — Foundation)

| Layer | Path | Purpose |
|-------|------|---------|
| **CSS tokens** | `apps/web/app/elite-os.css` | Canonical Elite OS variables + utility classes |
| **Legacy bridge** | `apps/web/app/voltline.css` | Voltline aliases (mapped to Elite OS) |
| **Layout tokens** | `apps/web/app/fc-system.css` | Marketing containers, radius helpers |
| **TS tokens** | `apps/web/lib/design-system/tokens.ts` | Programmatic token access |
| **CVA variants** | `apps/web/lib/design-system/variants.ts` | Button, card, input, chip, glass |
| **Primitives** | `apps/web/components/elite-os/` | Reusable UI building blocks |
| **Motion** | `apps/web/lib/motion/elite-motion.ts` | Framer presets (spring, overlay, sheet) |
| **Stitch reference** | `brand-sources/` + external Stitch exports | Source-of-truth design specs |

### Import order (`globals.css`)

```
voltline.css → fc-system.css → elite-os.css
```

---

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| Floor | `#070B14` | App background (Level 0) |
| Carbon | `#111827` | Bento cards (Level 1) |
| Elevated | `#151B2D` | Hover / active cards (Level 2) |
| Iris | `#6C63FF` | Primary brand, focus rings |
| Voltline | `#C8FF00` | Primary CTAs, peak metrics |
| Telemetry | `#3CD7FF` | Data viz, live states |

Tailwind: `bg-eos-floor`, `text-eos-voltline`, `border-eos-iris`, etc.

---

## Typography

| Role | Font | Class |
|------|------|-------|
| Display / Headline | Syne (`--font-display`) | `.eos-display`, `.eos-headline` |
| Body | Plus Jakarta Sans (`--font-sans`) | `.eos-body` |
| Metrics / Labels | JetBrains Mono (`--font-mono`) | `.eos-data-metric`, `.eos-label-caps` |

---

## Radius

| Element | Token | Value |
|---------|-------|-------|
| Nested (tags, inputs) | `--eos-radius-nested` | 12px |
| Buttons | `--eos-radius-control` | 18px |
| Bento cards | `--eos-radius-card` | 24px |
| Modals | `--eos-radius-modal` | 28px |

---

## Spacing (4px base)

- `--eos-stack-sm` 8px · `--eos-stack-md` 16px · `--eos-stack-lg` 24px
- `--eos-gutter` 24px · `--eos-bento-gap` 20px · `--eos-container-margin` 32px

---

## Components (use these — do not duplicate)

```tsx
import {
  BentoCard,
  BentoGrid,
  EliteButton,
  EliteGlass,
  EliteInput,
  EliteChip,
  LabelCaps,
  MetricDisplay,
  AiInsightCard,
  TelemetryShell
} from "@/components/elite-os";
```

---

## Motion

```tsx
import { eliteSpring, eliteModal, eliteSheet, eliteStagger } from "@/lib/motion/elite-motion";
```

---

## Style

- Glassmorphism: `EliteGlass` / `.eos-glass` (6% white, 20px blur)
- Bento grid: `BentoGrid` + `BentoCard`
- Elevation via optical layering, not drop shadows
- Machined inner stroke on all bento cells

---

## Next phases (not in Phase 1)

1. ~~Design System~~ ✅
2. ~~App shell~~ ✅ — `components/shell/elite/`
3. ~~Motion wiring~~ ✅
4. ~~Dashboards~~ ✅
5. **Auth overlays** ✅ — `EliteAuthPanel`, `EliteAuthField`, modal routes
6. Page refactors · mobile · audits

### Auth overlay usage

```tsx
import {
  EliteAuthPanel,
  EliteAuthField,
  EliteAuthAlert,
  EliteAuthRoleToggle
} from "@/components/auth/elite";
```

- **Sign in / sign up:** `AuthShell` + `SignupWizard` on Elite OS glass
- **Intercepting modals:** `@modal/(.)signin`, `(.)signup` with `RouteModal` + `ModalSlot`
- **OAuth row:** Elite bordered provider buttons + `EliteAuthDivider`

### Dashboard usage

Athlete and coach routes render `AthleteOsDashboard` / `CoachOsDashboard` with:
- `BentoCard` / `BentoGrid` layout (Stitch 12-column)
- `EliteStatTile` KPI row (coach)
- `EliteBentoMotion` staggered section entrance
- `useInEliteShell()` — hides legacy `DesktopSidebar` when `EliteAppShell` is active

### Motion usage

```tsx
import { useEliteMotion } from "@/lib/motion/use-elite-motion";
import {
  eliteFadeUp,
  eliteModal,
  eliteSheet,
  eliteOverlay,
  muteEliteMotion
} from "@/lib/motion/elite-motion";
```

- **Route modals:** `RouteModal` + `ModalSlot` in root layout (`AnimatePresence` exit)
- **App routes:** `EliteRouteTransition` / `PageTransition`
- **Shell drawer:** mobile overlay fade via `eliteOverlay`
- **Reduced motion:** `useEliteMotion().mute(preset)` or `muteEliteMotion(preset, reduced)`

### App shell usage

```tsx
import {
  EliteAppShell,
  ShellMain,
  ShellWorkspace,
  ShellSidebar,
  ShellContentGrid
} from "@/components/shell/elite";
```
