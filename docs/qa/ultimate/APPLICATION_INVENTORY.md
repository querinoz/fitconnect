# Application Inventory — FitConnect

**Scan date:** 2026-08-27

## Executable surfaces

| Surface | Path / Package | Status | Evidence |
|---|---|---|---|
| Landing + Web | `apps/web` → `http://localhost:3001` | RUNNING | smoke 14/14 PASS |
| Android (phone) | `android/app` → `com.fitconnect.android.debug` | INSTALLED + RUNNING | emulator-5554, Coach OS UI dump |
| Wear OS | `android/wear` → `com.fitconnect.android.wear` | INSTALLED + RUNNING | emulator-5556, STEPS screen |
| Expo mobile (legacy) | `apps/mobile` | FROZEN | typecheck FAIL (AnimatedCircle) |
| Backend API | `apps/web/app/api/**` | LOCAL | Next.js route handlers |
| Strava integration | `packages/strava-integration` | MODULE | OAuth/webhook package |
| Prisma DB | `prisma/schema.prisma` | PARTIAL | migrations incomplete (P0-3) |
| Supabase RLS | `supabase/migrations/` | PARTIAL | policies gaps (P1-4..6) |

## Android modules (DAG)

`app` → `athlete`, `coach`, `wear`, `ascend`, `community`, `geo`, `telemetry`, `ai`, `design-ui`, `foundation`, `shared`, `core-capture`, `sports`

## Web route groups

- Marketing: `/`, `/pricing`, `/methodology`, `/trainer/**`
- Auth: `/signin`, `/signup`
- Athlete app: `/dashboard`, `/discover`, `/programs`, `/community`, `/settings/**`
- Coach app: `/coach/dashboard`, `/coach/athletes/**`
- API: `/api/v1/**`, `/api/stripe/webhook`

## Feature implementation truth

| Feature | Android | Web | Wear | Backend |
|---|---|---|---|---|
| Athlete home | PASS (demo) | PASS | N/A | DEMO |
| Coach OS | PASS (LOCAL_DEMO) | PASS | N/A | DEMO |
| Activity/GPS | MODULE exists | PARTIAL | WORKOUT UI | LOCAL |
| ASCEND/XP | LOCAL only | LOCAL only | N/A | NOT PERSISTED (P0-4) |
| Social feed | SEED data | localStorage | N/A | NOT WIRED (P1-14) |
| Squads | UI shell | PARTIAL | N/A | NOT PERSISTED |
| Realtime | N/A | bridge (auth-gated) | N/A | broadcast default |
| Auth | Firebase + demo | Firebase verify fixed | N/A | RS256 verify |
