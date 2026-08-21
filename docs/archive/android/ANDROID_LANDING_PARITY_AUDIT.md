# ANDROID_LANDING_PARITY_AUDIT.md

**Date:** 2026-08-15  
**Scope:** Native Android (`android/`) vs Elite Surface tokens / landing identity  
**Stitch:** not used — project URL is login-walled; no fabricated Stitch content.

## Current state

Android already had Elite Surface tokens, Syne / Plus Jakarta / JetBrains Mono, Voltline nav, and a `ThemeMode` store (`SYSTEM/DARK/LIGHT/HIGH_CONTRAST`). The live APK still felt broken:

- Scaffolds painted `FLOOR` (`#070B14`) even when theme was Light.
- Glass cards sat at 72% of a near-black surface (illegible).
- Multiple composables in one `LazyColumn` `item {}` stacked at the same origin (profile, home actions, coach KPIs).
- Profile was a dump of unlabeled strings with overlapping metric cards and no appearance control.

Landing remains the cinematic web intro. This pass did **not** restyle the marketing site; it made the Android product readable and theme-switchable using the same token family.

## Target state

One Elite OS language on device:

- Dark: carbon floor + lifted containers (not pitch black).
- Light: paper `lightFloor` / `lightSurface` derived from `onSurface` / `floor`.
- User-visible Dark / Light / System control on Auth + Profile.
- No overlapping lazy items; nav does not cover content.
- Profile is an identity surface (avatar, fields, appearance, goals, devices).

## Divergences (pre-fix)

| Item | Severity | Fix |
|------|----------|-----|
| Hardcoded `FLOOR` scaffolds ignore Light | P0 | `colorScheme.background` |
| Lazy `item` overlap (profile, overview KPIs, home buttons) | P0 | `EliteStack` / `EliteFlowRow` |
| Theme store with no UI | P0 | `EliteAppearancePicker` |
| Glass/metric cards too dark | P1 | surfaceContainer + 96% glass |
| Profile unlabeled / overlapping metrics | P0 | identity card + stacked fields |
| Landing mockups vs live Android | P2 | screenshot pipeline still needs emulator |
| Stitch reference | P3 | PENDING_HUMAN (auth) |

## Verification

- Unit: `ThemeSettingsTest`, `EliteColorRolesTest`
- Gradle: `:foundation:test`, `:design-ui:test`, `:app:assembleDebug`
- Emulator: **blocked** — Android Emulator hypervisor driver not installed on this machine
- Device: rebuild debug APK / QR for human reinstall
