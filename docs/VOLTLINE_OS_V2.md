# Voltline OS v2 — Progress & Runbook

> **Status:** Foundation complete · Cinematic landing & media pipeline = Phase 2+  
> **Production:** https://fitconnect-phi.vercel.app  
> **Branch:** `feature/fitconnect`

## What shipped (foundation)

| Area | Done | Notes |
|------|------|-------|
| Token unification | ✅ | ADR-001 · `elite-os.css` canonical · `voltline.css` aliases |
| Elite OS P0 surfaces | ✅ | Landing v2, marketing, dashboards, mobile preview |
| Docs | ✅ | `docs/DESIGN_SYSTEM.md`, `motion-language.md`, `art-direction.md`, ADR-003/004 |
| Codemod | ✅ | `pnpm codemod:tokens` — report / dry-run / safe `--write` |
| Token sync test | ✅ | `tokens-sync.test.ts` — COLOR_TOKENS ↔ CSS |
| PWA / Windows | ✅ | WCO manifest, shortcuts, titlebar CSS (ADR-004) |
| ImageKit scaffold | ✅ | `lib/media/imagekit.ts` + optional custom loader |
| CI | ✅ | Visual regression E2E + Lighthouse gate job |
| Hero gate EOS | ✅ | `hero-gate.tsx` → `bg-eos-*` classes |

## Performance targets (Voltline v2 full)

| Metric | Current (prod) | Target |
|--------|----------------|--------|
| LCP mobile | ~3.7s | ≤ 2.2s |
| INP | — | ≤ 200ms |
| CLS | ~0.04 | ≤ 0.02 |
| Lighthouse perf | 84–90 | ≥ 92 |
| Lighthouse a11y | 90 | 100 |
| Landing JS (gzip) | — | ≤ 180KB |

**CI gate (conservative):** perf ≥84, a11y ≥90 — matches current production baseline.  
Tighten via `LIGHTHOUSE_MIN_*` env vars when Phase 2 landing ships.

```bash
pnpm lighthouse:mobile http://127.0.0.1:3001   # local prod server
pnpm lighthouse:gate http://fitconnect-phi.vercel.app  # fail on breach
```

## Phase roadmap (remaining)

### Phase 2 — Cinematic landing (9 acts)
- GSAP ScrollTrigger director · WebGL hero budget ≤45KB gzip
- ScrollSmoother vs Lenis ADR · SplitText / DrawSVG
- **Owner:** `scroll-director` sub-agent pattern

### Phase 3 — Web app depth
- Command palette ⌘K · View Transitions · readiness ring canvas
- Bento emphasis tiers · coach cockpit heatmap

### Phase 4 — Mobile parity
- Skia readiness ring · Reanimated 4 · haptics · MMKV offline

### Phase 5 — Media pipeline
- ImageKit migration (all `/public` marketing assets)
- Higgsfield art direction per `docs/art-direction.md`

### Phase 6 — Stack modernization (deferred)
- See `docs/adr/ADR-003-stack-modernization.md` — Next 15 / React 19 / Tailwind v4

## Commands

```bash
pnpm dev                    # :3001
pnpm typecheck && pnpm test && pnpm build
pnpm test:e2e:voltline
pnpm codemod:tokens         # hex / legacy class audit
pnpm codemod:tokens --write # safe auto-fixes (landing only)
```

## Definition of done (per phase)

See mega-prompt checklist. Foundation phase closes when:

- [x] ADR-001 + DESIGN_SYSTEM.md
- [x] Codemod + token sync test
- [x] PWA manifest + WCO CSS
- [x] CI visual regression + Lighthouse job
- [x] ImageKit scaffold + `.env.example`
- [ ] Full 9-act landing (Phase 2)
- [ ] ImageKit asset migration (Phase 5)
- [ ] Lighthouse ≥92 / a11y 100 (Phase 2+ perf pass)

## Honest assessment

**Better:** Single EOS token layer, Elite OS across marketing + app, CI guards for visual drift and Lighthouse regression, PWA ready for Windows install, ImageKit hook without blocking local dev.

**Not yet good:** LCP still ~3.7s; landing motion is v2 editorial not full cinematic acts; ~47 `ui-glass/` imports remain; mobile lacks Skia parity; no ImageKit assets migrated yet.
