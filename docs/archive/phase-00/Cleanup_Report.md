# Phase 00 — Cleanup Report

**Date:** 2026-08-07 · **RULE: NOTHING DELETED IN THIS PHASE**

Classification of cleanup actions. Execute only after human approval, in Migration_Plan order.

---

## 1. Safe to delete (after archive PR — REMOVE_CANDIDATE)

### Web orphans (0 importers — verified static)

**Components:**  
`cities-strip.tsx`, `sports-strip.tsx`, `press-strip.tsx`, `how-it-works.tsx`, `motion/motion-stack.tsx`, `nav/navbar-pill.tsx`, `pages/coach-landing-content.tsx`, `marketing/hero-static.tsx`, `marketing/hero-extras.tsx`, `marketing/featured-coaches.tsx`, `marketing/demos-section.tsx`, `marketing/integrations-strip.tsx`, `marketing/ck/tilt-card.tsx`, `landing/trust-editorial.tsx`, `landing/stats-corner.tsx`, `dashboard/athlete-dashboard-view.tsx`, `dashboard/coach-dashboard-view.tsx`, `dashboard/coach-athlete-detail-view.tsx`, `dashboard/dashboard-header.tsx`, `dashboard/kpi-tile.tsx`, `dashboard/hrv-timeline-card.tsx`, `dashboard/strava-activity-detail.tsx`, `dashboard/os/readiness-ring-widget.tsx`

**Lib:**  
`lib/api/fetch-json.ts`, `lib/api/hooks/use-athlete-readiness.ts`, `lib/strava/sync-worker.ts`, `lib/rate-limit.ts`, `lib/realtime/use-presence.ts`, `lib/notifications/triggers.ts`, `lib/ingestion/temporal.ts`, `lib/media/imagekit-loader.ts`, `lib/motion/premium-transitions.ts`

**Packages:**  
`packages/ui/` (invalid empty package)

**Already gone (CLAUDE.md stale):** hero, showcases, audience-split, photo-reel, why-fitconnect, ck/* — update CLAUDE.md when touching docs.

**Deps:** confirm and remove `framer-motion` if still declared anywhere with 0 imports.

---

## 2. Require migration before delete

| Item | Why |
|------|-----|
| `components/ui-glass/**` | 47 importers — migrate callers to elite-os / Elite Surface first |
| `lib/integrations/store.ts` | Still backs live API routes — migrate to Prisma-only |
| `apps/mobile/**` | Archive only after native F6 field proof |
| Supabase SQL migrations | Don't delete until Prisma schema covers community/reviews/notifications or those features are explicitly cut |
| `packages/config` token shim | Mobile + some web paths still depend — repoint to design-tokens first |

---

## 3. Archive (git history preserved)

| Item | Destination / method |
|------|----------------------|
| `apps/mobile` | `apps/mobile-legacy/` or git subtree archive tag after F6 |
| Orphan marketing demos | `qa/_archive/` or delete after screenshot reference |
| ZERO-DEFEITOS QA cycle | Already at `qa/_archive-zero-defeitos/` |

---

## 4. Merge

| Pair | Action |
|------|--------|
| Dashboard legacy views → OS dashboards | Already superseded; delete legacy after smoke |
| `lib/readiness/compute.ts` + mobile readiness | Already re-export utils — keep shims or inline imports |
| Button/card triples | Merge on Elite Surface primitives over time |
| Dual readiness AI (`packages/ai`) vs utils | Clarify ownership at F10 |

---

## 5. Refactor (no behaviour change intended)

| Item | Intent |
|------|--------|
| Enforce auth on all `/api/v1/*` | Security |
| Make tRPC Strava procedures authed or remove | Security |
| Pick one realtime primary; make broadcast dev-only | Correctness |
| `DEFAULT_LANG` | Product decision (pt vs en) — don't silently change |
| Wire TanStack Query for server state | Stop Zustand-as-DB |

---

## 6. Rename / move / split

| Item | Proposal |
|------|----------|
| `lib/dashboard-store.ts` | Rename to `demo-dashboard-store` until replaced — signal danger |
| Strava web glue `lib/integrations/strava` vs package | Keep package pure; web = adapters only |
| `components/mobile/` stitch UI | Move under `components/dashboard/mobile/` or delete if unused on web |
| Elite Core modules | Already modular (`streams`, `metrics`, `zones`) — continue split per F1 |

---

## 7. Files to split

| File / area | Why |
|-------------|-----|
| `lib/dashboard-store.ts` | God store — split by feature when replacing demo data |
| Coach OS / Athlete OS dashboards | Large UI files — extract section components during F12 |
| i18n `en.ts` (~1554 lines) | Optional split by domain later — not blocking |

---

## 8. Execution rules

1. One cleanup PR family at a time (orphans → ui-glass migration → schema unify).
2. Every delete PR must include: importer grep evidence, CI green, no behaviour intent.
3. Never delete `REMOVE_CANDIDATE` in the same PR as a feature.
4. Update `CLAUDE.md` orphan list when deleting.
