# FitConnect Polish Audit

**Date:** 2026-08-29  
**Scope:** Web (Next.js 14) — single-app repo at workspace root  
**Branch:** `cursor/instagram-api-publish-3f4b`

## Executive Summary

FitConnect web received a targeted polish pass focused on **Elite OS design DNA**, **demo live feed**, **hex atmosphere**, **profile player card**, and **documentation**. Native Android, Wear OS, GPS telemetry, and full ASCEND backend remain **out of scope** for this repository.

## Platform Coverage

| Surface | Status | Notes |
|---------|--------|-------|
| Web App (authenticated) | AUDITED + PARTIAL FIX | Feed, profile, shell, header |
| Landing / Marketing | AUDITED | Legacy brand classes remain on some pages |
| Android native | BLOCKED | No Kotlin/Compose code in repo |
| Wear OS | BLOCKED | No watch module |
| Athlete OS / Coach OS (native) | BLOCKED | Web coach routes exist |
| GPS / Map / Live telemetry | PARTIAL | UI components exist; no real GPS in web |
| Realtime | PARTIAL | Synthetic handlers; not production-verified |

## Design DNA Compliance

| Token | Expected | Current |
|-------|----------|---------|
| Core `#090402` | ✓ | `voltline.css` ink-950 |
| Primary `#C8FF00` | ✓ | volt-500 |
| Secondary `#00DDB4` | ✓ | jade-500 |
| Syne (display) | ✓ | `app/layout.tsx` |
| Plus Jakarta Sans (body) | ✓ | `app/layout.tsx` |
| JetBrains Mono (metrics) | ✓ | profile XP, feed metrics |

## Screen Audit (Web)

### Feed (`/feed`) — HOME
- **Hierarchy:** PASS — demo indicator → cards
- **Spacing:** PASS — 16px card padding, 12px gaps
- **Demo mode:** IMPLEMENTED — `DEMO_FEED_MODE`, 4s cycle
- **Premium feel:** PARTIAL — motion + glass; needs human visual QA

### Profile (`/profile`)
- **Before:** Placeholder only
- **After:** Player card with XP bar, badges, stats (demo fixtures)
- **Status:** PARTIAL — demo data, no backend sync

### Discover / Community / Dashboard
- **Status:** AUDITED — existing Elite header + dock; no structural changes this pass

### Coach routes
- **Status:** AUDITED — separate dock; not re-polished this pass

### Landing
- **Status:** AUDITED — marketing pages retain some legacy gradient tokens

## Spacing Scale

Canonical scale documented in `lib/theme/elite-tokens.ts`: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

**Findings:**
- App shell uses `px-5` (20px) gutters — aligned
- Card padding normalized to `p-4` (16px) on feed cards
- Arbitrary values remain on marketing hero sections (P2)

## Typography

- Display headlines use `font-display` (Syne)
- Body uses default sans (Plus Jakarta Sans)
- Metrics use `font-mono` on XP, highlights, reaction counts

## Icons

- Lucide React used consistently in app shell and feed
- FitConnect reactions use emoji set per spec (🔥⚡💚🏆🚀💪👏🫡)

## Glass / Neumorphism

- Glass: `bg-glass-md`, `border-glass-border` on cards — PASS
- Neumorphism: limited to existing UI-glass components; not expanded app-wide

## Background

- **IMPLEMENTED:** Hex atmosphere via `.hex-atmosphere` in `globals.css` + `HexAtmosphere` component on `MobileShell`

## Header / Navigation

- Elite header: logo → HOME (`/feed`), settings sheet — PASS
- Dock: Home, Discover, Create, Squads, Profile — PASS

## Motion

- Feed card enter: fade + slide + spring
- New demo posts: staggered avatar/media
- XP bar: width animation on profile
- Reduced motion: respected via CSS `prefers-reduced-motion`

## Issues Classified

| ID | Severity | Issue |
|----|----------|-------|
| P0-001 | P0 | No native Android/Wear — cross-platform polish blocked |
| P1-001 | P1 | Gamification backend not wired — XP/badges are demo fixtures |
| P1-002 | P1 | Production deploy returns 500 — PENDING_HUMAN |
| P2-001 | P2 | Marketing pages use legacy brand gradient tokens |
| P2-002 | P2 | Community page still hybrid marketing/squads |
| P3-001 | P3 | Some dashboard cards use older spacing |

## PENDING_HUMAN

1. Production deployment fix (`fitconnect.querinoz.dev` 500)
2. Native Android/Wear OS repositories for true cross-platform polish
3. Real gamification event pipeline + idempotency layer
4. Visual regression screenshots on physical devices
5. TalkBack / accessibility audit on hardware
