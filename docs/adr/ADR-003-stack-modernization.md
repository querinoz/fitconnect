# ADR-003 — Stack Modernization (Voltline OS v2)

**Date:** 2026-08-06  
**Status:** Proposed (phased)  
**Author:** FitConnect engineering

## Context

The Voltline OS v2 mega-prompt targets Next 15+, React 19, Tailwind v4, Motion package, GSAP ScrollSmoother, Skia mobile, etc. Current production stack is stable on Next 14 / React 18 / Tailwind 3.

## Decision — phased adoption

| Upgrade | Current | Target | Phase | Verdict |
|---------|---------|--------|-------|---------|
| Next.js | 14.2 | 15+ | P2 | **Defer** — PPR eval after token unification |
| React | 18.3 | 19 | P2 | **Defer** — with Next major |
| Tailwind | 3.4 | 4 | P2 | **Defer** — migrate `@theme` when EOS stable |
| framer-motion → motion | Done | `motion@13` | ✅ | **Accepted** — already migrated |
| GSAP + ScrollTrigger | 3.15 | + premium plugins | P1 | **In progress** — lazy register |
| Lenis vs ScrollSmoother | Lenis | TBD | P1 | **Keep Lenis** until landing acts III–IX need smoother |
| R3F hero WebGL | None | ≤45KB gzip | P1 | **Evaluate** — static gradient fallback required |
| Skia (mobile) | None | RN Skia | P2 | **Defer** — readiness ring parity |
| Lighthouse CI gate | Manual script | Automated | P0 | **Accept** — conservative thresholds |
| Visual regression CI | Local only | CI | P0 | **Accept** |

## Rationale

- **Stability first:** Production at `fitconnect-phi.vercel.app` must stay green.
- **One major at a time:** Each upgrade = isolated branch + full `typecheck/test/build/e2e`.
- **Motion stack:** GSAP context + Lenis already wired; ScrollSmoother ADR when replacing Lenis.

## Consequences

- Document target versions in `AGENT_PROGRESS.md` when each phase lands.
- Use Context7 / official migration guides before any major bump.
- New dependencies require KB budget note in PR description.
