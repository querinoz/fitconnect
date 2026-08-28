# Visual / Motion / Accessibility / Performance QA

**Date:** 2026-08-28  
**Verdict:** PARTIAL PASS (static HTTP checks; no browser MCP)

## Visual

| Route | HTTP | `<main>` | EOS tokens |
|-------|------|----------|------------|
| `/` | 200 | yes | yes |
| `/community` | 200 | yes | yes |
| `/dashboard` | 200 | client shell | deferred |
| `/coach/dashboard` | 200 | client shell | deferred |

**Tool:** `scripts/qa-web-static.mjs` → `WEB_STATIC_QA_PASS`

## Motion

| Check | Result |
|-------|--------|
| `elite-os.css` `prefers-reduced-motion` | PASS |
| `lib/motion/should-reduce-motion.test.ts` | 7/7 PASS |
| `lib/motion/elite-motion.test.ts` | 4/4 PASS |

## Accessibility

| Check | Result |
|-------|--------|
| Marketing routes `<main>` landmark | PASS |
| Component a11y tests (existing) | PASS in vitest suite |
| Full axe audit | NOT RUN (no browser MCP) |

## Performance

| Check | Result |
|-------|--------|
| Smoke 14/14 routes | PASS |
| LCP / Lighthouse | NOT RUN |

## Residual

- Dashboard shells hydrate client-side — SSR HTML lacks `<main>`; acceptable for SPA shells.
- Browser MCP visual regression still requires human or Playwright screenshot baseline.
