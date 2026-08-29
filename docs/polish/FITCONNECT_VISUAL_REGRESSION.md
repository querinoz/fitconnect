# FitConnect Visual Regression

**Date:** 2026-08-29  
**Status:** PARTIAL — automated capture available, full matrix pending human review

## Automated Capture

```bash
npm run design:review
# Output: public/design-review/index.html
```

## Screens Targeted This Pass

| Route | Viewport | Status |
|-------|----------|--------|
| `/feed` | 390×844 | PENDING — demo feed requires auth |
| `/profile` | 390×844 | PENDING — demo profile requires auth |
| `/` (landing) | 1440×900 | Available via design:review |
| `/signin` | 390×844 | Available |

## Evidence Location

`qa/evidence/polish/` — screenshots to be added by CI or manual Playwright run.

## Known Visual Risks

1. Hex atmosphere opacity may vary by display calibration
2. Demo feed animation timing not captured in static screenshots
3. Font loading (Syne, Plus Jakarta Sans) — verify FOUT on slow networks

## Before/After Notes

| Screen | Before | After |
|--------|--------|-------|
| Feed | Static COMMUNITY_POSTS | Live demo stream + reactions |
| Profile | Placeholder text | Player card + XP + badges |
| Shell | Flat ink-950 | Hex atmosphere layer |

## Regression Checklist

- [ ] Logo renders official assets
- [ ] Voltline accent on active dock item
- [ ] Glass cards readable over hex background
- [ ] Demo badge visible on feed cards
- [ ] XP bar animates without layout shift
