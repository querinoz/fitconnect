# APP_INVENTORY — FitConnect runnable surfaces

## Web (apps/web — Next.js 14, deployed on Vercel)
- Prod URL: https://fitconnect-phi.vercel.app (LIVE, tested)
- 47 page routes, 39 API routes. Dev: `pnpm dev` (turbo --filter @fitconnect/web), port 3000/3001.
- Marketing: /, /pricing, /discover, /programs, /community, /methodology, /mobile, /trainer[/id], /signin, /signup, /privacy, /terms, /brand
- App (auth-gated client): /dashboard, /insights (Analysis), /achievements (ASCEND), /profile, /map, /sessions, /inbox, /my-coach, /settings/{appearance,privacy,wearables}
- Coach: /coach/{dashboard,roster,sessions,inbox,earnings,profile,athletes/[id][/plan]}
- Admin: /admin{,/analytics,/athletes,/coach-verification,/payments}

## Android (android/ — Gradle, AGP9, no Hilt/Koin, manual DI)
- Modules (settings.gradle.kts): :app :wear :shared :ascend :core-capture :core:fitness :design :design-ui :foundation :sports :geo :telemetry :community :ai :athlete :coach
- ~44k LOC Kotlin. Build: `./gradlew :app:assembleDebug`. NOT runnable this session (hypervisor off).
- Package: com.fitconnect.android

## Wear OS (android/wear)
- 10 kt / 1223 LOC. Real Data Layer (com.google.android.gms.wearable). NOT runnable (no Wear AVD).

## Mobile (apps/mobile — Expo 52)
- FROZEN (Path A). Out of CI graph. README banner. Not a production target.

## Backend / data
- Live API is DEMO/seeded (banner "DEMO MODE — Seeded data, no real backend"). Protected routes fail closed (503 auth_not_configured).
- Prisma schema (19 models) + Supabase migrations (dual-source, unresolved). Convex generated (not committed).
