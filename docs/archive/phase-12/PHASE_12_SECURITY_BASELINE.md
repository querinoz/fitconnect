# Phase 12 — Security Baseline

**Date:** 2026-08-08  
**Scope:** FitConnect coaching SaaS — Next.js web (`apps/web/`) + native Android Kotlin/Compose (`android/`).  
**Prior phase:** Phase 11 (performance) complete; security hardening is Phase 12.

## Objective

Establish fail-closed defaults for auth, authorization, account isolation, health/telemetry privacy, AI tool boundaries, and network posture before production users or Play Store submission.

## Controls shipped in Phase 12

| Area | Control | Primary path |
|------|---------|--------------|
| Android account isolation | Clear SyncQueue + session on logout/switch | `android/foundation/.../AccountIsolationController.kt` |
| Android local auth | No ADMIN from email; coach elevation debug-only | `android/foundation/.../LocalAuthRepository.kt` |
| Android RBAC | ANONYMOUS stripped from `ACCESS_APP_SHELL` / Athlete OS | `android/foundation/.../Authorization.kt` |
| Android nav | HOME requires `ACCESS_APP_SHELL`; deep links force HOME | `android/foundation/.../NavGuard.kt` |
| Android debug surface | Demo credentials UI only when `isDebuggable` | `android/app/.../FitConnectNavHost.kt` |
| Android network | Cleartext denied; debug overlay for loopback | `android/app/src/main/res/xml/network_security_config.xml` |
| Android backup | `allowBackup=false` + exclude-all rules | `android/app/src/main/AndroidManifest.xml` |
| AI authz | Athlete SELF tools require explicit self target | `android/ai/.../AiPermissionGate.kt` |
| AI runtime | Bind self before authz | `android/ai/.../AiToolRuntime.kt` |
| Health AI | Consent default false (fail-closed) | `android/ai/.../HealthDataPolicy.kt` |
| Telemetry | `shareWithCoach` requires `actorId == athleteId` | `android/telemetry/.../TelemetryPrivacy.kt` |
| Web demo mode | `=== "true"` only | `apps/web/lib/auth/supabase/client.ts`, `middleware-auth.ts` |
| Web IDOR | `requireAthleteId` binds to `auth.user.id` | `apps/web/lib/api/require-auth.ts` |
| Strava integration | Cookie required; param mismatch rejected | `apps/web/lib/integrations/strava/route-auth.ts` |

## Verification status

| Layer | Status |
|-------|--------|
| Unit tests (auth, nav, AI) | Present — see `PHASE_12_FINAL_QA.md` |
| Web auth/IDOR tests | `apps/web/lib/api/require-auth.test.ts`, `middleware-auth.test.ts` |
| Device pen-test / CI fuzz | **Not run** — documented as debt |
| Live Supabase RLS | **Needs continued audit** when DB is live |

## Residual risks (honest)

- `LocalAuthRepository` is a dev adapter, not a production IdP — **must replace before Play Store**.
- Local tokens are forgeable on rooted devices; isolation + authz reduce but do not eliminate impact.
- Web RLS/Supabase policies need re-audit when production DB is wired.
- Stripe flows still largely demo (`apps/web/lib/stripe/demo/`).
- Full E2E pen-test on physical device not run in CI.

## Gate

Phase 12 documentation and code hardening complete; **gate verification pending** — see `PHASE_12_FINAL_QA.md`. Do not advance to Phase 13 without human approval.
