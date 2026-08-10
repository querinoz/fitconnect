# Phase 12 — Secrets Audit

## Secret categories

| Secret | Location | Client exposure |
|--------|----------|-----------------|
| Supabase anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (expected) |
| Supabase service role | `SUPABASE_SERVICE_ROLE_KEY` | **Server only** |
| Strava client secret | `STRAVA_CLIENT_SECRET` | Server only |
| Stripe secret | `STRIPE_SECRET_KEY` | Server only |
| Integration auth | `INTEGRATION_AUTH_SECRET` | Server + bearer jobs |
| QStash | `QSTASH_TOKEN` | Server/webhook |
| LiveKit | `LIVEKIT_API_SECRET` | Server only |
| Database | `DATABASE_URL` | Server only |

## Android local storage

- `EncryptedSharedPreferences` / `SecureStore` — session tokens
- **Must not embed** API secrets in APK (verify `BuildConfig`, `local.properties`)

## Phase 12 AI scrubbing

`HealthDataPolicy` redacts: `access_token`, `refresh_token`, `api_key`, `client_secret`, `Bearer `, `password=`

## Git / repo hygiene

| Check | Status |
|-------|--------|
| `.env` in `.gitignore` | Verify per deploy |
| No secrets in CLAUDE.md | PASS (placeholders only) |
| Android `google-services.json` | If present — restrict |
| Strava token encryption | strava-integration package |

## Findings

| ID | Severity | Finding |
|----|----------|---------|
| S1 | High | Default Strava verify token documented as `fitconnect-dev` — change in prod |
| S2 | Medium | Demo mode bypasses real auth — env discipline required |
| S3 | Low | Debug network cleartext — dev only |

## Recommendations

1. Vercel/env: rotate all secrets before go-live
2. Secret scanning in CI (gitleaks/trufflehog)
3. Android: no `STRAVA_*` in client; OAuth via web or custom tab

## Verdict

**No new secrets committed in Phase 12 scope.** Production deploy requires **env checklist** and **rotation** — see `PRODUCTION_HARDENING_REPORT.md`.
