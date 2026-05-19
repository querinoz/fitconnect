# FitConnect Elite Platform — Design Spec

**Date:** 2026-05-18  
**Status:** Approved for planning  
**Scope:** Transform FitConnect from a high-polish demo into a Strava × Whoop × Future × Trainerize × Oura × Linear-grade platform.

---

## North star

FitConnect’s moat is **not AI alone**. It is:

1. **Verified specialists** — trust pipeline, not open marketplace noise  
2. **Recovery-aware realtime coaching** — coach sees athlete state live  
3. **Multi-sport athlete identity** — one profile across modalities  
4. **Unified biometric intelligence** — wearables → readiness → training  
5. **Premium UX consistency** — Linear smoothness + Whoop density + Oura calm  

---

## Current state (2026-05-18)

| Layer | Today | Blocker |
|-------|-------|---------|
| Web | Next.js 14 single app, Voltline UI, 6 locales | No API/DB |
| Auth | Demo Zustand + hardcoded users | No Clerk/Supabase |
| Data | `lib/data.ts` + `lib/dashboard/seed.ts` | No PostgreSQL |
| Realtime | `BroadcastChannel` (`lib/realtime/local-channel.ts`) | Same-browser only |
| Mobile | PWA + phone mockups | No Expo app |
| AI | Rules (`lib/ai/rules.ts`) + canned chat | No LLM/RAG |
| Wearables | Marketing copy only | No ingestion |
| Video | Static UI | No LiveKit |
| Maps | Static city strip | No Mapbox |
| Payments | Copy only | No Stripe Connect |

**Keep:** Voltline tokens, theme system, i18n, loop UX (`components/loops/*`), mobile shell, tests (Vitest + Playwright).

---

## Target stack (locked)

### Web
- **Next.js 15** App Router, RSC, PPR where stable  
- **Tailwind CSS v4** + centralized design tokens (`packages/design-tokens`)  
- **Framer Motion** — app UI; **GSAP** — hero/marketing only  
- **Deploy:** Vercel (edge where useful)

### Mobile
- **Expo SDK (latest)** + Expo Router  
- **Reanimated 3**, Skia, Gesture Handler, FlashList, MMKV, NativeWind  
- Shared types with web via `packages/types`

### Realtime (recommended)
- **Convex** — live dashboards, presence, collaborative coach views  
- **Supabase Auth** — multi-role (athlete, coach, admin, federation, gym owner)  
- Abstract today’s `useChannel` behind `IRealtimeTransport` → swap adapters

### Backend
- **NestJS** OR **tRPC inside Next** for Phase 1–2; evaluate split at Phase 3  
- **PostgreSQL** (Neon) + **Prisma**  
- **Redis** (Upstash) cache + **BullMQ** queues  
- **Cloudflare R2** object storage  
- **Typesense** search

### Health pipeline
- **Temporal.io** — wearable sync workflows, retries, backfill  
- Integrations: HealthKit, Health Connect, Garmin, Whoop, Oura, Polar, Strava  
- Normalized event schema: `BiometricSample`, `SleepSession`, `Activity`, `ReadinessSnapshot`

### Maps
- **Mapbox GL** + Turf.js + Deck.gl (heatmaps, live sessions, routes)

### AI
- **OpenAI** + **LangGraph** + **pgvector** RAG  
- Three layers: Athlete AI, Coach AI, Operations AI (see user spec)

### Video
- **LiveKit** — coaching calls, form review, screen share

### Notifications
- **Novu** orchestration + **Expo Push** + **Resend** email

### Observability
- **Sentry**, **PostHog**, **OpenTelemetry**, Grafana/Loki  
- Track: realtime lag, sync failures, ingestion errors, session latency

---

## UX direction

| Reference | FitConnect expression |
|-----------|----------------------|
| Linear | Instant navigation, keyboard-first coach tools, minimal chrome |
| Apple | Motion with purpose; respect reduced motion |
| Vercel | Landing polish, streaming sections, crisp typography |
| Whoop | Readiness rings, strain/recovery density in athlete OS |
| Strava | Social proof, activity feed, club energy (community route) |
| Oura | Calm recovery screens, sleep storytelling |
| Tesla | Live session maps/metrics feel “always on” |

Motion tokens live in `packages/design-tokens/motion.ts` (extend `lib/use-entrance-motion.ts`).

---

## Monorepo target

```
apps/
  web/          ← current Next app (migrate from root)
  mobile/       ← Expo
  api/          ← NestJS or standalone tRPC service (Phase 2+)
  coach-admin/  ← Phase 4

packages/
  ui/             ← ui-glass + shadcn
  design-tokens/  ← color, motion, glass, shadow, spacing
  types/          ← domain + API contracts
  auth/           ← Supabase/Clerk wrappers
  realtime/       ← Convex + BroadcastChannel adapters
  wearable-sdk/   ← ingestion clients
  maps/           ← Mapbox wrappers
  ai/             ← LangGraph graphs
  charts/         ← Tremor/Recharts presets
  analytics/      ← PostHog helpers
  config/         ← eslint, tsconfig
```

**Migration:** Phase 1 keeps single repo; extract `packages/types` + `packages/design-tokens` first without moving `apps/web`.

---

## Phased delivery

### Phase 1 — Foundation (weeks 1–6)
Landing + auth + dashboards on real data  
→ Supabase Auth, Neon Postgres, Prisma schema, replace demo auth, wire dashboards to API

### Phase 2 — Realtime + coach OS (weeks 7–12)
→ Convex presence, cross-device channels, inbox/sessions/roster pages, LiveKit stub

### Phase 3 — Wearables + recovery engine (weeks 13–20)
→ Temporal ingestion, readiness pipeline, replace seed HRV/sleep

### Phase 4 — Mobile + offline (weeks 21–28)
→ Expo app, MMKV offline queue, push via Novu

### Phase 5 — AI autoregulation (weeks 29–36)
→ LangGraph co-pilot, RAG on athlete history, ops fraud/verification

### Phase 6 — Community + maps (weeks 37+)
→ Mapbox routes/heatmaps, clubs, events

---

## Realtime migration strategy

Today: `useChannel(name)` → `LocalChannel` (BroadcastChannel).  

Target:
```typescript
interface IRealtimeTransport {
  subscribe(channel: string, handler: (msg: RealtimeMessage) => void): () => void;
  publish(channel: string, msg: RealtimeMessage): void;
  presence?(room: string): PresenceAPI;
}
```

Implementations:
1. `BroadcastChannelTransport` (current — dev/demo)
2. `ConvexTransport` (production)
3. `SupabaseRealtimeTransport` (fallback)

No consumer changes beyond env flag `NEXT_PUBLIC_REALTIME_PROVIDER`.

---

## Domain model (core entities)

- `User`, `AthleteProfile`, `CoachProfile`, `VerificationCase`  
- `SpecialistListing`, `Program`, `Booking`, `Session` (live + async)  
- `Message`, `Thread`, `Notification`  
- `WearableConnection`, `BiometricSample`, `ReadinessSnapshot`  
- `TrainingPlan`, `PlanBlock`, `PlanDiff`  
- `Club`, `Event`, `Route`  

Maps 1:1 from existing `lib/dashboard/types.ts` and `lib/data.ts` shapes.

---

## Success metrics

- P95 dashboard load < 1.2s (web)  
- Realtime coach→athlete nudge < 300ms (Convex)  
- Wearable sync freshness < 5 min (Whoop/Oura)  
- Mobile offline session log sync 99.9%  
- Specialist verification SLA < 72h  

---

## Out of scope (this spec)

- Replacing Voltline visual identity  
- Removing demo mode (keep `?demo=1` for sales)  
- Federation/gym admin UI beyond auth roles (Phase 6+)
