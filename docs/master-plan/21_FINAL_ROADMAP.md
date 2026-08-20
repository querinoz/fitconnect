# 21 — Final roadmap

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

Execute **one phase per command**. Do not skip P0-SEC.

## P0-DOCS (this command)

Write `docs/master-plan/00`–`23`. Stop. No product diffs.

## P0-SEC

1. Block Strava from third parties (service + UI + SQL)
2. Align web allowlist with Android
3. Re-close/verify `/api/v1/integrations/status`
4. RLS audit + two-user IDOR on Postgres
5. Account deletion
6. Terms/Privacy real URLs
7. Webhook/job fail-closed
8. Real rate limiting

## P1-DATA

One Postgres truth: USER PROFILE ACTIVITY WORKOUT XP BADGE SQUAD SOCIAL READINESS TELEMETRY  
Prisma mapped to the **same** tables + RLS. Two-user IDOR required.

## P1-AUTH

CI production-like → `DEMO MODE = FALSE` on that job → real auth contract.  
Prepare Supabase third-party + Firebase + Google + Apple-later. No secrets in chat.

## P2-CORE-UX

Athlete Today, Analysis, Readiness, Health Connect live, Coach production data, real state not demo.

## P2-GPS

FusedLocation + Foreground Service + route recording + persistence + permissions + offline.

## P3-REALTIME

Convex canonical app events; Supabase presence/chat; remove Broadcast as production default.

## P4-ASCEND

One progression domain (Android engine wins; web consumes API).

## P5-SOCIAL

V1 only: profiles, posts, photos, comments, reactions, performance sharing, community, privacy, realtime.  
**No** Stories/Reels.

## P6-SQUAD

After social persistence + privacy + realtime.

## P7-WATCH

Unit tests → emulator → phone↔wear → physical HUMAN.

## P8

Lighthouse prod, TalkBack, 200% font, recomposition, battery, startup, maps, animation.

## P9

Crashlytics, Sentry/PostHog if kept, production observability.

## P10-HUMAN-INFRA

Signing → Supabase → Firebase → FCM → Google → Apple (future) → Play → Legal → Store assets.

## P11-QA

Full matrix (see `15`). FINAL GO/NO-GO.

## P12

RC → Play Internal → Closed Testing → Final QA → Production.
