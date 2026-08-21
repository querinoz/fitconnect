# FitConnect — Design system audit

**Date:** 2026-08-17  
**Canonical floor:** `#070B14` (Elite Surface / `--eos-floor`). Prompt `#090402` was **not** applied.

## What was found

| Layer | Source of truth | Gap |
| ----- | --------------- | --- |
| Color | `packages/design-tokens` → `EliteSurfaceColors` + `apps/web/app/elite-os.css` | Aligned. Do not fork. |
| Type | Syne / Plus Jakarta Sans / JetBrains Mono | Android maps via generated type tokens. No third family added. |
| Buttons | `EliteButton` | Secondary was Material tonal; no Destructive. |
| Glass | `EliteCardVariant.Glass` | Used `surface` at 0.92 alpha instead of `EliteOpacity.Glass` (0.72). No real backdrop blur (Compose limitation). |
| Loading | `EliteLoading` | Generic spinner. |
| Icons | Material core only | Community used heart; unselected tabs were filled. |
| Motion | `EliteMotion` | Tween only; no spring micro preset. |

## What was changed

- Secondary button → outlined carbon glass (`EliteOpacity.Glass` + hairline).
- Destructive variant → `EliteSurfaceColors.ALERT`.
- Glass cards use `EliteOpacity.Glass`.
- `EliteLoading` → `SYS.SYNC` label; spinner skipped when reduce-motion is on.
- Material Icons Extended added; athlete/coach tabs outlined when idle, filled when selected; Community = Groups.
- Motion presets: SPRING / DECELERATE / EMPHASIS / ENTER / EXIT; MICRO/SPRING use Compose spring.
- Live dot pulses only when `live == true` and reduce-motion is off.

## Why

Match landing CTA language (Volt / glass / ghost) and stop Community reading as a social-heart product.

## Files changed

- `android/gradle/libs.versions.toml`
- `android/design-ui/build.gradle.kts`
- `android/design-ui/src/main/java/com/fitconnect/android/designui/components/{EliteButton,EliteCard,EliteChrome,EliteInstrument}.kt`
- `android/design-ui/src/main/java/com/fitconnect/android/designui/motion/EliteMotion.kt`
- `android/design-ui/src/main/java/com/fitconnect/android/designui/catalog/DesignSystemCatalog.kt`
- `android/athlete/build.gradle.kts`, `android/coach/build.gradle.kts`
- `android/athlete/.../AthleteScaffold.kt`, `android/coach/.../CoachScaffold.kt`

## Remaining

- True backdrop blur is not available as a cross-API Compose primitive. Glass is translucent + hairline, not iOS-style blur.
- Material icon family remains (outlined/filled pairing). No custom icon font shipped.
- Web tokens were not rewritten this pass (already canonical).
