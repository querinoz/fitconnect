# Phase 12 — Production Hardening Report

## Environment checklist

| Variable | Production value | Risk if wrong |
|----------|------------------|---------------|
| `NEXT_PUBLIC_DEMO_MODE` | unset or `false` | Open auth bypass |
| `NEXT_PUBLIC_SUPABASE_URL` | set | Auth 503 / demo fallback |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | set | Auth broken |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Privilege escalation if leaked |
| `DATABASE_URL` | set | In-memory data loss |
| `STRAVA_CLIENT_SECRET` | set | OAuth failure |
| `STRIPE_SECRET_KEY` | set for payments | Demo payments only |
| `INTEGRATION_AUTH_SECRET` | strong random | Job auth bypass |
| `QSTASH_TOKEN` | set | Webhook abuse |

## Web hardening

- [x] Demo mode fail-closed (`=== "true"`)
- [x] Middleware auth on protected prefixes
- [x] `requireAthleteId` anti-IDOR
- [x] Strava cookie binding
- [ ] Rate limiting all sensitive routes
- [ ] All API routes audited for `requireAuth`
- [ ] RLS live verification
- [ ] Stripe live-only in prod
- [ ] Security headers (CSP, etc.) — review `next.config`

## Android hardening

- [x] `allowBackup=false`
- [x] Cleartext denied (release)
- [x] ANONYMOUS no app shell
- [x] Account isolation on logout/switch
- [x] Debug-only demo credentials
- [x] R8 release minify (Phase 11)
- [ ] Production IdP (Supabase PKCE)
- [ ] Certificate pinning
- [ ] Play Integrity
- [ ] Verified App Links

## Ops

- [ ] Secret rotation runbook
- [ ] Dependabot / audit CI
- [ ] WAF / DDoS (Vercel)
- [ ] Incident response contact
- [ ] SBOM export

## Deploy gates (recommended)

1. `NEXT_PUBLIC_DEMO_MODE` not `true` in Vercel production
2. Android release uses `allowLocalCoachElevation = false` (via `!isDebuggable`)
3. Smoke test auth + IDOR rejection on staging
4. Manual sign-off on `PHASE_12_FINAL_QA.md`

## Verdict

Phase 12 ships **client and API fail-closed defaults**. Production hardening **incomplete** until IdP, RLS live audit, Stripe live, and pen-test debt closed.
