# Rollback plans — critical production paths

## Stripe webhooks

**Disable processing without redeploy:**
```bash
STRIPE_WEBHOOK_PROCESSING=false
```

**Revert code:** restore previous `apps/web/app/api/stripe/webhook/route.ts` ack-only handler.

**DB cleanup (if bad events processed):**
```sql
DELETE FROM "ProcessedStripeEvent" WHERE "processedAt" > NOW() - INTERVAL '1 hour';
```

## Auth / Supabase

**Enable demo mode fallback:**
```bash
NEXT_PUBLIC_DEMO_MODE=true
```

**Revert middleware:** restore `apps/web/middleware.ts` from previous release tag.

## Strava token refresh

**Disable proactive refresh:**
```bash
STRAVA_PROACTIVE_REFRESH=false
```

**Fallback:** existing tokens in `StravaConnection` table remain; manual reconnect via `/api/v1/integrations/strava/connect`.

## Motion / landing

**Force full motion for all users (emergency):**
```javascript
localStorage.setItem('fitconnect:motion', 'full');
document.documentElement.dataset.motion = 'full';
```

## CI / deploy

**Block bad deploy:** Vercel instant rollback to previous deployment in dashboard.

**Smoke gate:** `pnpm smoke -- https://your-domain` must return PASS before traffic shift.
