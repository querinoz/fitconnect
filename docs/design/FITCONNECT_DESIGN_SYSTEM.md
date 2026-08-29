# FitConnect Elite OS — Design System

**Status:** IMPLEMENTED (Web) · PARTIAL (Android) · PLANNED (Wear OS)  
**Canonical source:** This document + `lib/theme/elite-tokens.ts` + `app/voltline.css`

---

## 1. Brand

| Field | Value |
|-------|-------|
| Name | FitConnect |
| Product | FitConnect Elite OS |
| Positioning | THE OPERATING SYSTEM FOR ELITE HUMAN PERFORMANCE |
| Tagline (PT) | Liga. Treina. Perform. |

## 2. Logo

| Variant | Asset | Usage |
|---------|-------|-------|
| Full lockup | `public/brand/logo-full-official.png` | Landing, auth, splash, major headers |
| Icon only | `public/brand/logomark-official-*.png` | Compact header, favicon, Wear OS |
| Vector fallback | `public/brand/logomark.svg` | SVG contexts |

**Component:** `components/brand/fitconnect-logo.tsx`  
**Rules:** Do not redraw. Do not use Lucide Dumbbell or generic fitness icons as brand.

## 3. Color

| Token | Hex | Role |
|-------|-----|------|
| `--ink-950` | `#090402` | Deep Obsidian — primary environment |
| `--volt-500` | `#C8FF00` | Voltline — primary accent |
| `--jade-500` | `#00DDB4` | Connect — secondary |
| `--coral-500` | `#FF5470` | Danger |
| `--amber-400` | `#F5B844` | Warning |

**Accent personalization:** Green-family spectrum only (7 presets in `lib/theme/themes.ts`). Semantic telemetry colors are never overridden by user accent.

## 4. Typography

| Role | Font | CSS variable |
|------|------|--------------|
| Display / hero | Syne | `--font-display` |
| Body / UI | Plus Jakarta Sans | `--font-body` |
| Metrics / telemetry | JetBrains Mono | `--font-mono` |

## 5–10. Spacing, Layout, Radius, Elevation, Glass, Neumorphism

See `FITCONNECT_LAYOUT_SYSTEM.md`.

## Header (IMPLEMENTED)

`components/shell/elite-header.tsx`  
- LEFT: Logo → HOME (`/feed` athlete, `/coach/dashboard` coach)  
- RIGHT: Settings sheet

## Navigation (IMPLEMENTED)

Athlete dock: HOME (`/feed`) · DISCOVER · CREATE · SQUADS · PROFILE

## Platform status

| Platform | Status |
|----------|--------|
| Web (Next.js) | IMPLEMENTED |
| Landing | IMPLEMENTED |
| Android (Kotlin) | PLANNED — no native code in repo |
| Wear OS | PLANNED — mockups only |
