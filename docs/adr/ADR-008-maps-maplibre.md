# ADR-008 — Maps: MapLibre GL on all surfaces, offline tiles on Android

**Date:** 2026-08-07
**Status:** Proposed

## Context

v1 needs: live map during recording (Android), post-activity route rendering (Android + web), and offline tiles for field use. Web already uses MapLibre GL JS + OpenFreeMap (existing `packages/maps`, `/map` route). Route builder/heatmaps/segments are out of scope (BACKLOG-V2).

## Decision

- **Android:** MapLibre GL Native (org.maplibre.android) with the same dark style URL used on web (`NEXT_PUBLIC_MAP_STYLE_URL` equivalent in `BuildConfig`).
- **Offline:** MapLibre `OfflineManager` region downloads keyed to the athlete's usual training area (explicit user action, size shown before download). No custom tile server in v1.
- **Web:** keep MapLibre GL JS as-is.
- **Wear OS:** **no map in v1** — metrics-first recording screen; a breadcrumb track is a BACKLOG-V2 item. (Battery gate makes watch map rendering a bad trade.)

Google Maps SDK rejected: licensing friction for offline, and style parity with the Elite Surface dark aesthetic is worse.

## Consequences

- Tile usage stays within OpenFreeMap fair use for v1 beta (20 athletes); paid tile plan is a launch checklist item in F15.
- `packages/maps` remains the web wrapper; Android map code lives in `android/app` directly (no forced abstraction).
