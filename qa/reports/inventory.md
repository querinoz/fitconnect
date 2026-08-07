# Repository inventory — Cycle 01 (summary)

> Full per-file inventory deferred to knip + manual pass. This is the executive summary.

## Scope

| Area | page.tsx routes | Notes |
|------|-----------------|-------|
| `apps/web/app` | 41 | Marketing + app + admin + modals |
| `apps/mobile/app` | Expo Router tabs | Athlete + coach |
| `packages/*` | 11 packages | Shared libs |

## Verdict buckets (sampled)

| Verdict | Examples |
|---------|----------|
| **Used / canonical** | `elite-os.css`, `landing-page-content.tsx`, `command-palette.tsx`, `packages/design-tokens` |
| **Used / legacy** | `ui-glass/*` (~47 imports), `voltline.css` aliases, `nivis-panel.tsx` |
| **Suspect duplicate** | `athlete-dashboard-view` vs `athlete-os-dashboard`, `preview-*` vs Stitch screens |
| **Removed in v2** | `landing-shell.tsx`, `hero-cinematic.tsx`, `section-break.tsx` (deleted) |
| **QA infra missing** | `qa/crawlers/`, `apps/mobile/.maestro/` |
| **Orphan TBD** | Requires `knip` run — not executed cycle 1 |

## Route reachability (filesystem)

All 41 `page.tsx` files under `apps/web/app` — **reachability from UI not yet verified** (needs route crawler).

Known public entry points: `/`, `/discover`, `/signin`, `/signup`, `/pricing`, `/mobile`, `/dashboard`, `/coach/dashboard`, `/admin`.

## Assets

- `public/` — brand logos, sw.js, hero-training.mp4 (~large — perf risk QA-002)
- Unsplash URLs in coach reel — external dependency

## CI

- `.github/workflows/ci.yml` — lint, typecheck, test, build, E2E (landing-motion, visual-regression, smoke, phase9-auth), lighthouse job

_Generated: 2026-08-07 · Cycle 01_
