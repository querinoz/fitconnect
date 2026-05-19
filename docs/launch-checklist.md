# FitConnect Launch Checklist

## Pre-deploy verification

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm test` — all unit tests pass
- [ ] `pnpm build` — production build succeeds
- [ ] Lighthouse mobile on production URL (LCP < 2.5s target)

## Environment (Vercel)

- [ ] `DATABASE_URL` — Neon PostgreSQL
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` for production smoke
- [ ] `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_WEBHOOK_VERIFY_TOKEN`
- [ ] `STRAVA_TOKEN_ENCRYPTION_KEY`, `STRAVA_OAUTH_STATE_SECRET`
- [ ] `QSTASH_TOKEN` — protects `/api/v1/jobs/strava-sync`
- [ ] `INTEGRATION_AUTH_SECRET` — optional bearer for integration APIs
- [ ] `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_REALTIME_PROVIDER=convex`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- [ ] `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` (optional)

## Strava production

- [ ] Run Prisma migration: `pnpm prisma migrate deploy`
- [ ] Register webhook: `node scripts/register-strava-webhook.mjs https://fitconnect-phi.vercel.app/api/v1/integrations/strava/webhook`
- [ ] OAuth connect flow end-to-end (connect → callback → dashboard)
- [ ] Webhook creates activity → QStash job → sync → readiness update
- [ ] Strava attribution visible on map/cards ("Powered by Strava")

## Landing & conversion

- [ ] PT-PT default (`lang="pt"`, hero SSR)
- [ ] Hero CTAs: Demo → Signup → Coach
- [ ] PostHog funnel: `landing_view → demo_open → discover_view → book_intro → signup`
- [ ] Email capture hero → `/api/v1/leads`

## Post-launch smoke

- [ ] `/discover` — featured coaches badge
- [ ] `/dashboard?demo=1` — readiness dial + Strava integrations
- [ ] `/mobile` — live demo parity with hero CTA
- [ ] PWA install prompt on landing + discover
