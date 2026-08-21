# Phase 02 — Theme Report

## Engine

1. **Tokens SoT:** `packages/design-tokens` → generated `EliteSurfaceColors` (`:design`)  
2. **Preference:** `ThemeSettings` (`SYSTEM` / `DARK` / `LIGHT`) in DataStore  
3. **Compose:** `EliteSurfaceTheme` maps tokens → Material3 schemes; observes `ThemeSettings`  
4. **XML:** dark window background / splash use `eos_floor`

Voltline identity is preserved via `--eos-voltline` / `VOLTLINE` token — no hardcoded Compose hex in theme logic beyond generated ARGB longs from the token pipeline.

## Gaps

- Dynamic Material You / wallpaper colors not enabled  
- Typography / spacing scale objects not yet generated into Kotlin (colors only)  
- Icon pack not centralized
