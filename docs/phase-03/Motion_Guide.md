# Phase 03 — Motion Guide

## Presets (`EliteMotionPreset`)

| Preset | Duration token | Use |
|--------|----------------|-----|
| MICRO / SUCCESS / ERROR | `MICRO_MS` (150) | Toggles, feedback |
| FADE / SCALE / CARD_EXPAND | `UI_MS` (220) | Cards, panels |
| SLIDE / BOTTOM_SHEET / NAVIGATION / PAGE | `SCREEN_MS` (400) | Transitions |
| LOADING | `DATA_MS` (1200) | Live/data pulses |

## Reduce motion

`EliteSurfaceTheme` reads `Settings.Global.ANIMATOR_DURATION_SCALE`. When `0`, `EliteMotion.durationMs(..., reduceMotion=true)` returns **0**.

```kotlin
val spec = eliteMotionSpec<Float>(EliteMotionPreset.FADE)
```

Easing: `FastOutSlowInEasing` (Material kinetic stand-in; web `MOTION_TOKENS.ease.kinetic` remains web SoT for cubic-bezier arrays).
