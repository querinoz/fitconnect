# Phase 12 — Database Security Report

## Stores

| Store | Path | Auth model |
|-------|------|------------|
| Prisma / Postgres | `prisma/schema.prisma` | Application-level (server routes) |
| Supabase SQL | `supabase/migrations/*.sql` | RLS enabled on tables |
| Android local | DataStore, MMKV, EncryptedSharedPreferences | Device-bound, no multi-tenant server |

## Prisma

- 19+ models: `User`, `Athlete`, `Coach`, `StravaToken`, `Session`, `Readiness`, etc.
- **No row-level security in Prisma** — all enforcement must occur in application code or Postgres policies if using Supabase client directly.
- `StravaToken` stores encrypted tokens (see strava-integration package) — verify `DATABASE_URL` never logged.

## Connection security

- Production: TLS to Supabase/Postgres (`DATABASE_URL`, `DIRECT_URL`)
- Missing `DATABASE_URL`: in-memory fallback in dev — **must not ship to prod**

## Sensitive columns

| Model / table | Field | Notes |
|---------------|-------|-------|
| `StravaToken` | access/refresh | Encrypted at app layer |
| `PushToken` | device token | User-scoped |
| `User` | email | PII |

## Application controls

- Web API binds queries to authenticated `user.id` via `requireAthleteId`
- Android telemetry/athlete data keyed by local session user ID

## Gaps

| Gap | Risk |
|-----|------|
| Dual schema (Prisma + Supabase migrations) | Policy drift |
| Service role bypasses RLS | Over-privileged server jobs |
| No column-level encryption except Strava tokens | DB dump exposes PII |
| Backup encryption | Provider-dependent (Supabase/Vercel) |

## Recommendations

1. Single schema source of truth (Prisma-only target per CLAUDE.md)
2. Never expose Supabase service role to client
3. Migrate to Supabase RLS policies matching `requireAthleteId` semantics
4. Audit Prisma queries for raw `athleteId` from request without auth check

## Verdict

Database security **depends on application auth** today. RLS enabled in SQL migrations but **live policy verification pending** — see `RLS_AUDIT.md`.
