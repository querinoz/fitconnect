# CLAUDE.md — FitConnect · Memória Persistente do Projeto

> **CURRENT STATUS (2026-08-20):** Production = **NO-GO**. Active next phase = **P0-SEC**. Canonical execution plan = [`docs/master-plan/`](docs/master-plan/21_FINAL_ROADMAP.md). Entry point = [`README.md`](README.md).
>
> Architecture rules in [`AGENTS.md`](AGENTS.md) remain in force (Strava never social; Health Connect is the data core).
>
> Sections below are a **HISTORICAL** project-memory snapshot (May 2026 era). Where they conflict with the master plan (Expo as production mobile, “demo product scores”, old P0 lists), **the master plan wins**. Do not copy HISTORICAL PASS/ready language into new work.

---

## 1. Identidade do Projeto


| Campo                | Valor                                        |
| -------------------- | -------------------------------------------- |
| **Nome**             | FitConnect                                   |
| **Tagline**          | Connect. Train. Perform.                     |
| **Tipo**             | Coaching platform SaaS + Marketplace         |
| **Stack**            | Next.js 14 · Expo 52 · Turbo Monorepo · pnpm |
| **Prod URL**         | https://fitconnect-phi.vercel.app            |
| **Branch principal** | `feature/fitconnect`                         |
| **Repositório**      | Monorepo `fitconnect`                        |
| **Dono**             | DevOps @ Bosch Portugal                      |


---

## 2. Estrutura do Monorepo

```
fitconnect/
├── apps/
│   ├── web/          → Next.js 14 (produção, Vercel)
│   └── mobile/       → Expo 52 (preview, EAS)
├── packages/
│   ├── strava-integration/   ← módulo mais maduro
│   ├── api-client/
│   ├── types/
│   ├── ai/
│   ├── realtime-client/
│   └── ... (9 packages total)
├── prisma/
│   └── schema.prisma         ← 19 modelos
├── convex/                   ← gerado, não commitar
├── supabase/migrations/      ← 10 SQL (conflito com Prisma)
└── docs/

```

---

## 3. Design System — Elite OS (canonical)

> **ADR-001:** `--eos-*` is the single source of truth. Voltline soul preserved via `--eos-voltline` / `--eos-connect`.

### Paleta (não substituir hues)

| Token | Valor | Uso |
|-------|-------|-----|
| `--eos-floor` | `#070B14` | Fundo obsidian |
| `--eos-voltline` | `#C8FF00` | CTA, athlete, picos |
| `--eos-connect` | `#00DDB4` | Telemetria, confiança |
| `--eos-telemetry` | `#3CD7FF` | Dados live |
| `--eos-iris` | `#6C63FF` | Focus secundário |
| `--eos-performance` | `#00E090` | Sucesso |
| `--eos-recovery` | `#FFB020` | Amber |
| `--eos-alert` | `#FF3A5C` | Alerta |

### Ficheiros

- `apps/web/app/elite-os.css` — CSS vars canónicas
- `packages/design-tokens/` — `COLOR_TOKENS` (web + mobile)
- `apps/web/lib/design-system/tokens.ts` — `EOS_COLORS` (deriva de COLOR_TOKENS)
- `voltline.css` — **deprecated aliases** only
- `components/elite-os/` — BentoCard, EliteAppShell, decorators
- `docs/DESIGN_SYSTEM.md` — documentação completa

### Tipografia

- **Syne** — display / headlines
- **Plus Jakarta Sans** — body
- **JetBrains Mono** — métricas, labels SYS.*

### Regras

- Zero hex hardcoded em componentes novos — tokens only
- Dark-first · `prefers-reduced-motion` + `data-motion="reduced"`
- i18n: 6 locales via `apps/web/lib/i18n/`

### Legacy (migrar gradualmente)

- `ui-glass/` — ~47 imports, não apagar até migração completa
- `--volt-*` / `--ink-*` — aliases em `voltline.css`

---

## 4. Análise de Scores (estado atual → target)


| Dimensão                        | Score Atual      | Target |
| ------------------------------- | ---------------- | ------ |
| Design & identidade visual      | 8/10             | 9.5/10 |
| Landing layout & responsiveness | 7.5/10           | 9.5/10 |
| i18n (6 idiomas)                | 6/10             | 9/10   |
| Web ↔ Mobile parity             | 4/10             | 8/10   |
| API & backend                   | 4.5/10           | 8/10   |
| Code architecture               | 7/10             | 8.5/10 |
| Tests & CI                      | 7(web)/3(mobile) | 8/8    |
| Production readiness            | 5/10             | 9/10   |


---

## 5. Bugs Críticos Conhecidos (P0)

1. **Demo mode ON por defeito** → `NEXT_PUBLIC_DEMO_MODE=false` e auth em todas as rotas `/api/v1/`*
2. **Hero device mock em PT para todos os idiomas** → `heroLoop={false}` ou traduzir loop em `device-showcase.tsx:45`
3. **Demo widgets 100% inglês** → `demo-readiness.tsx`, `demo-match.tsx`, `demo-coach-flip.tsx`
4. **Demos section título partido** → `demos-section.tsx` concatena sufixo " looks like." em inglês
5. **Metadata/SEO só PT** → `layout.tsx` OG/title sempre em PT
6. **Flash idioma na hidratação** → `DEFAULT_LANG = "pt"` + `useLocale()` só após mount
7. **prisma/seed.ts importa** `../lib/data` → pasta não existe → corrigir para `apps/web/lib/data`
8. **Dockerfile incompleto** → falta `strava-integration`, `realtime-client` no stage deps
9. **tRPC context** `user: null` → todas as rotas públicas sem auth
10. **Stripe 100% demo** → `lib/stripe/demo` → nunca chegou a Stripe real

---

## 6. Código Morto / Orphans

**Phase 01 W1 executed** (`docs/phase-01/Cleanup_Executed.md`): 31 REMOVE_CANDIDATE web orphans deleted + empty `packages/ui` removed. `lib/media/imagekit-loader.ts` kept (Next loader).

**Already gone earlier:** hero, showcases, audience-split, photo-reel, why-fitconnect, ck/*.

**Deferred (not REMOVE_CANDIDATE):** `components/ui-glass/**` (~47 importers), `apps/mobile` (frozen Path A), Prisma/Supabase dual schema.

---

## 7. Strava Integration (módulo mais maduro)

### Package: `@fitconnect/strava-integration`

- Rotas: `connect`, `callback`, `sync`, `webhook`, `disconnect`, `v3/[...path]`, `jobs/QStash`
- Features: OAuth, webhook, proxy v3 allowlist, Prisma, criptografia de tokens
- Docs: `docs/integrations/strava-api-analysis.md`

### Todos os Sport Types do Strava (adicionar ao app)

```
AlpineSki, BackcountrySki, Badminton, Canoeing, Crossfit, EBikeRide,
Elliptical, EMountainBikeRide, Golf, GravelRide, Handcycle, HighIntensityIntervalTraining,
Hike, IceSkate, InlineSkate, Kayaking, Kitesurf, MountainBikeRide, NordicSki,
Pickleball, Pilates, Racquetball, Ride, RockClimbing, RollerSki, Rowing,
Run, Sail, Skateboard, Snowboard, Snowshoe, Soccer, Squash, StairStepper,
StandUpPaddling, Surfing, Swim, TableTennis, Tennis, TrailRun, Velomobile,
VirtualRide, VirtualRow, VirtualRun, Walk, WeightTraining, Wheelchair,
Windsurf, Workout, Yoga

```

### APIs Strava a implementar (todas)

- Activities (list, create, get, update, delete, zones, laps, kudos, comments)
- Athlete (get, stats, zones, starred segments)
- Clubs (list, get, activities, members, admins)
- Gear (get)
- Routes (get, export GPX/TCX)
- Segments (get, starred, explore, efforts)
- Segment Efforts (get, list)
- Streams (activity, segment effort, route)
- Uploads (create, get)
- Webhooks (subscribe, list, delete)
- OAuth (authorize, token, deauthorize)

---

## 8. Arquitetura API (estado atual)


| Integração      | Score | Estado                                      |
| --------------- | ----- | ------------------------------------------- |
| Strava          | 7/10  | OAuth funcional, webhook, proxy v3          |
| Auth (Supabase) | 4/10  | demo mode bypass por defeito                |
| tRPC            | 3/10  | user: null; Strava público                  |
| REST v1         | 4/10  | routes abertas via ?athleteId=              |
| Stripe          | 2/10  | 100% demo                                   |
| PostHog         | 6/10  | client-side apenas                          |
| LiveKit         | 6/10  | JWT real se keys; demo fallback             |
| PWA             | 7/10  | prod-only, manifest ok                      |
| Realtime        | 5/10  | Broadcast (same-tab default)                |
| Prisma/DB       | 5/10  | schema pronto; sem DATABASE_URL = in-memory |


---

## 9. i18n — Estado

### Idiomas suportados: EN · PT · ES · FR · DE · IT

- Sistema: `dict + deepMerge` sobre `en.ts` (~1100+ chaves)
- Landing sections completas: hero, trust, pricing, FAQ, footer, nav, download
- **Incompleto**: dashboards (~100% EN), shell, demo widgets, Expo app (sem i18n)

---

## 10. Navegação — Divergências Web vs Mobile


| Área        | Web App (PWA)                              | Expo Native                                          |
| ----------- | ------------------------------------------ | ---------------------------------------------------- |
| Athlete nav | Today · Sessions · Coach · Inbox · Profile | Home · Discover · Sessions · Programs · Community    |
| Coach nav   | Roster tab                                 | Overview · Athletes · Sessions · Earnings · Settings |
| Strava      | Integrado                                  | Sem integração                                       |
| i18n        | 6 langs                                    | EN only                                              |
| Launcher    | Abre /dashboard?demo=1                     | Não abre app Expo                                    |


**Target:** alinhar Expo com web ou documentar diferença deliberada na UI.

---

## 11. Prisma Schema — Modelos (19)

`User, Athlete, Coach, StravaActivity, StravaToken, StravaWebhook, Session, Readiness, PushToken, ...`

**Problema:** Duas fontes de schema em paralelo:

- `prisma/schema.prisma` (Prisma ORM)
- `supabase/migrations/` (10 SQL) → **Target:** unificar em Prisma-only

**Problema readiness duplicado:**

- `apps/web/lib/readiness/compute.ts`
- `apps/mobile/lib/readiness.ts` → **Target:** extrair para `@fitconnect/utils`

---

## 12. Testes

### Web (forte)

- ~133 testes Vitest (lib/**, componentes)
- 10 specs Playwright E2E
- Coverage mínimo 50% (real ~84%)
- `@fitconnect/strava-integration` — 9 testes

### Mobile (fraco)

- 2 testes apenas (`readiness.test.ts`)
- `apps/web/tests/auth.test.ts` — fora do vitest.config include (nunca corre!)

### Gaps críticos

- 7/9 packages sem testes
- 30 API routes — sem testes directos
- Convex sem testes
- Prisma/ingestion excluídos da coverage

---

## 13. Referências de Design Externas

### Inspiração principal (landing + app)

- **Nivis Gear** (https://nivisgear.com) — boutique premium outdoor brand
  - Fullscreen video hero
  - Flipbook/scroll-jacking navigation
  - Cinematic product shots + editorial layout
  - Dark premium aesthetic
  - Storytelling técnico com detalhes do produto
  - **Adaptar para:** coaching platform em vez de clothing brand

### Securify Hero (referência de layout hero)

- Fullscreen video background (`object-cover`)
- Floating pill navbar (bg-neutral-900/90 backdrop-blur rounded-full)
- Giant staggered text (14vw, absolute positioned)
- Stat blocks nos cantos com números grandes
- Gradient overlay bottom
- Palette: preto, branco, opacidades → adaptar para Voltline

### Bibliotecas de animação aprovadas

- **GSAP** (+ ScrollTrigger, SplitText, MorphSVG, Observer, Flip, Draggable)
  - Instalação: `npm install gsap`
  - Plugins premium requerem license
- **Framer Motion** (`npm install framer-motion`) — React animations
- **Lenis** (`npm install lenis`) — smooth scroll
- **Inspira UI NeuralBg** — background neural animado (Vue, adaptar para React)
- **Impeccable** (https://github.com/pbakaus/impeccable) — design language para AI

### Stack de animação recomendado

```
GSAP ScrollTrigger → scroll-driven reveals
GSAP SplitText → staggered text entrada
Framer Motion → component-level transitions
Lenis → smooth scroll (substituir qualquer scroll nativo)

```

---

## 14. Features Novas a Implementar

### Mapa Interativo (PRIORIDADE ALTA)

- Provider: MapLibre GL JS + OpenFreeMap (free tiles)
- Mostrar em real-time:
  - Atividades Strava do athlete (heatmap de rotas)
  - Eventos desportivos próximos
  - Locais de treino (gyms, tracks, pools)
  - Secret spots (user-generated, gamificado)
  - Coaches disponíveis na área
- Filtros por sport type
- Clustering de markers
- Dark map style (OpenFreeMap dark ou custom via NEXT_PUBLIC_MAP_STYLE_URL)

### Sports Hub

- Todas as 50+ atividades Strava suportadas
- Cards por categoria: Cycling · Running · Swimming · Winter Sports · Water Sports · Strength · Mind & Body · Other
- Cada sport: icon animado, últimas atividades, stats, PRs

### Real-time Dashboard

- WebSocket / Convex para dados live
- Live activity feed durante treino
- Heart rate stream em tempo real
- Coach → Athlete messaging em tempo real (LiveKit)

---

## 15. Decisões Técnicas Acordadas


| Decisão             | Escolha                                         |
| ------------------- | ----------------------------------------------- |
| Persistência Strava | Prisma-only (eliminar store.ts em memória)      |
| Auth                | Supabase em TODAS as rotas (desligar demo mode) |
| Real-time           | Convex (primário) → substituir Broadcast        |
| Smooth scroll       | Lenis                                           |
| Animações           | GSAP + Framer Motion                            |
| Mapa                | MapLibre GL + OpenFreeMap                       |
| Design system       | Voltline tokens (manter) + upgrade tipografia   |
| i18n                | Completar dashboards + Expo                     |
| Stripe              | Implementar real antes de go-live               |


---

## 16. Environment Variables Necessárias

```bash
# Core
NEXT_PUBLIC_DEMO_MODE=false          ← CRÍTICO: desligar

# Database
DATABASE_URL=                        ← Supabase/Postgres
DIRECT_URL=                          ← Supabase direct

# Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Strava
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_VERIFY_TOKEN=                 ← não usar default "fitconnect-dev"

# Stripe
STRIPE_SECRET_KEY=                   ← chave real
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Maps (OpenFreeMap — optional style override)
# NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/dark

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=

# Video/LiveKit
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

```

---

## 17. CI/CD

- **GitHub Actions:** `.github/workflows/ci.yml`
  - lint, typecheck, test, build, Playwright E2E
- **Vercel:** `apps/web/vercel.json` (73 rotas, build recente passou)
- **EAS:** Expo Application Services (mobile — pendente)
- **Playwright:** só `mobile-chrome` project → adicionar Safari

---

## 18. Prioridades de Execução

### P0 — Antes de qualquer utilizador real

1. `NEXT_PUBLIC_DEMO_MODE=false`
2. Auth em todas as rotas `/api/v1/`*
3. Fix hero device i18n
4. Fix `prisma/seed.ts`
5. Stripe real ou esconder payment flows
6. Rate limiting (Upstash) em leads/auth/ingestion

### P1 — Design & UX (este sprint)

1. **Landing redesign** no estilo Nivis Gear → Voltline
2. **Mapa interativo** com todas as atividades Strava
3. **Sports Hub** com todos os 50+ sports
4. i18n completo dashboards + shell + Expo
5. Remover código morto (8 ficheiros)
6. Package `@fitconnect/utils` com readiness partilhado
7. Metadata dinâmica por locale
8. Focus visible + high contrast toggle

### P2 — Polish & Escala

1. EAS build + QR para app nativa
2. Testes API + mobile E2E
3. Consolidar Prisma vs Supabase
4. LCP hero <2.5s

---

## 19. O Que Está Genuinamente Bom (não quebrar)

- Landing visual — nível marketplace premium, trust strip, featured coaches
- Strava integration — arquitectura séria com package próprio
- Auth-gate + hydration fixes — "Signing in" infinito resolvido
- Gamification, integrations hub, readiness explain — boa narrativa
- Monorepo + Turbo + CI — base sólida
- Deploy pipeline — Vercel prod funcional com PWA build
- Prisma schema rico (19 modelos)
- `voltline.css` + `ui-glass/`* — identidade coerente

---

## 20. Nota Global

```
Demo product:     6.5/10
SaaS production:  5.0/10
Design target:    9.5/10

```

---

*Última actualização: Mai 2026 · Gerado por Claude Sonnet 4.6*