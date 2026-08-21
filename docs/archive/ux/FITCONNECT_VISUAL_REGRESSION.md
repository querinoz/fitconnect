# FitConnect — Visual regression

**Date:** 2026-08-17  
**Device:** `fitconnect_phone` emulator (`emulator-5554`), debug APK `com.fitconnect.android.debug`.

## Before (this session, pre-implementation)

- `qa/reports/screenshots/2026-08-17/emulator-app.png` — Home with Prime ring; below-fold not captured in that frame.
- `qa/reports/screenshots/2026-08-17/emulator-launch.png` — splash F-mark.

## After (athlete tabs, captured while screencap still rendered)

| Screen | Path | Notes |
| ------ | ---- | ----- |
| Home | `qa/reports/screenshots/2026-08-17/visual-home.png` | First capture: Prime + LOCAL_DEMO + Groups nav. Later recaptures went black (`FLAG_SECURE` / buffer). UI dump still proves hierarchy. |
| Home scrolled | `qa/reports/screenshots/2026-08-17/visual-home-scrolled.png` | Squad `FC Performance` + km from ASCEND demo; AI directive; no 7-button toolbar. |
| Discover | `qa/reports/screenshots/2026-08-17/visual-discover.png` | Marketplace filters + verified coach card. |
| Activity | `qa/reports/screenshots/2026-08-17/visual-activity.png` | IDLE live dot (not pulsing). Map + timer 00:00. |
| Community | `qa/reports/screenshots/2026-08-17/visual-community.png` | Feed + composer. Groups tab selected. |
| Profile | `qa/reports/screenshots/2026-08-17/visual-profile.png` | Identity + appearance + metrics. |
| Landing | `qa/reports/screenshots/2026-08-17/web-landing-hero.png` | Same Volt / glass / LOCAL DEMO language as Android. |

## Compare

| Check | Result |
| ----- | ------ |
| Floor `#070B14` | Pass (not `#090402`) |
| Volt CTAs | Pass |
| Floating pill nav | Pass |
| Community ≠ heart | Pass (Groups) |
| Home density | Improved — duplicate Training-state card and 7 ghost buttons removed |
| Prime wall of text | Improved after subtitle trim (UI dump: Train Smart → HRV, no long AI paragraph in the ring) |
| Glass | Translucent cards, not iOS blur |
| Activity alive when idle | Correct — IDLE, no fake pulse |

## Capture failure (verified)

After a later debug reinstall, `adb screencap` returned a floor-colored empty bitmap while **uiautomator still listed Home widgets**. Debug Auth had been adding `FLAG_SECURE` (inverted vs release). That add was removed. Recapture after the fix still returned empty bitmaps (`mObscuringWindow` = MainActivity). **Pixel proof for the last Home trim is the UI dump**, not a new PNG.

Do not treat the ~20KB black `visual-home.png` overwrite as a product regression. Prefer `visual-home-scrolled.png` + tab PNGs from 19:06 local time.

## Remaining visual issues (verified)

- Community post cards embed full comment fields (dense).
- Disabled Primary (“Publish”) reads olive, not Volt — correct disabled state, still looks cheap.
- Squad km can exceed labeled target (`101,7 / 50 km`) — ASCEND demo data, not a layout bug.
- Coach OS and Wear were not screenshot in this loop.
- Landing dashboard mock is richer glass than Android Home (expected platform gap; not a fake mock of a missing product).
