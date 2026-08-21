# Landing cleanup report

## Deleted / removed (with reference check)

| Item | Action | Evidence |
|------|--------|----------|
| Unsplash gym photos in scroll story | Removed | No remaining `images.unsplash.com` in `scroll-story.tsx`; replaced with EOS gradients |
| `#090402` floor in marketing canvas | Replaced | `rg #090402` empty in ts/tsx/css |
| Hero duplicate in-page header | Removed | Sticky `LandingOsNav` owns links |
| Fake “Live” / “ONLINE” hero badges | Relabeled | i18n `demoBadge` / `liveBadge` = LOCAL DEMO |

## Not deleted (REVIEW)

| Item | Why |
|------|-----|
| `ui-glass` / VoltButton | Still imported by marketing and app |
| `device-showcase.tsx` / `iphone-frame.tsx` / `galaxy-watch-frame.tsx` | Still used by download / other marketing pages |
| `apps/web/public/hero-training.mp4` | Hero desktop background; mobile skipped |
| Historical `docs/phase-*` | Audit trail |
| Expo `apps/mobile` | Frozen Path A |

## Unused-looking but referenced

`LandingCanvas` still used by `(marketing)` layout. Home landing uses `LandingShellV2` + `CrosshairBg` instead.
