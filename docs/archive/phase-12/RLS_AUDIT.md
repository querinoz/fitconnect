# Phase 12 — RLS Audit

**Row Level Security** — Supabase Postgres policies in `supabase/migrations/`.

## RLS enabled tables

| Migration | Table(s) |
|-----------|----------|
| `001_auth.sql` | `profiles` |
| `002_coaches.sql` | `coach_profiles` |
| `003_athletes.sql` | `athlete_profiles` |
| `004_sessions.sql` | `sessions` |
| `005_wearables.sql` | `hrv_readings`, `readiness_scores` |
| `006_programs.sql` | `programs`, `program_enrollments` |
| `008_payments.sql` | `stripe_connect_accounts`, `transactions` |
| `007_community.sql` | `community_posts`, `post_reactions` |
| `009_notifications.sql` | `push_tokens`, `notifications` |
| `010_reviews.sql` | `reviews` |

## Audit status

| Check | Status | Notes |
|-------|--------|-------|
| RLS `ENABLE` on tables | PASS (migrations) | Policies defined in same files |
| Policy matches app auth model | **NOT VERIFIED LIVE** | Requires Supabase project + test users |
| Prisma bypasses RLS | **RISK** | Server uses direct connection — app must enforce |
| Admin/service role policies | **NOT REVIEWED** | May be overly broad |
| Coach reads assigned athlete rows | **NOT VERIFIED** | Critical for telemetry/sessions |

## Expected policy patterns (target)

```sql
-- Athlete: auth.uid() = athlete user_id
-- Coach: exists assignment where coach_id = auth.uid()
-- Public: none for health/payment tables
```

## Phase 12 alignment

Web `requireAthleteId` semantics should mirror RLS:

- Athlete: `auth.uid()` only
- Coach: roster join table
- Admin: explicit break-glass role claim

## Test plan (when DB live)

1. Create athlete A, athlete B, coach C (assigned to A only)
2. As A: SELECT own rows — allow; B's rows — deny
3. As C: A's assigned data — allow; B — deny
4. As anon: all — deny

## Verdict

RLS is **declared in migrations** but **not audited against running Supabase**. Treat as **open debt** until live verification. Prisma-direct paths remain outside RLS scope.
