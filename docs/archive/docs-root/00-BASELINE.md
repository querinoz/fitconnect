# FASE 0 — Baseline FitConnect / Elite OS

**Data:** 2026-08-17  
**HEAD:** `3d7dbfa`  
**Branch actual:** `chore/android-phase-13r-recovery` (working tree sujo; não é `feat/elite-os-v2`)  
**Âmbito desta auditoria:** app Android Compose (`android/`). Web Next.js e Expo existem no monorepo mas **não** são o alvo do MEGA PROMPT (emulador + APK).  
**Regra:** este ficheiro é reconhecimento. Nenhum código de produção foi alterado nesta fase.

---

## Contexto preenchido (FASE 0)

| Campo | Valor detetado |
| --- | --- |
| Nome do produto | FitConnect |
| Tema / design | Elite OS (shell) + **Elite Surface** (sistema de design, ADR-007). “ELITE OS v2” **não existe como branch/token set**. |
| Repositório | `D:\fitconnect` (monorepo). Prod web: `https://fitconnect-phi.vercel.app` |
| Stack (alvo do prompt) | **Kotlin + Jetpack Compose** (AGP 9.3.1, Kotlin 2.4.10, Compose BOM 2026.06.00) |
| Outras stacks no repo | Next.js 14 (`apps/web`), Expo 52 (`apps/mobile`, Path A frozen), Rust elite-core |
| Gestor de dependências | Gradle (Android) + pnpm 9.15.9 (tokens/web) |
| Package / applicationId | `com.fitconnect.android` · debug suffix `.debug` → `com.fitconnect.android.debug` |
| minSdk / compileSdk / targetSdk | **26 / 35 / 35** |
| Backend / dados | **Local in-memory** nos motores Android (`LocalAthleteRepository`, `DefaultCommunityContainer`, ASCEND). REST `API_BASE_URL` aponta a Vercel. Supabase/Firebase **configurados no BuildConfig**, fail-closed se em falta. |
| Autenticação | Sim: `AuthRepository` composto (Firebase / Supabase / `LocalAuthRepository` demo). Debug: `ALLOW_LOCAL_AUTH=true`. Label honesta `LOCAL_DEMO`. |
| Ficheiro de referência visual | Referências do prompt = mockups genéricos. Referência **canónica do produto:** `packages/design-tokens/`, `docs/design/FITCONNECT_SURFACE_SYSTEM.md`, screenshots `qa/reports/screenshots/2026-08-17/`. **Não há** `/docs/reference/` nem app AI Studio no repo. |

---

## 1. Árvore relevante (ignorado: `node_modules`, `build`, `.gradle`, `dist`)

```
fitconnect/
├── android/                 ← produto nativo (este prompt)
│   ├── app/                 entry: MainActivity, FitConnectNavHost
│   ├── athlete/             Athlete OS
│   ├── coach/               Coach OS
│   ├── design + design-ui/  Elite Surface tokens + Compose
│   ├── community/           feed in-memory LOCAL_DEMO
│   ├── ascend/              XP / níveis / missões
│   ├── telemetry, sports, geo, ai, core-capture, foundation, shared
│   └── wear/                companion Wear OS
├── packages/design-tokens/  fonte de verdade de cor/espaço (ADR-007)
├── apps/web/                Next.js (fora de âmbito imediato)
├── apps/mobile/             Expo frozen
├── docs/design/             auditorias D0–D9 já escritas
└── .github/workflows/android.yml
```

**Módulos Gradle:** `:app` `:wear` `:shared` `:ascend` `:core-capture` `:design` `:design-ui` `:foundation` `:sports` `:geo` `:telemetry` `:community` `:ai` `:athlete` `:coach`

**Entry point:** `com.fitconnect.android.MainActivity`  
**Navegação:** Navigation Compose. Núcleo `AppDestination` + `NavGuard` (`CoreRoute`). Grafos aninhados `AthleteNavHost` / `CoachNavHost`.  
**Estado:** Compose `remember` + contentores manuais (`DefaultAthleteContainer`, sem Hilt). Poucos ViewModels (Auth tem `AuthViewModel`).  
**Dados:** repositórios locais + motores in-memory. Sem Room como source of truth do feed.  
**CI:** `.github/workflows/android.yml` — lint/unit/`assembleDebug`; release **fail-closed** sem keystore.

---

## 2. Build actual (evidência)

Comando (2026-08-17):

```
cd android
.\gradlew.bat :app:assembleDebug :design-ui:testDebugUnitTest :community:testDebugUnitTest :athlete:testDebugUnitTest --continue
```

| Item | Resultado |
| --- | --- |
| Exit code | **0** `BUILD SUCCESSFUL in 14s` |
| Log | `docs/qa/fase0-assembleDebug.log` |
| APK debug | `android/app/build/outputs/apk/debug/app-debug.apk` — **27.52 MB** (timestamp 21:06) |
| `:design-ui` unit | **11/11 PASS** (ColorRoles 5, Motion 3, Instrument 2, ChartKind 1) |
| `:community` unit | **1/1 PASS** |
| `:athlete` unit | **6/6 PASS** |
| `./gradlew build` completo (lint + todos os módulos + release exclusões) | **não executado nesta fase** (CI faz isso; ~40 min) |
| `connectedDebugAndroidTest` | **não existe** pasta `androidTest/` no `android/` |
| Emulador ligado agora | `adb devices` → **vazio** (AVDs existem; nenhum processo emulator nesta sessão) |

---

## 3. Inventário de ecrãs

### 3.1 Núcleo (`FitConnectNavHost`)

| Rota | Ecrã | Estado | Dados |
| --- | --- | --- | --- |
| `splash` | splash → redirect | funciona | `SessionStore` |
| `guest` | onboarding / guest shell | funciona | local |
| `auth` | `AuthScreen` | parcial | Firebase/Supabase se keys; senão local demo |
| `home` | Athlete **ou** Coach shell | funciona | role |
| `role` | `RoleSelectScreen` | funciona | sessão |
| `catalog` | `DesignSystemCatalog` | funciona (QA interno, não produto) | estático |
| `error` | erro | stub/mínimo | — |
| Coach onboarding | `CoachOnboardingScreen` | parcial | local |

### 3.2 Athlete OS — tabs fundo

**Código actual (2026-08-20):** ainda **HOME · DISCOVER · ACTIVITY · COMMUNITY · PROFILE** em `AthleteNav.kt`.

**Lock de produto (supersede):** **Hoje · Análise · Conquistas · Perfil** + FAB **Treinar**. Community não é aba de paridade. Ver `AGENTS.md` §6 e `docs/auditoria-2026-08.md` §E. Execução = Bloco 5.

| Rota | Ecrã | Estado | Fonte |
| --- | --- | --- | --- |
| `athlete/home` | Home cockpit | funciona (denso) | LocalAthlete + ASCEND + community seed |
| `athlete/discover` | marketplace coaches + mapa demo | funciona | geo catalog + fotos demo |
| `athlete/activity` | live capture | parcial | LiveActivityEngine |
| `athlete/community` | feed + composer | funciona (LOCAL_DEMO seed) | `:community` in-memory |
| `athlete/profile` | ElitePlayerCard, accent Volt | funciona | ASCEND + profile local |
| `athlete/training` | lista sessões | funciona | local |
| `athlete/training/{id}` | detalhe sessão | parcial | local |
| `athlete/programs` | programas | parcial | community programs |
| `athlete/recovery` | recovery | funciona | telemetry facade |
| `athlete/sleep` | sleep | parcial | telemetry |
| `athlete/daily` | daily steps/kcal | **parcial / vazio** | store vazio → empty state honesto |
| `athlete/sports` | sports | parcial | sports engine |
| `athlete/telemetry` | device center | parcial | telemetry |
| `athlete/ai` | AI coach | parcial | demo adapter |
| `athlete/notifications` | alerts | stub/demo | lista local |
| `athlete/settings` | settings + accent | funciona | DataStore prefs |
| `athlete/vault` | Performance Vault / ASCEND | funciona | AscendEngine |

### 3.3 Coach OS — tabs fundo

**Home · Athletes · Calendar · Inbox · More**

| Rota | Estado |
| --- | --- |
| overview, athletes, athlete detail, calendar, sessions, session detail | parcial (dados demo) |
| programs + builder | parcial |
| bookings, analytics, revenue, inbox, AI, notifications, settings, profile | parcial / demo |

### 3.4 Wear

| Ecrã | Estado |
| --- | --- |
| `WearInstrument` (único) | parcial — companion, “LINK UNVERIFIED”, Health Services probe |

### 3.5 Inexistentes (não inventar)

Nutrição, Stories/Reels, DMs, honeycomb background, 3D heart/bicep mesh, ecrã Analytics estilo mockup, nav FITNESS/FEED, sync Apple Health nativo.

---

## 4. Matriz de funcionalidades

| Funcionalidade | Estado |
| --- | --- |
| Auth email / Google / Apple / magic link | **parcial** — ports reais; debug local; prod fail-closed sem secrets |
| Role athlete/coach | funciona |
| Home readiness / HRV / strain / sleep tiles | funciona (números demo/telemetria) |
| Live activity capture | parcial |
| Community feed + fotos + vídeo demo + reacções | funciona (LOCAL_DEMO, in-memory) |
| Discover coaches + booking | parcial (geo in-memory) |
| ASCEND XP / missões / streak | funciona (demo labeled) |
| Wear companion | parcial |
| FCM / push real | **partido / stub** sem `google-services.json` |
| Stripe / pagamentos | stub (web demo; Android não é checkout) |
| Persistência social / RLS | **não existe** |
| i18n Android 6 locales | **parcial** — strings EN/PT/ES; dashboards ainda EN |
| TalkBack em todos os ecrãs | **não verificado** (sem instrumented a11y) |
| Light mode | tokens LIGHT_* existem; cobertura visual incompleta |
| HoneycombBackground | **não existe** |
| Confetti / casino celebration | **não existe** (e é política: não adicionar) |

---

## 5. Design system actual (não substituir às cegas)

Fonte: `packages/design-tokens/index.ts` → gerado `EliteSurfaceTokens.kt` (`pnpm tokens:kotlin`).

### Cor (canónica)

| Token | Hex | Papel |
| --- | --- | --- |
| floor | `#070B14` | fundo |
| voltline | `#C8FF00` | CTA / atleta |
| connect | `#00DDB4` | telemetria / confiança |
| telemetry | `#3CD7FF` | live |
| iris | `#6C63FF` | focus |
| performance | `#00E090` | sucesso |
| recovery | `#FFB020` | aviso |
| alert | `#FF3A5C` | erro |
| volt 300/400/600 | espectro Volt | personalização de acento |

Light: `LIGHT_FLOOR` `#E4E1EE`, primary light = `VOLT_600`.

### Espaço (8pt + meios)

`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64` — **não** a grelha do prompt (`md 20 / lg 28`).

### Raio

`4 / 8 / 12 / 16 / 24 / 999` — **não** `sm 12 / md 20 / lg 28`.

### Motion

`micro 150ms / ui 220ms / screen 400ms / data 1200ms` + spring `damping 0.82 / stiffness 380`. Reduce motion via `LocalReduceMotion`.

### Glass

Escada L1–L5 + highlight. **Proibido fullscreen blur.**

### Componentes Compose já existentes (mapear, não duplicar)

`EliteCard` (GlassCard), `EliteRecoveryRing` / `ElitePrimeInstrument` (StatRing), `EliteMetricCard` / `EliteBentoMetric` (MetricTile), `EliteButton` (sem haptic dedicado), `EliteSegmentedControl`, `EliteFloatingNavBar` (BottomNav), `EliteBottomSheet`, `EliteChip`, `EliteAvatar`, `EliteEmptyState`, `EliteSkeleton`, snackbar host, `EliteChart`, `AscendStreakCard`, `EliteWordmarkHeader`, `EliteFeedPost`, catalog `DesignSystemCatalog`.

**5 estados (hover/focus/pressed/disabled/loading) por componente:** incompleto. Catalog não cobre todos.

### Hardcoded

- `Color(0x…)` em `.kt` de feature: **0 ocorrências** na pesquisa (bom).
- `.dp` literais pontuais em athlete (`DiscoverScreen`, `TrainingScreen`).
- Wear: `Color(EliteSurfaceColors.VOLTLINE)` — token, OK.
- Prompt pede 0 literais fora de `tokens.*` — gerador Kotlin **é** o tokens file; Compose deve continuar a ler `EliteSpace` / `EliteSurfaceColors`.

---

## 6. Código morto / dívida (suspeitos — não remover ainda)

| Candidato | Porquê não apagar agora |
| --- | --- |
| `apps/mobile` Expo | Path A frozen, ainda referenciado |
| `components/ui-glass` web | ~47 imports |
| Dual Prisma / Supabase SQL | decisão de unificar, não Android |
| Catalog route | usado em QA visual |
| `NoOpImageLoader` | Coil ainda não ligado (política: não inventar cliente de imagem nas features) |
| `androidTest/` ausente | gap, não morto |
| Skills `.cursor/skills/` do prompt | **não instaladas** — 30+ skills de repos externos; risco de ruído |

TODO/FIXME em Kotlin Android: **0** (`TODO`/`FIXME`).

---

## 7. Testes existentes (Android)

46 ficheiros `*Test*.kt`. Cobertura forte em foundation/telemetry/sports; fraca em UI Compose e **zero** instrumented.

**Não executado nesta fase (demasiado largo para GATE 0):** suite completa de todos os módulos, lint global, monkey, gfxinfo, TalkBack, light+200% font.

---

## 8. Emulador / AVDs (inventário, sem arranque)

`avdmanager list avd`:

| AVD | Perfil | Estado FASE 0 |
| --- | --- | --- |
| `fitconnect_phone` | Pixel 7, API 17 tag “CinnamonBun” Play Store x86_64 | existe; **não ligado** agora |
| `fitconnect_wear` | Wear OS 5 / API 14 | existe; não ligado |
| Pixel 8 / API 35 | pedido no prompt | **não existe** |
| Pixel 4a / API 30 | pedido | **não existe** |
| Tablet / API 34 | pedido | **não existe** |

Criar 3 AVDs extra = tempo + disco; **não feito** sem aprovação.

Screenshots recentes (sessão anterior, emulator-5554):  
`qa/reports/screenshots/2026-08-17/d0/d1-community-feed.png`, `d1-home-world.png`, `d1-discover-covers.png`.

---

## 9. Conflitos do MEGA PROMPT vs produto (obrigatório recusar execução cega)

Regra 9 do prompt: se a instrução colidir com boas práticas / ADRs, **não executar**.

| Pedido no MEGA PROMPT | Canónico FitConnect | Proposta |
| --- | --- | --- |
| Floor `#0A0C10` | `#070B14` (ADR + tokens) | **Manter `#070B14`**. `#0A0C10` seria um segundo sistema. |
| Acento `#C8FF3D` ou `#3DE1FF` | Volt `#C8FF00` + Telemetry `#3CD7FF` já existem | **Manter Voltline**. `#3DE1FF` ≈ telemetry, não CTA. |
| Radius 12/20/28 | 8/12/16/24 | Manter escala actual; não partir cartões já QA’d |
| Nav FITNESS / STATISTIC / FEED | HOME DISCOVER ACTIVITY COMMUNITY PROFILE | **Não mudar tabs** |
| Emoji 🔥💪 no UI crítico | chips + labels; anti-casino | Emoji só como acento opcional **com** label; nunca em métricas |
| Confetti / 3 beats fireworks | reacções = chips | **Não** |
| Honeycomb 3–8% procedural | não existe; glass ladder | Só se aprovado: Canvas subtil, intensity off por default, reduce-motion = estático |
| “Não inventes funcionalidades” vs Honeycomb + celebração | honeycomb é **feature nova** | Gate: honeycomb só após sim explícito |
| Instalar 30 skills de GitHub | skills locais já cobrem Elite Surface | Instalar **depois** do GATE 0, e só as Android QA (emulator, a11y) — não o dump inteiro |
| Branch `feat/elite-os-v2` + commits atómicos | working tree enorme por commitar | **Não criar branch/commits** até aprovares FASE 1 e a política de git |
| Dados falsos na UI de produção | seed LOCAL_DEMO já marcado | Manter label; não fingir milhares de users reais |
| Contraste 4.5:1 | Volt em floor é alto; muted text precisa medição | Medir na FASE 1, não assumir |

---

## 10. Riscos

1. Working tree já tem dezenas de ficheiros não commitados — um redesign em cima disto mistura histórias.  
2. Community/ASCEND são demo in-memory — polish visual ≠ produção.  
3. Daily Activity está vazia de propósito (sem Health Connect steps). Um redesign “tipo Apple Fitness” com 3789 steps **inventados** violaria honestidade.  
4. `connectedAndroidTest` = 0. GATE 5 TalkBack/jank exigem emulador ligado + testes a criar.  
5. Trocar paleta parte web + Android + Wear + tokens check CI.

---

## 11. O que FASE 1 **não** fará até haver sim

- Não editar `packages/design-tokens` para `#0A0C10` / `#C8FF3D`.  
- Não instalar o catálogo completo de skills.  
- Não criar AVDs extra.  
- Não commitar.  
- Não aplicar honeycomb, nutrição, nova nav, ou confetti.

---

## 12. FASE 0 v5 addendum (2026-08-18) — MEGA PROMPT questions

Read-only re-audit. No Gradle this session. Snapshot already at `a913959`. Branch `feat/elite-os-v2` @ `fc8bdc7`.

### Existe já alguma superfície web? Que forma tem?

**Sim.** `apps/web` is Next.js 14 (App Router), production Vercel `https://fitconnect-phi.vercel.app`.

| Kind | Routes (examples) |
|---|---|
| Marketing / landing | `/` (`LandingPageContent`, editorial Voltline) |
| Athlete app | `/dashboard`, `/sessions`, `/profile`, `/map`, `/inbox`, `/settings/*` |
| Coach app | `/coach/dashboard`, roster, earnings, inbox |
| Admin | `/admin/*` |
| PWA shell | `/app/mobile`, install prompt — **not** IndexedDB-backed |

This is option 2 in MEGA PROMPT §3.1, already shipping. See `docs/ADR-001-multiplatform.md`.

### O backend suporta subscrições em tempo real, ou é REST com polling?

**Hybrid, mostly incomplete.**

- Web: `resolveTransport` — `presence:`/`chat:` → Supabase Realtime; else Convex **or** Broadcast (docs default = broadcast / same-tab demo).
- Android: `SupabaseRealtimeClient` WebSocket if keys; else InProcess debug / fail-closed.
- REST v1 still exists (`/api/v1/*`), demo bypass known P0.
- Watch does **not** use the internet for live telemetry; Data Layer only.

See `docs/ADR-002-realtime-sync.md`.

### Há módulo Wear? Há `play-services-wearable`?

**Yes / yes.** `:wear` module, `WearInstrument` + Health Services **probe**. Catalog: `play-services-wearable` **19.0.0**. `implementation` on `:app`, `:wear`, `:telemetry`. Capability `fitconnect_telemetry`. Complications, tiles, ambient B/W **not** implemented.

### Onde vive a lógica de domínio?

| Layer | Shareable? | Location |
|---|---|---|
| Session SM, outbox, envelope, realtime types | Yes (kotlin-jvm, no Android) | `android/shared` |
| Tokens | Yes (TS → CSS + Kotlin) | `packages/design-tokens` |
| Physiology | Planned Rust | Elite Core — often unbuilt |
| Athlete UI + LOCAL_DEMO engine | Coupled | `:athlete`, `:core-capture` |
| Web dashboard stores / readiness | Coupled to TS | `apps/web/lib/*` |

Extraction of `:shared` is the prerequisite that already started. UI is not KMP.

### Companion design docs

| File | Present? |
|---|---|
| `docs/design/ELITE_OS_HANDOFF.md` | Yes — locked deviations |
| `ELITE_OS_VISUAL_SPEC.md` | **Missing** |
| `ELITE_OS_MOTION_BACKGROUND_WIDGET.md` | **Missing** |

Proceed on HANDOFF + tokens. If the missing files arrive and conflict, stop.
