# FitConnect — Motion system

**Date:** 2026-08-17  
**Tokens:** `EliteSurfaceMotion` — MICRO 150ms · UI 220ms · SCREEN 400ms · DATA 1200ms.

## Presets (`EliteMotionPreset`)

| Preset | Duration token | Spec |
| ------ | -------------- | ---- |
| MICRO, SPRING | MICRO | Spring (damping 0.82, stiffness 380) |
| SUCCESS, ERROR | MICRO | Tween FastOutSlowIn |
| FADE, SCALE, CARD_EXPAND, DECELERATE, EMPHASIS | UI | Tween |
| SLIDE, BOTTOM_SHEET, NAVIGATION, PAGE, ENTER, EXIT | SCREEN | Tween |
| LOADING | DATA | Tween |

Reduce motion (`LocalReduceMotion` / animator duration scale): **all durations 0**; spring becomes `tween(0)`.

## Where it is used

- Button press scale 0.97 (gated on reduce-motion).
- `EliteLiveDot` pulse uses `UI_MS * 4` reverse loop **only when live**.
- Activity live label binds to `LiveActivityPhase.RUNNING` / `RESUMING` — not an infinite fake “recording” animation while IDLE.
- Auth intro steps still stagger 280ms; skip to complete when reduce-motion is on.

## What changed

- Added SPRING / DECELERATE / EMPHASIS / ENTER / EXIT aliases so screens do not invent durations.
- Unit tests: `EliteMotionTest` (3 cases including spring + reduce-motion).

## Remaining

- Tab indicator is still a static selected halo, not a shared-element sliding pill.
- Chart series do not yet animate point-by-point on first paint.
- No haptics on tab change (haptics exist on activity complete when prefs allow).
