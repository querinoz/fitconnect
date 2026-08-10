# Phase 01 — Cleanup Executed (Wave W1)

**Date:** 2026-08-07  
**Source of truth:** `docs/phase-00/Cleanup_Report.md` §1 REMOVE_CANDIDATE  
**Rule followed:** Only REMOVE_CANDIDATE deleted. CORE / ui-glass / mobile / Prisma / shared modules untouched.

---

## Deleted (31)

### Components (23)

| Path |
|------|
| `apps/web/components/cities-strip.tsx` |
| `apps/web/components/sports-strip.tsx` |
| `apps/web/components/press-strip.tsx` |
| `apps/web/components/how-it-works.tsx` |
| `apps/web/components/motion/motion-stack.tsx` |
| `apps/web/components/nav/navbar-pill.tsx` |
| `apps/web/components/pages/coach-landing-content.tsx` |
| `apps/web/components/marketing/hero-static.tsx` |
| `apps/web/components/marketing/hero-extras.tsx` |
| `apps/web/components/marketing/featured-coaches.tsx` |
| `apps/web/components/marketing/demos-section.tsx` |
| `apps/web/components/marketing/integrations-strip.tsx` |
| `apps/web/components/marketing/ck/tilt-card.tsx` |
| `apps/web/components/landing/trust-editorial.tsx` |
| `apps/web/components/landing/stats-corner.tsx` |
| `apps/web/components/dashboard/athlete-dashboard-view.tsx` |
| `apps/web/components/dashboard/coach-dashboard-view.tsx` |
| `apps/web/components/dashboard/coach-athlete-detail-view.tsx` |
| `apps/web/components/dashboard/dashboard-header.tsx` |
| `apps/web/components/dashboard/kpi-tile.tsx` |
| `apps/web/components/dashboard/hrv-timeline-card.tsx` |
| `apps/web/components/dashboard/strava-activity-detail.tsx` |
| `apps/web/components/dashboard/os/readiness-ring-widget.tsx` |

### Lib (8)

| Path |
|------|
| `apps/web/lib/api/fetch-json.ts` |
| `apps/web/lib/api/hooks/use-athlete-readiness.ts` |
| `apps/web/lib/strava/sync-worker.ts` |
| `apps/web/lib/rate-limit.ts` |
| `apps/web/lib/realtime/use-presence.ts` |
| `apps/web/lib/notifications/triggers.ts` |
| `apps/web/lib/ingestion/temporal.ts` |
| `apps/web/lib/motion/premium-transitions.ts` |

### Packages

| Path | Notes |
|------|-------|
| `packages/ui/` | Invalid empty directory (no `package.json`) — removed locally |

---

## Kept / rolled back (false orphan)

| Path | Why |
|------|-----|
| `apps/web/lib/media/imagekit-loader.ts` | Required by `apps/web/next.config.mjs` `loaderFile` — restored from HEAD after mistaken delete |

---

## Not deleted (correctly deferred)

- `components/ui-glass/**` (47 importers)  
- `apps/mobile/**` (Path A freeze / archive later)  
- `lib/integrations/store.ts`  
- Supabase SQL migrations  
- Any CORE shared package with live importers  

---

## Verification after deletes

| Check | Result |
|-------|--------|
| `pnpm --filter @fitconnect/web test` | 91 files / **236 tests passed** |
| `pnpm lint` | exit 0 (pre-existing `<img>` warnings) |
| `pnpm typecheck --filter=!@fitconnect/mobile` | **5/5 passed** |

No rollback of the 31 deletes was required. Only `imagekit-loader.ts` was restored.
