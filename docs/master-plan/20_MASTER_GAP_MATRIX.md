# 20 — Master gap matrix

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

| ID | Gap | Severity | Phase | Owner |
| --- | --- | --- | --- | --- |
| G01 | Strava third-party / coach data path | P0 | P0-SEC | Eng |
| G02 | Web Strava allowlist ≠ Android bans | P0 | P0-SEC | Eng |
| G03 | Integrations status / athlete IDOR | P0 | P0-SEC | Eng (re-verify) |
| G04 | RLS unproven on live/CI Postgres | P0 | P0-SEC → P1-DATA | Eng + CI Docker |
| G05 | No account deletion | P0 | P0-SEC | Eng |
| G06 | Privacy/Terms `href: "#"` | P0 | P0-SEC | Eng + legal copy HUMAN |
| G07 | Webhook default token + unsigned job POST | P0 | P0-SEC | Eng |
| G08 | No real route rate limiting | P0 | P0-SEC | Eng + Upstash HUMAN |
| G09 | Prisma schema ≠ Supabase SQL | P1 | P1-DATA | Eng |
| G10 | Dual XP / ASCEND | P1 | P4-ASCEND | Eng |
| G11 | Dual readiness implementations | P1 | P1-DATA / P2-CORE | Eng |
| G12 | Broadcast default vs Convex canonical | P1 | P3-REALTIME | Eng |
| G13 | CI E2E demo mode on | P1 | P1-AUTH | Eng |
| G14 | PRODUCTION_AUTH credentials | P1 | P10 | HUMAN |
| G15 | Capture GPS placeholder | P2 | P2-GPS | Eng |
| G16 | Map stub | P2 | P2-GPS | Eng |
| G17 | Health Connect live bind | P2 | P2-CORE | Eng + device HUMAN |
| G18 | Dashboard i18n | P2 | P2-CORE | Eng |
| G19 | Social persistence conservative | P2 | P5-SOCIAL | Eng |
| G20 | Squad OS absent | P2 | P6-SQUAD | Eng |
| G21 | Wear tests / AVD / physical | P2 | P7 + HUMAN | Eng + HUMAN |
| G22 | Lighthouse / TalkBack / battery | P2 | P8 | Eng + HUMAN |
| G23 | Crashlytics/Sentry production | P2 | P9 + HUMAN | Eng + HUMAN |
| G24 | Signing / Play / store assets | P2 | P10–P12 | HUMAN |
| G25 | Expo frozen drift | Info | never revive | — |
| G26 | Stories/Reels/landing film | Info | after v1 | — |

P0 rows **block** any claim of production or Social/Squad start.
