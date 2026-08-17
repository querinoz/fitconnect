---
name: android-accessibility
description: Android / Jetpack Compose accessibility checklist for FitConnect Elite Surface. Use when auditing TalkBack, touch targets, contrast, and semantics.
---

# Android accessibility (FitConnect)

Do not claim TalkBack PASS without a device/emulator dump. Code review is not evidence.

## Checklist

1. **Content descriptions**
   - Actionable icons describe the action (`Wearable sync`, `Profile`), not the glyph.
   - Decorative images: `contentDescription = null`.
2. **Touch targets**
   - Interactive controls ≥ **48dp**. Prefer `Accessibility.MIN_TOUCH_TARGET_DP` / `PREFERRED_TOUCH_TARGET_DP`.
3. **Contrast**
   - WCAG AA: 4.5:1 body, 3:1 large text. Floor `#070B14` + Volt `#C8FF00` is the canonical pair — do not fork hues to “fix” contrast.
4. **Semantics**
   - Group metric cards with `mergeDescendants` when they are one item.
   - Custom toggles need `stateDescription` / `toggleableState`.
   - Section titles: `heading()`.
5. **Motion**
   - `ANIMATOR_DURATION_SCALE == 0` and power-save → static honeycomb, no parallax/pulse.
6. **Focus**
   - Order Top-Start → Bottom-End. Floating nav remains reachable.

## Evidence

```powershell
adb shell uiautomator dump /sdcard/window_dump.xml
adb pull /sdcard/window_dump.xml docs/qa/elite-os-v2-home-ui.xml
```
