# ADR-004 — Windows / Desktop Strategy

**Date:** 2026-08-06  
**Status:** Accepted  
**Author:** FitConnect engineering

## Context

Voltline OS v2 requires first-class Windows experience: installable PWA, optional Window Controls Overlay, keyboard shortcuts, DPI scaling.

## Decision

**Primary:** Enhanced PWA via `next-pwa` + rich `manifest.webmanifest`.  
**Secondary (deferred):** Tauri 2 `.msi` for Microsoft Store — evaluate after PWA metrics prove install rate.

### PWA (implemented / in progress)

- `display: standalone` + `display_override: ["window-controls-overlay", "standalone"]`
- Maskable icons 192/512, shortcuts to Dashboard / Discover / Sessions
- Service worker: prod-only, route strategies in `lib/pwa/config.mjs`
- Keyboard: ⌘K / Ctrl+K command palette (web app P1)

### Window Controls Overlay

- CSS env vars: `titlebar-area-*` for custom title bar when overlay supported
- Graceful fallback to browser chrome when unsupported

### Tauri 2

| Pro | Con |
|-----|-----|
| Native `.msi`, offline shell | Second build pipeline, auto-update burden |
| Store distribution | Duplicates PWA for most users |

**Recommendation:** Ship PWA first; revisit Tauri if enterprise customers require offline-native shell.

## Testing matrix

- Viewports: 1280, 1440, 1920, 2560
- DPI: 100%, 125%, 150%
- Browsers: Edge (primary), Chrome

## Consequences

- Manifest changes must update `lib/pwa/manifest.test.ts`.
- WCO styles live in `apps/web/app/globals.css` under `@media (display-mode: standalone)`.
