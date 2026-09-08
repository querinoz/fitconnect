# P1-DATA â€” Schema Reconciliation

**Date:** 2026-09-01
**Supabase project:** `beuiammeedpovdkmhluw`
**Canonical schema version:** `016` (`data_schema_meta`)

---

## 1. What Prisma is used for

Prisma (`prisma/schema.prisma`) is **privileged server/admin only**:

| Model group | Purpose | User JWT? |
|-------------|---------|-----------|
| `StravaConnection`, `StravaActivity`, laps/efforts | OAuth token vault + ingestion cache | No |
| `Session`, `Program` | Coaching calendar (not fitness `activities`) | No (admin/demo) |
| `User`, `AthleteProfile`, `CoachProfile` | Legacy demo dashboard (`externalId` like `a-ines`) | **Must not** authorize mobile |
| `PushToken`, `ProcessedStripeEvent` | Server jobs | No |
| `ReadinessSnapshot` on profile | Denormalized demo | Deprecated for product |

**Product SoT:** Supabase SQL migrations `012`â€“`016` + RLS + `@fitconnect/types/canonical.ts`.

---

## 2. Schema eras

| Era | Migrations | Identity | Status |
|-----|------------|----------|--------|
| Legacy Supabase Auth | `001`â€“`011` | `profiles.id` uuid â†’ `auth.users` | Deprecated â€” kept for backfill |
| Firebase identity | `012` | `identity_profiles`, `firebase_uid()` | **Canonical** |
| P0 security | `013` | FORCE RLS, account deletion | Active |
| Social + ASCEND | `014` | Firebase UID community/squad/ascend | Active |
| Stripe | `015` | Firebase UID payments | Active |
| P1 canonical | `016` | `activities`, readiness, badges, events | **Target SoT** |

---

## 3. Major conflicts

### Identity

| Issue | Legacy | Canonical |
|-------|--------|-----------|
| User key | uuid (`profiles`) | text Firebase UID (`identity_profiles.id`) |
| RLS function | `auth.uid()` | `firebase_uid()` |
| Prisma User | cuid | Not product identity |
| Demo web athlete | `a-ines` (externalId) | Must map to Firebase UID in prod |

### Activity (fitness)

| Issue | Legacy | Canonical |
|-------|--------|-----------|
| Table | `workout_sessions` (uuid `user_id`) | `activities` (text `user_id`) |
| Name collision | Prisma `Session` = coaching | `activities` = fitness |
| Strava barrier | `provider <> 'STRAVA'` (case-sensitive) | `upper(provider) <> 'STRAVA'` |
| Web API | `/api/v1/workout-sessions` â†’ `activities` âœ… | Dashboard `db/repository.ts` â†’ Prisma âŒ |

### Readiness

| Store | Key | Status |
|-------|-----|--------|
| `readiness_scores` | uuid athlete | Legacy |
| Prisma `ReadinessSnapshot` | externalId | Demo |
| `readiness_snapshots` | Firebase UID | **Canonical** |
| Formula | `@fitconnect/utils` `utils-v1` | Documented â€” do not silently change |

### ASCEND

| Store | Idempotency | Status |
|-------|-------------|--------|
| `ascend_events` | PK `(user_id, event_id)` | **Canonical** |
| `ascend_progress.badges` jsonb | Legacy array | Migrate to `user_badges` |
| Web Zustand `gamification/store.ts` | None | LOCAL_DEMO only |
| Android `AscendStore` | In-memory | Engine only â€” must emit DB events |

### Social / Squad

| Layer | Status |
|-------|--------|
| SQL `014` posts/reactions/squad | Canonical persistence |
| SQL `020` Strava-never-social | `provider_id` + generated `is_social_eligible` + CHECK + RLS on `community_posts` / reactions / comments |
| Web `server-posts.ts` / `data.ts` | In-memory seed — **not wired** |
| Stories/Reels | Not in scope |
| Prisma | **No** `CommunityPost` model — do not add; dual-schema SoT stays Supabase SQL |

**020 dual-schema rule:** Prefer additive Supabase SQL for community_* barriers. Prisma remains privileged server (Strava OAuth vault / coaching). Inventing a Prisma social model would fork identity and skip RLS.

### Notifications / Devices

| Legacy | Canonical |
|--------|-----------|
| `notifications` (uuid) | `user_notifications` (Firebase UID) |
| `push_tokens` (uuid) | `connected_devices` (`device_kind=fcm`) |

### Coaching / Payments

| Area | Conflict |
|------|----------|
| Session status enums | Prisma vs SQL vs TS domain casing |
| Subscription `plan_id` default | Prisma `"pro"` vs SQL `"athlete"` |
| Payments | `008 transactions` dropped â†’ `015 payment_transactions` |

---

## 4. Cross-platform alignment

| Contract | SQL | TS | Android |
|----------|-----|-----|---------|
| Activity units | `distance_m`, `duration_ms`, `calories_kcal` | `ACTIVITY_UNITS` | `WorkoutSession` KDoc |
| Sport enum | `sport text` | `CanonicalSport` | `Sport` enum |
| Provider | `provider text` | policy helpers | `ProviderId` |
| Shareable | GENERATED column | `workout-session-policy.ts` | `ProviderConstraints` |
| Community social eligible | `020` `is_social_eligible` | `community-social-policy.ts` | N/A (SQL SoT) |

**Gaps:** community/squad/payments TS types not yet in `canonical.ts` (extend in 017+).

---

## 5. Resolution plan

| Step | Migration / action |
|------|-------------------|
| 1 | Declare SoT: `016` + `canonical.ts` (done) |
| 2 | Apply `016` on all envs (done on dev project) |
| 3 | Rewire web dashboard off Prisma athlete path | P1-AUTH or data follow-up |
| 4 | Backfill `workout_sessions` â†’ `activities` | `017_backfill_activities.sql` when refs zero |
| 5 | Wire community web to `014` tables | P5-SOCIAL |
| 6 | Drop uuid legacy tables | Only after proven zero writers |
| 7 | Prisma scope guard in CI | Block user-scoped Prisma reads in `/api/v1/*` |

---

## 6. Files reference

| Path | Role |
|------|------|
| `supabase/migrations/016_p1_data_canonical.sql` | Canonical DDL |
| `supabase/migrations/020_community_strava_never_social.sql` | Community Strava-never-social (additive) |
| `packages/types/src/canonical.ts` | Cross-platform contracts |
| `packages/types/src/domain.ts` | Legacy â€” deprecate importers |
| `prisma/schema.prisma` | Privileged server |
| `apps/web/lib/fitness/workout-session-policy.ts` | RLS mirror |
| `apps/web/lib/community/community-social-policy.ts` | Community Strava barrier mirror |
| `apps/web/lib/db/repository.ts` | **Conflict** â€” Prisma dashboard |
| `android/core/fitness/.../Models.kt` | Android fitness domain |
