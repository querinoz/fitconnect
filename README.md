# FitConnect

Marketplace of verified sport specialists with science-grade athlete/coach tooling (HRV, readiness, live sessions, AI plan adjustments).

**Production:** https://fitconnect-phi.vercel.app · **Health:** `/api/health`

---

## Architecture

pnpm monorepo (Turborepo). Web app is the deploy target; mobile shares types/utils.

```
fitconnect/
├── apps/
│   ├── web/          # Next.js 14 — marketing + athlete/coach/admin dashboards
│   └── mobile/       # Expo 52 — athlete/coach tabs (preview)
├── packages/
│   ├── types/        # Shared domain types
│   ├── utils/        # Pure helpers
│   ├── ai/           # Readiness rules
│   ├── design-tokens/# CSS/motion tokens
│   ├── api-client/   # Typed API client
│   ├── config/       # Mobile token bridge
│   ├── maps/         # Map helpers
│   └── realtime-client/ # Shared realtime routing types
├── convex/           # Convex schema + mutations (hybrid realtime)
├── prisma/           # Schema + seed (Neon-ready)
├── scripts/          # Dev orchestration, smoke, Lighthouse
├── docs/             # Deploy + agent docs
└── .github/workflows/# CI, Vercel, EAS
```

| Layer | Stack |
|-------|--------|
| Web | Next.js 14 App Router, TypeScript, Tailwind, Framer Motion, Zustand, tRPC |
| Mobile | Expo 52, Expo Router, Reanimated, MMKV |
| Data | Prisma, Supabase Auth (demo mode default) |
| Realtime | **Hybrid:** Convex (nudges/live/plan sync) + Supabase Realtime (presence/chat) · BroadcastChannel for `?demo=1` |
| Payments | Stripe demo routes |
| CI/CD | GitHub Actions, Vercel, EAS (manual) |

---

## Features

| Athlete | Coach | Platform |
|---------|-------|----------|
| Readiness + HRV dashboard | Roster heatmap + AI alerts | Admin KPIs |
| Live session + coach nudges | Plan builder + QuickDiff | Health API |
| Programs, discover, community | Earnings + Stripe Connect | Demo mode |
| Booking + wearables UI | Athlete detail cockpit | PWA + offline banner |

**Voltline demo loops:** `?demo=1` on dashboards · `/mobile` one-tap launcher · BroadcastChannel cross-tab sync.

---

## Quick start

**Requirements:** Node 20+, pnpm 9.15+, (optional) Docker, cloudflared for tunnel.

```bash
pnpm install
cp .env.example .env.local   # optional — demo works without DB
pnpm dev                     # http://localhost:3001
```

**Makefile (recommended):**

```bash
make start      # setup + dev server :3001
make test       # unit tests (turbo)
make build      # production build
make status     # port + route checks
```

Windows native: `npm run env:start`

---

## Environment variables

Copy `.env.example` → `.env.local`. Minimum for demo deploy:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` = demo auth + seeded data |
| `NEXT_PUBLIC_REALTIME_PROVIDER` | `broadcast` (default), `convex`, or `supabase` |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL (coaching realtime) |
| `DATABASE_URL` | Neon Postgres (Strava + push tokens) |
| `STRAVA_CLIENT_ID/SECRET/WEBHOOK_VERIFY_TOKEN` | Strava OAuth + webhooks |
| `QSTASH_TOKEN` | Upstash QStash for async Strava sync jobs |
| `NEXT_PUBLIC_SUPABASE_*` | Auth + Realtime presence/chat |
| `STRIPE_*` / `LIVEKIT_*` | Payments / video (optional) |

Full list: [.env.example](.env.example)

---

## Demo accounts

| User | Password | Route |
|------|----------|-------|
| `ines@fitconnect.local` | Athlete | `/dashboard?demo=1` |
| `tomas@fitconnect.local` | Coach | `/coach/dashboard?demo=1` |
| `marina@fitconnect.local` | Marina | Multi-sport athlete |
| `admin@fitconnect.local` | Admin | `/admin` |

---

## Mobile app

```bash
pnpm dev:mobile              # Expo dev server
cd apps/mobile && pnpm typecheck
```

EAS profiles: `apps/mobile/eas.json` · scheme `fitconnect://`

---

## API flow

| Route | Role |
|-------|------|
| `GET /api/health` | Dependency status |
| `/api/trpc/[trpc]` | tRPC router |
| `/api/v1/*` | REST handlers (readiness, sessions, messages) |
| `/api/stripe/*` | Checkout, connect, webhook (demo) |

Client state: Zustand (`dashboard-store`, `auth-store`) + React Query/tRPC where wired.

---

## Observability

- **Health:** `lib/observability/health.ts` → `/api/health`
- **Toasts / errors:** `error.tsx` boundaries, toast store
- **Analytics stubs:** PostHog/Sentry client placeholders in `lib/observability/`
- **Lighthouse:** `node scripts/lighthouse-mobile.mjs http://127.0.0.1:3001` (prod server)

---

## Deployment

**Vercel (production):** https://fitconnect-phi.vercel.app · Root Directory = `apps/web`

```bash
pnpm dlx vercel login
pnpm vercel:link
pnpm deploy:vercel:prod
```

**Convex (realtime):** https://dashboard.convex.dev/t/eduardooquerino/fitconnect

| Deployment | URL |
|------------|-----|
| Dev | `https://valuable-camel-828.convex.cloud` |
| Prod | `https://striped-quail-172.convex.cloud` |

```bash
npx convex login                    # once per machine
pnpm convex:accept-tos              # if TOS prompt blocks CI
pnpm convex:setup                   # first-time cloud project
pnpm convex:deploy                  # push functions to prod
```

Set on Vercel: `NEXT_PUBLIC_CONVEX_URL=https://striped-quail-172.convex.cloud` and `NEXT_PUBLIC_REALTIME_PROVIDER=convex`.

Details: [docs/deploy-vercel.md](docs/deploy-vercel.md)

**Docker:**

```bash
docker build -t fitconnect .
docker run -p 3001:3001 fitconnect
```

**CI:** `.github/workflows/ci.yml` (lint, typecheck, test, build, E2E) · `vercel-deploy.yml` · `eas-preview.yml`

---

## Testing

```bash
pnpm test                    # Vitest (web + packages + mobile)
pnpm test:coverage           # lib/** thresholds ~50%+
pnpm test:e2e                # Playwright
pnpm test:e2e:voltline       # Cross-tab realtime specs
pnpm smoke:all               # HTTP smoke + PWA check
```

---

## Makefile reference

| Command | Purpose | When |
|---------|---------|------|
| `make start` / `make dev` | Setup + dev server | Daily dev |
| `make setup` | deps, `.env.local`, prisma generate | First run / fresh clone |
| `make prod` | build + prod server + tunnel + smoke | Mobile device demo |
| `make stop` | Kill dev/prod on `PORT` | Before port change |
| `make status` | PID, port, route health | Debug |
| `make test` | `pnpm test` | Pre-commit |
| `make build` | `pnpm build` | Pre-deploy |
| `make typecheck` | `pnpm typecheck` | CI parity |
| `make clean` | Stop + remove `.next` state | Stale build |
| `make clean-deep` | + `node_modules` | Broken deps |
| `make tunnel` | cloudflared → localhost | Phone testing |

`PORT=3002 make start` overrides default 3001.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3001 in use | `make stop` or `PORT=3002 make start` |
| Vercel "No Next.js detected" | Root Directory must be `apps/web`; deploy from repo root |
| Vercel upload >100MB | `.vercelignore` excludes `node_modules`, `.turbo` |
| Playwright reuses stale server | Config probes `/api/health` |
| Prisma client missing | `pnpm db:generate` or `make setup` |

---

## Performance notes

- Landing: lazy below-fold sections, `optimizeCss`, LCP ~3.7s mobile (target ≥90 Lighthouse perf)
- Dashboard: code-split loops, `useShallow` for Zustand selectors
- PWA: `@ducanh2912/next-pwa` service worker in `apps/web`

---

## Documentation index

| Doc | Purpose |
|-----|---------|
| [docs/deploy-vercel.md](docs/deploy-vercel.md) | Vercel monorepo deploy |
| [AGENT_PROGRESS.md](AGENT_PROGRESS.md) | Phase checklist |
| [AUDIT_FINDINGS.md](AUDIT_FINDINGS.md) | UI/UX audit backlog |
| [docs/superpowers/](docs/superpowers/) | Historical planning specs |

---

## Roadmap

- Wire Supabase Auth + Neon (demo mode remains)
- Convex realtime transport
- Shared readiness package (web/mobile dedup)
- EAS preview builds + push notifications

---

## License

MIT · Built by [Querinoz Studio](https://github.com/querinoz/fitconnect)
