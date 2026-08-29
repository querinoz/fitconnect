# FitConnect Polish Remediation

**Date:** 2026-08-29

## Fixes Applied This Pass

| Area | Change | Files |
|------|--------|-------|
| Demo Live Feed | 4s cyclic local event stream, `DEMO_FEED_MODE` flag | `lib/demo/*`, `components/community/*` |
| Feed cards | Typed cards, reactions, motion, demo badge | `demo-feed-card.tsx`, `feed-reactions.tsx` |
| Hex background | Subtle SVG hex pattern, reduced-motion safe | `globals.css`, `hex-atmosphere.tsx` |
| Profile | Player card with XP, badges, stats (demo) | `player-profile-card.tsx`, `profile/page.tsx` |
| Shell | Hex atmosphere in mobile shell | `mobile-shell.tsx` |
| Tests | Demo feed unit tests | `lib/demo/*.test.ts` |
| Docs | Polish documentation suite | `docs/polish/*` |

## Remaining P0/P1

### P0
- **Native platforms:** Requires separate Android/Wear repositories.

### P1
- **Gamification backend:** Wire XP events with `event_id` deduplication.
- **Production 500:** Infrastructure fix required.

## Recommended Next Repairs

1. Migrate marketing pages to Elite OS tokens
2. Implement ASCEND route with badge collection grid
3. Add `NEXT_PUBLIC_DEMO_FEED_MODE=false` in production `.env`
4. Connect feed to realtime channel when backend ready (without synthetic DB writes)
5. Add Playwright visual regression for `/feed` and `/profile`
