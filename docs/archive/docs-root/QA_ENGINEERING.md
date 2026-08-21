# FitConnect — QA Engineering & DevOps Architecture

> Análise gerada a partir da codebase real (`fitconnect` monorepo).  
> Comandos executáveis — não teoria.

---

## FASE 1 — ANÁLISE DA APLICAÇÃO

### 1.1 — Inventário tecnológico

| Categoria | Stack detectada |
|-----------|-----------------|
| **Linguagens** | TypeScript **5.6.3**, Node.js **20** (CI), SQL (Prisma migrations) |
| **Monorepo** | pnpm **9.15.9**, Turbo **2.5.4** |
| **Web** | Next.js **14.2.18**, React **18.3.1**, App Router |
| **Mobile** | Expo **~52**, React Native **0.76.9**, Expo Router **~4.0** |
| **API** | Next.js Route Handlers (`/api/v1/*`), tRPC **11.1** |
| **ORM / DB** | Prisma **7.8** → PostgreSQL (provider `postgresql`, sem versão fixa no repo) |
| **Realtime** | Convex **1.21+** (presence, nudges, messages), BroadcastChannel demo, LiveKit **2.x** |
| **Auth** | Supabase Auth (`@supabase/ssr` **0.10**), demo mode cookie, RBAC: `athlete \| coach \| admin` |
| **Pagamentos** | Stripe **22.x** (checkout, connect, webhooks) |
| **Integrações** | Strava OAuth + webhooks, Upstash Redis (rate limit), PostHog, Sentry |
| **Maps** | MapLibre GL **5.6**, react-map-gl |
| **Motion/UI** | GSAP **3.15**, Framer Motion **11**, Tailwind **3.4**, Radix UI |
| **Cloud/Deploy** | Vercel (`.github/workflows/vercel-deploy.yml`), Convex Cloud |
| **Observabilidade** | Sentry browser, PostHog, `/api/health` (`buildHealthReport`), smoke scripts |
| **CI/CD** | GitHub Actions: lint → typecheck → unit → build → Playwright E2E |
| **IaC** | ❌ Sem Terraform/Pulumi/Helm no repo |
| **Mensageria** | Convex tables (nudges/messages), webhooks Strava/Stripe, sem Kafka/RabbitMQ |

### 1.2 — Mapeamento de domínio (DDD)

| Bounded Context | Agregados | Invariantes críticas |
|-----------------|-----------|-------------------|
| **Athlete Performance** | `AthleteProfile`, `ReadinessSnapshot` | Score 0–100; `recoveryStatus` ∈ {green, amber, red}; HRV/sleep coerentes |
| **Coaching** | `CoachProfile`, roster, plan blocks | Coach só acede atletas do roster; plan diff requer aprovação |
| **Sessions** | `Session` | `status` ∈ {SCHEDULED, LIVE, COMPLETED}; athlete↔coach linkage |
| **Programs** | `Program` | externalId único; weeks > 0 |
| **Integrations** | `WearableConnection`, Strava tokens | OAuth state; token encryption; webhook signature |
| **Billing** | Stripe checkout/subscription | Webhook secret validation; idempotency |
| **Realtime** | Convex presence/nudges | channel-scoped; TTL lastSeen |
| **Identity** | `User`, Supabase session | Role-based route gates; demo vs prod auth split |

**Fluxos principais:**
```
Wearable/Strava → ingestion webhook → readiness compute → dashboard
Coach morning handshake → AI roster eval → plan diff → athlete approval
Booking → session CRUD → LiveKit room token → live metrics → feedback
Signup → Supabase (prod) / demo cookie → role dashboard
```

**PII / GDPR:** email, nomes, dados biométricos (HRV, sono), localização (maps), tokens OAuth.

### 1.3 — Mapa de riscos

| Componente | Risco | Classificação |
|------------|-------|---------------|
| Stripe webhooks | Pagamento duplicado / fraude | **CRÍTICO** |
| Supabase auth (prod) | Acesso não autorizado | **CRÍTICO** |
| Prisma / PostgreSQL | Perda/corrupção de dados | **CRÍTICO** |
| Strava token storage | Exposição OAuth | **ALTO** |
| Readiness compute | Treino inseguro (TBI/recovery) | **ALTO** |
| LiveKit tokens | Sala aberta a terceiros | **ALTO** |
| Rate limit (Upstash) | Abuse API | **MÉDIO** |
| Convex realtime | Degradação UX | **MÉDIO** |
| Landing motion/GSAP | UX degradada | **BAIXO** |
| Theme/appearance | Preferências erradas | **BAIXO** |

---

## FASE 2 — ESTRATÉGIA DE TESTES

### Pirâmide implementada

```
                    ┌─────────────┐
                    │  E2E (PW)   │  12+ specs, mobile + desktop
                    ├─────────────┤
                    │ Integration │  API handlers, domain, health contract
                    ├─────────────┤
                    │    Unit     │  170+ Vitest (lib + components)
                    └─────────────┘
```

| Camada | Framework | Localização | Target |
|--------|-----------|-------------|--------|
| Unit | Vitest + Testing Library | `apps/web/**/*.test.{ts,tsx}` | >85% lógica negócio (actual: ~50% threshold em `lib/`) |
| Integration | Vitest | `apps/web/tests/integration/` | API contracts, domain cross-module |
| E2E | Playwright | `apps/web/tests/e2e/` | Fluxos auth, booking, live session |
| Contract | Vitest schemas | `tests/integration/*contract*` | Health + API response shape |
| Performance | k6 | `scripts/perf/k6-smoke.js` | p95 < 500ms smoke (health + landing) |
| Security | pnpm audit + lint | CI job `security` | 0 high/critical deps |
| Mobile unit | Vitest | `apps/mobile/__tests__/` | readiness, sessions, maps |

**Gaps identificados (roadmap):**
- Testcontainers PostgreSQL + migrations up/down
- Pact para `@fitconnect/api-client` ↔ Next API
- OWASP ZAP DAST em staging
- Soak tests k6 (>30min)

---

## FASE 3 — TESTES GERADOS (neste PR)

| Ficheiro | Propósito |
|----------|-----------|
| `tests/fixtures/domain.ts` | Factories realistas (seed IDs, readiness, sessions) |
| `lib/motion/should-reduce-motion.test.ts` | App + OS motion guard |
| `lib/theme/appearance-provider.test.tsx` | Toggle reduce motion / color mode |
| `tests/integration/health-contract.integration.test.ts` | Contrato `/api/health` |
| `tests/integration/sessions-api.integration.test.ts` | GET sessions demo mode |
| `tests/integration/readiness-domain.integration.test.ts` | compute ↔ repository |
| `tests/e2e/landing-motion.spec.ts` | Landing hero visível pós-gate |

### Comandos

```bash
# Unit + integration (rápido, <2min)
pnpm --filter @fitconnect/web test

# Cobertura
pnpm test:coverage

# E2E
pnpm test:e2e

# Smoke pós-deploy
pnpm smoke -- https://fitconnect-phi.vercel.app

# Performance smoke
k6 run scripts/perf/k6-smoke.js

# Integration DB (requer Postgres)
docker compose -f docker-compose.test.yml up -d
DATABASE_URL_TEST=postgresql://fitconnect:fitconnect_test@localhost:5433/fitconnect_test pnpm test:integration:db
```

---

## FASE 4 — CI/CD & OBSERVABILIDADE

### Pipeline GitHub Actions (`.github/workflows/ci.yml`)

| Stage | Gate | SLA |
|-------|------|-----|
| `lint` | ESLint clean | < 90s |
| `typecheck` | tsc --noEmit | < 90s |
| `unit` | Vitest + coverage ≥ 50% (lib/) | < 2min |
| `security` | pnpm audit high+ | < 60s |
| `build` | next build | < 3min |
| `e2e` | Playwright phase9 + smoke | < 10min |
| `perf` | k6 (main/master only) | < 2min |

**Artifacts:** `coverage/lcov.info`, Playwright traces on retry.

### Ambientes

| Ambiente | Config |
|----------|--------|
| **LOCAL** | `docker-compose.test.yml` (Postgres 16) |
| **CI** | `NEXT_PUBLIC_DEMO_MODE=true`, service container Postgres (opcional) |
| **STAGING** | Vercel preview + Convex dev |
| **PROD** | `pnpm smoke` + synthetic `/api/health` |

### Métricas de qualidade (manual → Grafana futuro)

- Flaky rate: Playwright retries / total
- Coverage delta: codecov ou artifact diff
- p95 latency: k6 `http_req_duration`

---

*Última actualização: gerada automaticamente a partir do estado do repo.*
