# P1-DATA â€” Architecture

**Date:** 2026-09-01
**Project:** `beuiammeedpovdkmhluw`
**Schema version:** `016` (`data_schema_meta.schema_version`)

## Identity path (canonical)

```
Firebase Auth
     â†“
Firebase UID (text JWT sub)
     â†“
identity_profiles.id
     â†“
Supabase Postgres + RLS (firebase_uid())
```

Legacy `public.profiles` (uuid â†’ `auth.users`) is **not** the product identity path.

Prisma `User` (cuid) is **privileged server/admin only** â€” never authorizes mobile/web user ops.

## Cross-platform topology

```
                    FITCONNECT DOMAIN
                           â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â†“            â†“            â†“
           Android         Web         Wear
         (athlete OS)   (dashboard)  (companion)
              â”‚            â”‚            â”‚
              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â†“
              Supabase Postgres (beuiammeedpovdkmhluw)
                           â”‚
                           â†“
                    RLS (firebase_uid())
                           â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
     â†“          â†“          â†“          â†“          â†“
  Profile   Activity   Readiness   ASCEND    Squad/Social
              â”‚
        â”Œâ”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”
        â†“     â†“     â†“
      GPS  Telemetry Health Connect
        â”‚
        â†“
   Performance â†’ XP â†’ Badge â†’ Streak
```

Privileged server overlay (not in client path): Prisma â†’ Strava tokens, Stripe webhooks, coaching admin.

## Master data diagram

```
                    FITCONNECT DOMAIN (Postgres + RLS)
                                 â”‚
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â†“                       â†“                       â†“
      Android                  Web                    Wear
   (FitnessProvider)      (API + RLS client)      (companion)
         â”‚                       â”‚                       â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â†“
                    Supabase Postgres (beuiammeedpovdkmhluw)
                                 â”‚
                                 â†“
                          firebase_uid() RLS
                                 â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â†“            â†“               â†“               â†“            â†“
Identity    Activity        Readiness         ASCEND      Squad/Social
(profile)   (activities)    (snapshots)    (xp/badges)   (posts/squad)
    â”‚            â”‚               â”‚               â”‚            â”‚
    â”‚      â”Œâ”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”         â”‚          XP â†’ Badge â†’ Streak
    â”‚      â†“           â†“         â”‚               â”‚
    â”‚   Telemetry    GPS         â”‚               â†“
    â”‚   (columns)  (route pts)    â”‚         Notifications
    â”‚      â”‚           â”‚         â”‚
    â””â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€ domain_events (event_id bus)
```

Prisma (privileged): Strava tokens, coaching Session, Stripe jobs â€” **not** in diagram above.

## Domain graph

```
USER (Firebase UID)
  â””â”€â”€ PROFILE (identity_profiles)
        â”œâ”€â”€ ROLE (user_roles: athlete|coach; admin server-only)
        â”œâ”€â”€ PREFERENCES / ONBOARDING
        â”œâ”€â”€ ATHLETE|COACH product rows (legacy uuid athlete_profiles / coach_profiles â€” deprecate carefully)
        â”œâ”€â”€ ACTIVITY (activities) â† canonical ID
        â”‚     â”œâ”€â”€ TELEMETRY (columns + telemetry jsonb)
        â”‚     â””â”€â”€ ROUTE (activity_route_points â€” P2-GPS fills)
        â”œâ”€â”€ READINESS (readiness_snapshots; formula @fitconnect/utils)
        â”œâ”€â”€ ASCEND (ascend_progress + ascend_events + badge_definitions/user_badges)
        â”œâ”€â”€ SQUAD (squad_challenges / members / contributions)
        â”œâ”€â”€ SOCIAL (community_posts / post_reactions) â€” v1 only
        â”œâ”€â”€ NOTIFICATIONS (user_notifications)
        â”œâ”€â”€ DEVICES (connected_devices)
        â””â”€â”€ DOMAIN_EVENTS (cross-platform event_id bus)
```

## Providers / devices

| Surface | Role |
| --- | --- |
| Health Connect | Data core via `FitnessProvider` |
| Watch | Companion; lease via `SessionOwnership`; must reconcile to `activities.id` |
| Strava | Own-athlete only; `shareable = false` when provider = STRAVA |
| FCM | `connected_devices.device_kind = fcm` (tokens never logged) |
| Realtime | Event names on `domain_events`; Convex prod path is P3 |

## Units (storage)

| Field | Unit |
| --- | --- |
| distance | meters (`distance_m`) |
| duration | milliseconds (`duration_ms`) |
| elevation | meters |
| heart rate | bpm |
| calories | **kcal** (not kJ) |
| timestamps | `timestamptz` UTC |

UI may convert. Streak day boundaries use `identity_profiles.timezone` / `user_preferences.timezone`.

## Privileged vs user-scoped

| Path | Access |
| --- | --- |
| Browser / Android Data API | `authenticated` + RLS |
| Web server progression with user JWT | RLS client |
| Prisma / service_role / admin | Server jobs only; never IDOR evidence |
| Strava tokens | Encrypted server / Android Keystore â€” not in `connected_devices` |

## Explicit non-goals (this phase)

- Stories / Reels tables
- Redesign ASCEND scoring (P4)
- Real GPS capture (P2-GPS)
- Dropping legacy uuid tables without proven unused refs
