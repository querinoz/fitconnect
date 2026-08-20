# 03 — Product status

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**Release:** **NO-GO**

## What is genuinely good (do not break)

- Elite OS visual system (Syne / Plus Jakarta / JetBrains Mono, `--eos-floor` / `--eos-voltline`)
- Athlete IA: 4 destinations + Train FAB
- Strava OAuth package structure (encryption, webhook, proxy) — **policy must be tightened**
- Web Vitest coverage and monorepo Turbo CI skeleton
- Fail-closed production config gates on Android (`ProductionConfigGate`)
- LOCAL_DEMO labeling in many Android screens

## What looks like a product but is not production

| Area | Status |
| --- | --- |
| Athlete Today / Analysis | UI strong; data often LOCAL_DEMO |
| Coach OS | UI; roster/earnings not live-authorized end-to-end |
| Booking / sessions | Demo + Prisma mix |
| Community | Module exists; must stay behind `shareable=1` |
| Programs | Web + Prisma; not the v1 blocker |
| Map | Canvas/polyline / MapLibre stub — not live GPS |
| Capture | `EliteCapture` is an explicit placeholder |
| ASCEND | Android engine + web gamification store — two truths |
| Watch | APK path exists; certification HUMAN |
| Auth | Engineering path exists; PRODUCTION_AUTH PENDING_HUMAN |
| Payments | Stripe still demo-shaped |

## Demo vs real

- Explicit demo: `NEXT_PUBLIC_DEMO_MODE=true`, Android `allowLocalAuth` debug
- **Forbidden:** silent demo fallback when Firebase/Supabase missing in production
- CI: global `NEXT_PUBLIC_DEMO_MODE=true` (see `16` / `21`) — production-like job exists but E2E still demo-on

## i18n

Supported: EN PT ES FR DE IT. Landing mostly complete. Dashboards, shell, and Expo (frozen) incomplete.

## Tagline / brand

FitConnect — Connect. Train. Perform. OLED-dark + one saturated accent. Not cyberpunk, not pastels.

## Do not expand in v1

Stories, Reels, creator tools, recommendation engine, landing Higgsfield/scroll-world video, Squad OS seasons, Apple Sign-In (HUMAN later).
