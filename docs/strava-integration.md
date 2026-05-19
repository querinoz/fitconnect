# FitConnect × Strava Integration

Production-grade Strava API v3 integration for multi-sport athlete tracking and coach marketplace flows.

## Architecture

```
Athlete UI → OAuth / Sync API → @fitconnect/strava-integration (typed client)
                                      ↓
                              Prisma (StravaConnection, StravaActivity, laps, streams)
                                      ↓
                         Webhook → QStash → /api/v1/jobs/strava-sync
                                      ↓
                         Readiness recalc + Convex realtime (athlete:* channels)
```

## Packages

| Package | Role |
|---------|------|
| `@fitconnect/types` | `StravaSportType` (55 sports), `SportTypeConfig`, shared DTOs |
| `@fitconnect/strava-integration` | OAuth helpers, `StravaClient`, Zod schemas, polyline decoder, webhook parser |
| `apps/web/lib/integrations/strava/service.ts` | Prisma persistence, token encryption, sync orchestration |

## Sport types

All 55 Strava `sport_type` values are defined in `packages/types/src/strava.ts` with PT labels and category icons.

Legacy `type` field is preserved as `legacyType` on `StravaActivity`.

## OAuth scopes

```
read, activity:read, activity:read_all, profile:read_all
```

Optional later: `activity:write` for logging prescribed workouts back to Strava.

## Environment variables

```env
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_WEBHOOK_VERIFY_TOKEN=fitconnect-dev
STRAVA_TOKEN_ENCRYPTION_KEY=   # optional AES-256-GCM for tokens at rest
QSTASH_TOKEN=                  # optional async webhook jobs
```

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/integrations/strava/connect` | GET | Start OAuth |
| `/api/v1/integrations/strava/callback` | GET | OAuth callback + initial sync |
| `/api/v1/integrations/strava/sync` | POST | Manual sync |
| `/api/v1/integrations/strava/webhook` | GET/POST | Strava push subscription |
| `/api/v1/jobs/strava-sync` | POST | Background worker (webhook/manual) |
| `/api/v1/integrations/strava/coach` | GET | Coach roster activity feed |
| `/api/v1/integrations/status` | GET | Dashboard integration status |

## tRPC (`strava.*`)

| Procedure | Type | Description |
|-----------|------|-------------|
| `strava.status` | query | Connection + last sync |
| `strava.activities` | query | Paginated activity list |
| `strava.activity` | query | Single activity + streams |
| `strava.sync` | mutation | Trigger manual sync |

## Webhooks

Register once per environment:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=$STRAVA_CLIENT_ID \
  -F client_secret=$STRAVA_CLIENT_SECRET \
  -F callback_url=https://fitconnect-phi.vercel.app/api/v1/integrations/strava/webhook \
  -F verify_token=$STRAVA_WEBHOOK_VERIFY_TOKEN
```

Events handled:

- `activity:create` → fetch full activity + streams → upsert → readiness
- `activity:update` → re-fetch activity
- `activity:delete` → soft-delete in DB
- `athlete:delete` (deauthorize) → mark connection deauthorized

Athlete resolution uses `StravaConnection.stravaAthleteId` (fixes prior `strava-{owner_id}` mismatch).

## Rate limits

Client respects HTTP 429 with exponential backoff. Parse `X-RateLimit-Usage` / `X-RateLimit-Limit` headers via `parseRateLimitHeaders`.

**Strategy:** webhook-first; lazy-load streams on coach detail view; paginate historical sync on connect only.

## Maps

Routes render via `StravaActivityMap` (SVG polyline preview, no SDK). Full Mapbox integration available on community map when `NEXT_PUBLIC_MAPBOX_TOKEN` is set.

## Tests

```bash
pnpm --filter @fitconnect/strava-integration test
```

## Multi-source

Strava activities coexist with Garmin, Apple Health, Whoop via `WearableProvider` enum. Dashboard `IntegrationsHub` shows Strava alongside other providers; readiness merges load from Prisma activities.

---

*FitConnect · Strava integration · May 2026*
