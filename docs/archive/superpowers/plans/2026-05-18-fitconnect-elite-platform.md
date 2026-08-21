# FitConnect Elite Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve FitConnect from demo-front-end to an elite Strava × Whoop × Future × Trainerize × Oura × Linear platform with real auth, data, cross-device realtime, wearables, mobile, and AI — while preserving all existing marketing content, Voltline UX, and loop demonstrations.

**Architecture:** Stay in the current repo through Phase 1; introduce `packages/*` for shared types and tokens; abstract realtime behind `IRealtimeTransport`; add Supabase Auth + Neon Postgres + Prisma; migrate Convex in Phase 2; Expo monorepo app in Phase 4. Existing `components/loops/*` and `lib/dashboard-store.ts` become clients of server state, not replacements.

**Tech Stack:** Next.js 15 · Expo · Convex · Supabase Auth · Neon Postgres · Prisma · Redis/Upstash · BullMQ · Temporal · Mapbox · LiveKit · LangGraph · OpenAI · Novu · Sentry · PostHog.

**Source spec:** `docs/superpowers/specs/2026-05-18-fitconnect-elite-platform-design.md`

---

## What we keep (do not delete)

- All marketing routes and `lib/data.ts` content (migrate to DB gradually)  
- Voltline UI: `components/ui-glass/*`, `app/voltline.css`, theme system  
- i18n: `lib/i18n/*` (6 locales)  
- Demo loops: `components/loops/*` — rewire to real transport  
- Mobile shell: `components/shell/mobile-shell.tsx`  
- Tests: Vitest + Playwright — extend, don’t replace  

---

## Phase 1 — Foundation (real auth + data + API)

### Task 1: Platform config + realtime port

**Files:**
- Create: `lib/platform/stack.ts`
- Create: `lib/platform/ports/realtime.ts`
- Create: `lib/platform/realtime/broadcast-transport.ts`
- Modify: `lib/realtime/use-channel.ts`
- Test: `lib/platform/realtime/broadcast-transport.test.ts`

- [ ] **Step 1: Define `IRealtimeTransport` in `lib/platform/ports/realtime.ts`**

```typescript
import type { RealtimeMessage } from "@/lib/realtime/types";

export type Unsubscribe = () => void;

export interface IRealtimeTransport {
  subscribe(channel: string, handler: (msg: RealtimeMessage) => void): Unsubscribe;
  publish(channel: string, msg: RealtimeMessage): void;
  close?(): void;
}
```

- [ ] **Step 2: Wrap `LocalChannel` in `BroadcastChannelTransport` implementing the port**

- [ ] **Step 3: Update `use-channel.ts` to resolve transport from `lib/platform/stack.ts` (`REALTIME_PROVIDER=broadcast|convex`)**

- [ ] **Step 4: Run tests**

Run: `npm run test -- lib/realtime/use-channel.test.tsx lib/platform/realtime/broadcast-transport.test.ts`  
Expected: PASS (existing cross-tab behavior unchanged)

- [ ] **Step 5: Commit**

```bash
git add lib/platform lib/realtime/use-channel.ts
git commit -m "feat(platform): add realtime transport port and broadcast adapter"
```

---

### Task 2: Shared domain types package (in-repo)

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/src/index.ts`
- Create: `packages/types/src/domain.ts`
- Modify: `tsconfig.json` (paths `@fitconnect/types`)
- Modify: `lib/dashboard/types.ts` (re-export from package)

- [ ] **Step 1: Extract core types** — `Athlete`, `Coach`, `Session`, `ReadinessSnapshot`, `PlanBlock`, `RealtimeMessage` from `lib/dashboard/types.ts` + `lib/realtime/types.ts`

- [ ] **Step 2: Re-export in app** so no import churn yet:

```typescript
// lib/dashboard/types.ts
export type * from "@fitconnect/types";
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`  
Expected: PASS

---

### Task 3: Database schema (Prisma + Neon)

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db/client.ts`
- Create: `.env.example` (DATABASE_URL, SUPABASE_*)

- [ ] **Step 1: Add dependencies**

```bash
npm install @prisma/client
npm install -D prisma
```

- [ ] **Step 2: Define schema** — User, AthleteProfile, CoachProfile, SpecialistListing, Program, Booking, Session, Message, Thread, WearableConnection, BiometricSample, ReadinessSnapshot, TrainingPlan, PlanBlock

- [ ] **Step 3: Seed script** mapping `lib/data.ts` trainers + `lib/dashboard/seed.ts` athletes

- [ ] **Step 4: Run migration locally**

Run: `npx prisma migrate dev --name init`  
Expected: tables created

---

### Task 4: Supabase Auth (replace demo auth)

**Files:**
- Create: `lib/auth/server.ts`
- Create: `middleware.ts` (protect `(app)` routes)
- Modify: `components/auth-shell.tsx`
- Modify: `lib/auth-store.ts` (session mirror only)
- Modify: `components/auth-gate.tsx`

- [ ] **Step 1: Supabase project + env vars**

- [ ] **Step 2: Role claims** — athlete | coach | admin | federation | gym_owner

- [ ] **Step 3: Keep demo login behind `NEXT_PUBLIC_DEMO_MODE=true` for sales**

- [ ] **Step 4: E2E update** — Playwright auth fixture

Run: `npm run test:e2e`  
Expected: PASS with test user seed

---

### Task 5: API layer (tRPC or Route Handlers)

**Files:**
- Create: `lib/api/trpc/` OR `app/api/v1/`
- Create: routers: `athletes`, `coaches`, `sessions`, `readiness`, `messages`

- [ ] **Step 1: `GET /api/v1/athletes/me/readiness`** — backed by Prisma  
- [ ] **Step 2: Wire `app/(app)/dashboard/page.tsx` to SWR/React Query + API (keep Zustand for optimistic UI)**  
- [ ] **Step 3: Replace placeholder pages** — `sessions`, `inbox`, `my-coach` with real lists  

---

### Task 6: Design tokens package

**Files:**
- Create: `packages/design-tokens/tokens.css`
- Create: `packages/design-tokens/motion.ts`
- Modify: `tailwind.config.ts` to import tokens

- [ ] **Step 1: Move color/motion/spacing from `app/voltline.css` + `lib/use-entrance-motion.ts`**  
- [ ] **Step 2: Document GSAP-only zones** — `components/marketing/hero-immersive.tsx`, landing sections  

---

### Task 7: Observability baseline

**Files:**
- Create: `lib/observability/sentry.client.ts`, `sentry.server.ts`
- Create: `lib/observability/posthog.ts`

- [ ] **Step 1: Sentry Next.js integration**  
- [ ] **Step 2: PostHog page + key events** — signup, session_start, readiness_view  

---

## Phase 2 — Realtime + coach OS

### Task 8: Convex integration

**Files:**
- Create: `lib/platform/realtime/convex-transport.ts`
- Create: `convex/schema.ts`, `convex/presence.ts`, `convex/nudges.ts`

- [ ] **Step 1: Convex project + deploy**  
- [ ] **Step 2: Mirror channel names** — `athlete:{id}`, `roster:{coachId}`, `celebration:{id}`  
- [ ] **Step 3: Flip `REALTIME_PROVIDER=convex` in staging**  
- [ ] **Step 4: Multi-browser Playwright spec** — coach tab + athlete tab  

---

### Task 9: LiveKit video sessions

**Files:**
- Create: `app/(app)/sessions/[id]/room/page.tsx`
- Create: `lib/video/livekit.ts`

- [ ] **Step 1: Token endpoint**  
- [ ] **Step 2: Coach form-review UI**  

---

### Task 10: Complete coach placeholder routes

**Files:**
- Modify: `app/(app)/coach/roster/page.tsx`
- Modify: `app/(app)/coach/inbox/page.tsx`
- Modify: `app/(app)/coach/sessions/page.tsx`

---

## Phase 3 — Wearables + recovery engine

### Task 11: Ingestion service

**Files:**
- Create: `apps/api` or `lib/ingestion/` with Temporal workers
- Create: `lib/ingestion/providers/whoop.ts`, `oura.ts`, `strava.ts`

- [ ] **Step 1: OAuth connect flows in `app/(app)/settings/wearables/page.tsx`**  
- [ ] **Step 2: Webhook handlers**  
- [ ] **Step 3: Replace mock HRV in dashboard with `ReadinessSnapshot` queries**  

---

### Task 12: AI readiness (rules → LLM)

**Files:**
- Modify: `lib/ai/rules.ts` → keep as fallback  
- Create: `packages/ai/graphs/readiness.ts` (LangGraph)

---

## Phase 4 — Mobile (Expo)

### Task 13: Monorepo split

- [ ] **Step 1: Turborepo + move current app to `apps/web`**  
- [ ] **Step 2: `npx create-expo-app apps/mobile` with Expo Router**  
- [ ] **Step 3: Share `@fitconnect/types`, `@fitconnect/design-tokens`**  
- [ ] **Step 4: MMKV offline queue for session logs**  

---

## Phase 5 — AI autoregulation

### Task 14: Coach co-pilot LLM

- Modify: `components/loops/ai-copilot/use-co-pilot.ts`  
- Create: RAG on athlete history (pgvector)

### Task 15: Ops AI

- Coach verification pipeline  
- Fraud signals on bookings  

---

## Phase 6 — Community + maps

### Task 16: Mapbox

- Create: `packages/maps/`  
- Modify: `app/community/page.tsx` — live heatmaps  
- Session route recording for run/cycle/surf  

---

## Testing matrix (ongoing)

| Layer | Tool | Location |
|-------|------|----------|
| Unit | Vitest | `**/*.test.ts` |
| E2E web | Playwright | `tests/e2e/` |
| Mobile | Maestro | `apps/mobile/e2e/` (Phase 4) |
| API | Supertest | `apps/api/**/*.test.ts` |
| Contract | Pact | Phase 2+ |

---

## Deployment target

| Service | Provider |
|---------|----------|
| Web | Vercel |
| API/workers | Railway or Fly.io |
| DB | Neon Postgres |
| Cache | Upstash Redis |
| Realtime | Convex |
| Auth | Supabase |
| Storage | Cloudflare R2 |
| Mobile OTA | EAS Update |

---

## Immediate next session (recommended)

Execute **Phase 1, Tasks 1–2 only** (~2 hours):
1. Realtime port + broadcast adapter (zero behavior change)  
2. `packages/types` extraction  

Then **Task 3** (Prisma) in a dedicated branch `feat/platform-foundation`.

---

## Self-review

| Spec section | Plan task |
|--------------|-----------|
| Realtime architecture | Tasks 1, 8 |
| Health pipeline | Task 11 |
| Cross-platform sync | Tasks 8, 13 |
| Wearable integrations | Task 11 |
| Event-driven | Task 11 (Temporal) |
| Premium motion/UI | Task 6 |
| Scalable analytics | Tasks 7, 16 |
| Athlete/coach ecosystem | Tasks 5, 10 |
| Offline mobile | Task 13 |
| Monorepo | Tasks 2, 13 |

No TBD placeholders in task definitions above. Phase 1 tasks include exact paths and commands.
