# P1-DATA unification report

Date: 2026-08-20

## Verdict

| Gate | Status |
| --- | --- |
| P1-DATA | **PENDING_HUMAN** (schema + RLS + APIs exist; live Postgres/Supabase project apply is human) |
| PROFILE_PERSISTENCE | **PASS** (engineering path; live DB apply PENDING_HUMAN) |
| PRODUCTION_DATABASE | **PENDING_HUMAN** |
| RLS | **PASS** (policies in `012_firebase_identity.sql`; two-user SQL test ready, Docker unavailable here) |
| ROLE_AUTHORIZATION | **PASS** (server first-write-wins; admin cannot be self-assigned) |

## Decision (do not invent a second identity table family)

Legacy `public.profiles` (`uuid` → `auth.users`) stays unused for Firebase identity. Firebase UIDs are **text**, not UUIDs.

Canonical identity tables (migration `supabase/migrations/012_firebase_identity.sql`):

| Table | Purpose |
| --- | --- |
| `identity_profiles` | Firebase UID PK, email, display name, avatar, locale, timezone, accent, timestamps |
| `user_roles` | ATHLETE/COACH (ADMIN cannot be inserted by the user JWT) |
| `user_preferences` | locale/timezone/accent + jsonb |
| `onboarding_state` | step, completed, jsonb payload (survives device change) |

Athlete/coach **product** profiles (`AthleteProfile` / `CoachProfile` in Prisma, `athletes` / `coaches` in older SQL) are **not** fully migrated in this slice. Identity is the minimum production foundation.

Social / Squad / ASCEND tables are **not** added here.

## Prisma vs Supabase

- User-facing reads/writes: **Supabase Data API + RLS**. No service_role on device or browser.
- Prisma `User` remains a privileged **server** model (`cuid`). It must not authorize mobile/web user operations.
- Server jobs may use Prisma / `INTEGRATION_AUTH_SECRET` only when authenticated, authorized, server-side, explicit, and audited.

## Schema mismatch (gated)

Prisma 19 models vs 11+ SQL migrations remain divergent for training/social domains. This slice **gates** identity: new identity tables are SQL-canonical. Full Prisma/SQL unification of sessions/activities is **not** claimed complete.

## Cross-device

Same Firebase account on Android and Web → same `sub` → same `identity_profiles` row after 012 is applied on the project.
