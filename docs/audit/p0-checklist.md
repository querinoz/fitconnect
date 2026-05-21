# FitConnect P0 Audit Checklist

> Generated during Phase 0 bootstrap. Status updated as fixes land.

## Critical bugs

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 1 | Demo mode ON by default | `.env.example`, CI, middleware | pending |
| 2 | Hero device mock PT-only | `device-showcase.tsx` | pending |
| 3 | Demo widgets English-only | `demo-readiness.tsx`, `demo-match.tsx`, `demo-coach-flip.tsx` | pending |
| 4 | Demos title English suffix | `demos-section.tsx` | pending |
| 5 | Metadata PT-only | `app/layout.tsx` | pending |
| 6 | Lang hydration flash | `i18n-provider.tsx` | pending |
| 7 | prisma/seed.ts broken imports | `prisma/seed.ts` | pending |
| 8 | Dockerfile missing packages | `Dockerfile` | pending |
| 9 | tRPC user null | `app/api/trpc/[trpc]/route.ts` | pending |
| 10 | Stripe 100% demo | `lib/stripe/demo.ts` | pending |

## Orphan components (zero imports)

- `apps/web/components/hero.tsx`
- `apps/web/components/marketing/showcases.tsx`
- `apps/web/components/marketing/audience-split.tsx`
- `apps/web/components/marketing/photo-reel.tsx`
- `apps/web/components/marketing/why-fitconnect.tsx`
- `apps/web/components/marketing/ck/philosophy-block.tsx`
- `apps/web/components/marketing/ck/floating-pillars.tsx`
- `apps/web/components/marketing/ck/text-marquee.tsx`
- `apps/web/components/features.tsx`
- `apps/web/components/stat-bar.tsx`
- `apps/web/components/sports-strip.tsx`
- `apps/web/components/programs-strip.tsx`
- `apps/web/components/methodology-preview.tsx`
- `apps/web/components/trainers-grid.tsx`
- `apps/web/components/marketing/product-mockup.tsx`
- `apps/web/components/marketing/ck/boot-loader.tsx`
- `apps/web/components/marketing/ck/status-ticker.tsx`

## API routes (30 total)

See `apps/web/app/api/**/route.ts` — 15+ open via query param without Supabase auth.
