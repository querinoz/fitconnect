---
name: elite-os-html-mockups
description: Persistent interactive HTML mockups for FitConnect Elite OS (landing + dense web dashboards). Use when designing maquettes that must stay in docs/mockups, use canonical tokens, and never invent social proof. Not for production Next.js routes.
---

# Elite OS HTML mockups

Maquettes live in `docs/mockups/`. They are design contracts, not the production app.

## Rules

1. Tokens only — copy hex from `packages/design-tokens/index.ts` / `elite-os.css`. Floor `#070B14`, Volt `#C8FF00`, telemetry `#3CD7FF`.
2. Type: Syne (display), Plus Jakarta Sans (body), JetBrains Mono (metrics / `SYS.*`).
3. Landing images: real emulator captures from `docs/qa/`. If a shot does not exist, omit the image and mark `⏭️`.
4. No testimonials, ratings, or user counts unless they are true in-repo facts.
5. Label every demo series `LOCAL_DEMO`.
6. Product UI (dashboards): restrained Volt, sidebar not 5-tab bar, keyboard `g h` / `g a` / `/` / `?`.
7. Brand UI (landing): committed Volt, asymmetric hero, no identical 3-card feature grid.
8. Respect `prefers-reduced-motion`. Press scale `0.97`, durations 150–220ms, `ease-out` cubic-bezier(0.23, 1, 0.32, 1).
9. Charts need a text summary (`aria-label` or adjacent copy). Empty / loading / error / offline are first-class.
10. Serve from `docs/` so `../qa/*.png` resolves. Do not invent a second design system in the HTML.
