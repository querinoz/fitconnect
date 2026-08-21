# Phase 02 — Localization Report

## Architecture

`LocaleManager` / `DefaultLocaleManager`:

- Locales: **EN**, **PT**, **ES** (extensible enum)  
- Persistence via DataStore `PreferenceKeys.LOCALE`  
- Observe Flow for reactive UI  
- `formatNumber` with BCP-47  
- `rtl` flag on `AppLocale` (none marked RTL yet — structure ready for AR/HE)

## App shell

Android resources remain EN for foundation strings; locale preference is ready for feature modules and `AppCompatDelegate.setApplicationLocales` wiring in a follow-up.

## Gaps

- Pluralization API not yet added (`QuantityStrings` bridge)  
- Compose string resources not yet locale-switched from `LocaleManager`  
- No in-app language picker UI (platform only)
