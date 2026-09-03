# Current State Master Matrix

**Date:** 2026-09-02 · **HEAD:** `7ee6811` · **Do not treat untracked files as shipped.**

| DOMAIN | FEATURE | CURRENT STATUS | PLATFORM | SOURCE OF TRUTH | DATA SOURCE | TEST STATUS | SECURITY | DEPENDENCIES | PRIORITY | NEXT ACTION |
|--------|---------|----------------|----------|-----------------|-------------|-------------|----------|--------------|----------|-------------|
| Identity | Firebase UID → profile | PARTIAL | Web/Android | `identity_profiles` | Supabase 012 | Identity RLS 5/5 (2026-09-01) | RLS ON | Firebase config | P0 | Commit P1-DATA; P1-AUTH |
| Role | athlete/coach/admin | PARTIAL | All | `user_roles` | 012 | Role escalation DENY tested | Server-only admin | Auth | P0 | No client self-promote |
| Profile | displayName/avatar/tz | PARTIAL | Web/Android | identity_profiles | SQL + demo | Partial | RLS | Auth | P1 | Cross-platform same UID |
| Athlete | Athlete OS surfaces | PARTIAL | Android | UI + demo catalog | LOCAL_DEMO | Visual tour 1/1 | — | — | P1 | Replace demo data |
| Coach | Coach OS | DEMO | Android/Web | LocalCoachRepository | In-memory | Unit | — | Authz | P1 | Remote repo |
| Activity | Canonical activity | PARTIAL | Web/Android | `activities` (016 untracked) | PG or memory | RLS 3/3 (2026-09-01) | shareable + RLS | 016 commit/apply | P0 | Commit 016 |
| Workout | Guided strength | MISSING | Android | Spec only | 017 untracked | Engine unit only | — | Guided UI | P0/P1 | Wave 2 |
| WorkoutPlan | Weekly plan | PARTIAL | Web/Coach | Demo builder + 017 | Zustand/SQL | — | RLS on 017 | Coach wire | P1 | Persist plans |
| Routine | Weekday template | STUB | — | 017 | SQL | — | RLS | Plan | P1 | Resolver |
| Exercise | Library | PARTIAL | All | Seed ~13–14 | Memory + 017 | Search in engine | Custom RLS | Catalog | P1 | Expand seed |
| ExerciseSet | Set log | MISSING | — | 017 columns | — | — | RLS | Guided UI | P1 | Logger |
| Telemetry | HR/distance/pace | PARTIAL | Android | LiveActivityEngine | SIMULATED | Unit | Private | GPS/HC | P1 | Real sources |
| GPS | Native track | MISSING | Android | EliteCapture STUB | Simulated polyline | Unit sim | Location perm | P2-GPS | P1 | FusedLocation FGS |
| Readiness | Score/HRV/sleep | PARTIAL | Android/Web | utils-v1 + snapshots | Demo + 016 | Unit | Own-only | HC sleep | P1 | Persist snapshots |
| Health | Health Connect | PARTIAL | Android | Exercise+HR readers | HC APK | Mapper unit | Permissions | SDK 1.1.0 | P1 | Sleep/steps/sync |
| XP | ASCEND events | PARTIAL | All | ascend_events vs Zustand vs AscendEngine | Triple | Idempotency RLS | RLS | One event | P1 | Unify |
| Level | Derived from XP | PARTIAL | All | Multiple formulas risk | Dual | Web API tests | — | P4 | P2 | One engine |
| Badge | Definitions + user_badges | PARTIAL | Web | 016 tables vs jsonb 014 | SQL | — | RLS | XP event | P2 | Migrate jsonb |
| Streak | ascend_progress | PARTIAL | All | SQL + Android | Dual | — | TZ | User tz | P2 | One day-boundary |
| Mission | ASCEND missions | PARTIAL | Android | AscendEngine | In-memory | Unit | — | P4 | P2 | Persist |
| Challenge | Squad challenges | PARTIAL | Web | SQL + memory | Dual | — | RLS | Social | P2 | Persist default |
| Squad | Membership/XP | PARTIAL | Web | 014 | Dual | — | RLS | Social v1 | P2 | After social persist |
| Post | Community posts | PARTIAL | Web | 014 vs server-posts | Dual | — | RLS | Auth | P2 | Kill memory in prod |
| Comment/Reaction | v1 | PARTIAL | Web | 014 | Dual | — | RLS | Posts | P2 | Same |
| Follow/Stories/Reels | — | NOT_IMPLEMENTED | — | Out of v1 | — | — | — | — | — | Do not start |
| Booking | Coach sessions | PARTIAL | Web/Prisma/SQL | Dual models | Dual | — | Authz | P1-DATA | P2 | Unify |
| Session | Coaching vs fitness name collision | PARTIAL | All | Prisma Session ≠ activities | — | — | — | Docs | P1 | Keep names distinct |
| Program | Marketplace/coach | PARTIAL | Web/Android | Seed + local | Demo | — | — | Plans | P2 | Persist |
| Notification | FCM + user_notifications | PARTIAL | Android/Web | 016 + FCM | Dual | Mapper unit | Tokens private | google-services | P2 | REST_TIMER later |
| Device | connected_devices | PARTIAL | 016 | Metadata | SQL untracked | — | No Strava tokens | 016 | P2 | Register devices |
| Realtime event | domain_events | PARTIAL | 016 | Bus table | Untracked | — | Actor RLS | P3 | P2 | Convex later |
| Wear | Phone↔watch | PARTIAL | Wear | MessageClient | wear-* IDs | Unit pipeline | — | P7 | P2 | Reconcile IDs |
| Map | Route display | PARTIAL | Android/Web | Canvas polyline | Demo | — | No live tiles | MapLibre later | P3 | After GPS |
| Payments | Stripe | PARTIAL | Web | 015 | Keys missing | Webhook tests | Secrets env | HUMAN | P1 | Prod keys |
| Auth session | Firebase cookie | PARTIAL | Web | middleware | Demo CI | Unit | Fail-closed unset | HUMAN | P0 | P1-AUTH |
| Design | Neu-glass athlete | IMPLEMENTED | Android | Tokens | — | Visual tour | — | — | P3 | Coach neu-glass later |
| DevOps | CI | PARTIAL | GH | DEMO_MODE true | — | Lint/test/build | — | — | P1 | Prod-like job |
| Docs | README next=P0-SEC | STALE | — | Contradicts P0-SEC PASS | — | — | — | This audit | P0 | Point to docs/audit |

Test dates: live RLS last executed **2026-09-01** in prior session — **not re-executed 2026-09-02**.
