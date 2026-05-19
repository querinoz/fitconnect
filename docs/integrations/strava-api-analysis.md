# FitConnect × Strava API Integration Analysis

**Project:** FitConnect — verified specialist coaching marketplace with readiness (HRV/sleep), coach-athlete loops, multi-sport sessions, and live session telemetry.  
**Reference:** [Strava API v3](https://developers.strava.com/docs/reference/)

---

## 1. Core API Selection & Use Cases

### Activities (primary)

| Endpoint | Why we need it | Critical fields |
|----------|----------------|-----------------|
| `GET /athlete/activities` | Initial sync + paginated history for coach review & load modeling | `id`, `name`, `type`, `start_date_local`, `distance`, `moving_time`, `elapsed_time`, `average_heartrate`, `max_heartrate`, `suffer_score`, `total_elevation_gain` |
| `GET /activities/{id}` | Webhook-triggered detail fetch after `activity.create` | `id`, `type`, `workout_type`, `average_watts`, `weighted_average_watts`, `device_watts`, `laps`, `splits_metric` |
| `POST /activities` | Log coach-prescribed sessions completed offline (optional write-back) | `name`, `type`, `start_date_local`, `elapsed_time`, `description` |
| `PUT /activities/{id}` | Update title/visibility after coach review | `name`, `description`, `trainer`, `commute` |

### Athletes

| Endpoint | Why we need it | Critical fields |
|----------|----------------|-----------------|
| `GET /athlete` | OAuth bootstrap — map Strava athlete → FitConnect athlete | `id`, `firstname`, `lastname`, `city`, `country`, `measurement_preference` |
| `GET /athletes/{id}/stats` | Dashboard KPIs (YTD run/ride totals, biggest climb) | `ytd_run_totals`, `ytd_ride_totals`, `recent_run_totals` |

### Streams (high value for coach dashboard)

| Endpoint | Why we need it | Critical fields |
|----------|----------------|-----------------|
| `GET /activities/{id}/streams` | Live-style replay: HR, pace, power, cadence curves | `time`, `heartrate`, `velocity_smooth`, `watts`, `cadence`, `altitude` |

### Segment efforts (competition / PR moments)

| Endpoint | Why we need it | Critical fields |
|----------|----------------|-----------------|
| `GET /activities/{id}/laps` | Interval structure for coach plan verification | `lap_index`, `distance`, `moving_time`, `average_heartrate` |
| `GET /segment_efforts/{id}` | PR celebrations (aligns with FitConnect achievement overlay) | `id`, `name`, `elapsed_time`, `pr_rank`, `kom_rank` |
| `GET /segments/{id}` | Segment context on map/community features | `name`, `distance`, `average_grade`, `climb_category` |

### Routes & clubs (phase 2)

| Endpoint | Why we need it | Critical fields |
|----------|----------------|-----------------|
| `GET /athletes/{id}/routes` | Coach assigns route-based sessions (cycling/running) | `id`, `name`, `distance`, `elevation_gain`, `map` |
| `GET /clubs/{id}/activities` | Community tab — group training feed | `id`, `name`, `type`, `distance` |

### Gear

| Endpoint | Why we need it | Critical fields |
|----------|----------------|-----------------|
| `GET /athlete/shoes` / `GET /gear/{id}` | Injury prevention — shoe mileage alerts | `id`, `name`, `distance`, `primary` |

### Webhooks (mandatory for production)

| Endpoint | Why we need it | Critical fields |
|----------|----------------|-----------------|
| `POST /push_subscriptions` | Register webhook — avoid polling rate limits | `callback_url`, `verify_token` |
| `GET /push_subscriptions` | Ops monitor | `id`, `created_at` |
| `DELETE /push_subscriptions/{id}` | Teardown | — |

**Webhook events:** `create`, `update`, `delete` on `activity`; `update` on `athlete`.

---

## 2. End-to-End User Flow & Integration Pipeline

```
1. Authentication
   Athlete taps "Connect Strava" → GET /api/v1/integrations/strava/connect
   → Redirect to Strava OAuth (scopes below)
   → Callback /api/v1/integrations/strava/callback
   → Store access + refresh tokens on WearableConnection

2. Initial sync (on connect)
   GET /athlete → map external ID
   GET /athlete/activities?after={last_sync}&page=1..N
   → Normalize → BiometricSample + session load → ReadinessSnapshot recompute

3. Real-time sync (production)
   Strava POST webhook → /api/v1/ingestion/webhook?provider=strava
   → Validate subscription → enqueue activity_id
   → GET /activities/{id} + GET /activities/{id}/streams
   → Update dashboard IntegrationsHub + coach roster context

4. Coach review loop
   Coach opens athlete profile → sees last 5 Strava activities + readiness
   → AI co-pilot uses distance/HR/load to suggest plan diff

5. Token refresh
   Before any API call: if expires_at < now → POST /oauth/token (refresh_token)
   → Update stored tokens

6. Manual sync (dashboard)
   POST /api/v1/integrations/strava/sync → bounded page fetch (rate-limit aware)
```

---

## 3. Required OAuth Scopes Matrix

| Endpoint / feature | `read` | `read_all` | `profile:read_all` | `activity:read` | `activity:read_all` | `activity:write` |
|--------------------|:------:|:----------:|:------------------:|:---------------:|:-------------------:|:----------------:|
| GET /athlete | ✓ | | ✓ | | | |
| GET /athlete/activities (public) | ✓ | | | ✓ | | |
| GET /athlete/activities (private) | | | | | ✓ | |
| GET /activities/{id}/streams | | | | ✓ | ✓* | |
| POST /activities | | | | | | ✓ |
| GET /athlete/shoes | ✓ | | | | | |
| Webhooks (receive events) | ✓ | | | ✓ | ✓ | |

\*Use `activity:read_all` if coaches must see private activities (recommended for 1:1 coaching).

**FitConnect minimum request (MVP):**  
`read, activity:read, activity:read_all, profile:read_all`

**Optional later:** `activity:write` for logging prescribed workouts back to Strava.

---

## 4. Constraints, Rate Limits, and Webhooks Strategy

### Rate limits ([Strava docs](https://developers.strava.com/docs/rate-limits/))

| Window | Default limit | Impact |
|--------|---------------|--------|
| 15 minutes | 100 requests | Initial sync must paginate slowly; cache activity lists |
| Daily | 1,000 requests | ~100 athletes × 10 calls/day without webhooks = risk |

**Optimization:**
- **Webhooks first** — on `activity.create`, fetch only that activity (+ streams if coach subscribed).
- **Do not poll** `/athlete/activities` on a cron for all users.
- Cache activity summaries in DB; use `If-Modified-Since` where applicable.
- Batch stream fetches only when coach opens session detail (lazy load).

### Webhooks — **YES, required**

Register one subscription per environment pointing to:
`POST https://fitconnect.app/api/v1/ingestion/webhook?provider=strava`

Flow:
1. `GET` verification challenge on subscribe
2. On event → queue job → `GET /activities/{object_id}`
3. Idempotency key = `activity_id + aspect_type`

---

## 5. Summary Recommendation & Next Steps

**Complexity:** Medium-high. OAuth + webhooks + token refresh are standard; stream parsing and multi-sport normalization add effort. FitConnect already has ingestion stubs and Prisma models — **~2–3 sprints** to production-grade Strava.

### Top 3 immediate steps

1. **Configure Strava app** — set `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, callback URL `https://fitconnect-phi.vercel.app/api/v1/integrations/strava/callback`, register webhook subscription.
2. **Persist tokens + activities** — write `WearableConnection` and `BiometricSample` in callback/webhook handlers (replace in-memory store).
3. **Webhook → dashboard pipeline** — on activity create, update `IntegrationsHub` metrics and feed coach roster load alerts.

### Implemented in this repo (MVP)

| Route | Purpose |
|-------|---------|
| `GET /api/v1/integrations/status` | Dashboard API monitor |
| `GET /api/v1/integrations/strava/connect` | OAuth start (demo fallback) |
| `GET /api/v1/integrations/strava/callback` | OAuth callback |
| `POST /api/v1/integrations/strava/sync` | Manual sync |
| `POST /api/v1/integrations/strava/disconnect` | Revoke Strava OAuth + mark deauthorized |
| `GET /api/v1/integrations/strava/endpoints` | Catalog of proxied Strava v3 paths |
| `GET/POST/PUT/DELETE /api/v1/integrations/strava/v3/*` | Authenticated proxy to [Strava API v3 playground](https://developers.strava.com/playground/) |

**Proxied endpoints include:** athlete profile/zones/clubs/activities, athlete stats/routes, activities (CRUD + comments/kudos/laps/zones/streams), clubs, gear, routes (+ GPX/TCX export), segments (explore/starred/streams), segment efforts, uploads.

Dashboard widget: `components/dashboard/integrations-hub.tsx`

---

*FitConnect · Strava integration spec · Q2 2026*
