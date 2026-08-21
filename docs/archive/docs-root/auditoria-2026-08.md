# Auditoria FitConnect — 2026-08-20

**Âmbito:** repositório actual. Sem implementação neste documento.  
**Regras:** `AGENTS.md`.  
**UI consultada:** `ui-ux-pro-max` `search.py` (ux touch 48dp, style fitness dark, stack jetpack-compose).  
**Decisão de IA (hoje):** 4 destinos + FAB Treinar — ver §E e `docs/DECISION-LOG.md`.

---

## A. Inventário técnico

### Versões (Android)

| Item | Valor | Fonte |
|---|---|---|
| Kotlin | 2.4.10 | `android/gradle/libs.versions.toml:3` |
| AGP | 9.3.1 | `libs.versions.toml:2` |
| Gradle | 9.5.0 | wrapper |
| compileSdk / targetSdk | 35 / 35 | `:app` |
| minSdk phone | 26 | feature modules |
| minSdk Wear | 30 | `:wear` |
| Compose BOM | 2026.06.00 | `libs.versions.toml:4` |
| Material3 phone | BOM-managed `material3` | `libs.versions.toml:47` |
| Wear Compose Material3 | 1.6.2 | `libs.versions.toml:9` |
| Health Connect client | 1.1.0-alpha11 | `libs.versions.toml:69` |
| Health Services (Wear) | 1.1.0-alpha05 | `libs.versions.toml:70` |
| OkHttp | 4.12.0 | sem Retrofit / Ktor |

### Módulos Gradle

`:app`, `:wear`, `:shared`, `:ascend`, `:core-capture`, `:design`, `:design-ui`, `:foundation`, `:sports`, `:geo`, `:telemetry`, `:community`, `:ai`, `:athlete`, `:coach`

Grafo acíclico: JVM (`:design`, `:shared`, `:ascend`) → `:foundation` → features → `:athlete`/`:coach` → `:app`. **Sem ciclos.**

**Não existe** `:core:fitness` nem interface `FitnessProvider`. Health Connect está em `:telemetry` (`HealthConnectProvider` ainda documentado como simulado em `Providers.kt`).

### Rede e segredos

Chamadas: OkHttp em `foundation/.../network/ApiClient.kt` (Bearer nas linhas 218 e 271 — token em runtime, não literal). Supabase Auth REST + Realtime WebSocket no mesmo módulo.

Grep `client_secret|api[_-]?key|Bearer ` em `*.kt` / `*.xml` / `*.properties`:

| Ficheiro | Linha | Nota (sem valores) |
|---|---|---|
| `ApiClient.kt` | 218, 271 | header Bearer a partir do token de sessão |
| `HealthDataPolicy.kt` | 16–17, 286–287 | lista de *scrub* / testes |
| `FitConnectApplication.kt` | 156 | `BuildConfig.SUPABASE_ANON_KEY` |
| `apps/web/tests/fixtures/domain.ts` | 59–60 | fixture `STRAVA_CLIENT_SECRET: "secret"` (não APK) |
| `apps/web/lib/integrations/strava/service.ts` | 83–84 | lê `process.env.STRAVA_CLIENT_SECRET` no servidor |

**Nenhum `client_secret` Strava hardcoded no APK.** Exchange web usa env no servidor — alinhado com `AGENTS.md` §3 para o cliente Android.

---

## B. Risco de conformidade (prioridade máxima)

`AGENTS.md` §1: sessão `provider = STRAVA` **não** pode aparecer a terceiros. Barreira tem de ser DB + RLS, não só UI.

### Tabela de ecrãs

| Ecrã | Fonte de dados | Visível a terceiros? | Risco |
|---|---|---|---|
| Athlete Home — World signal | `CommunityContainer.feed` + `CommunitySeed` | **Sim** (posts de outros) | **VERMELHO** — `WorkoutFacts` sem `provider`; seed com `shareTelemetryFacts=true` (`CommunitySeed.kt:298–311`); `FeedEngine` / `VisibilityResolver` **sem** filtro STRAVA |
| Community feed | mesmo motor | **Sim** | **VERMELHO** — `CommunityScreen.kt` mostra KM/MIN/HR via `workoutFactPairs()` |
| Home squad km | `AscendEngine.squadChallenge()` LOCAL_DEMO | Sim (contribuições) | Âmbar — demo; sem `providerId` |
| Activity live | `LiveActivityEngine` | Não (próprio) | Verde |
| Training / session detail | `LocalAthleteRepository` | Não | Verde |
| Telemetry Device Center | providers incl. Strava simulado | Não (próprio) | Verde se ficar self-only |
| Coach athlete detail | `CoachTelemetryFacade` + privacy consent | **Sim (coach)** | **VERMELHO** se o coach vir origens STRAVA — o facade filtra métrica, **não** provider |
| Coach Overview live squad / feed | wear envelope + seed | Sim (coach) | Âmbar — consentimento de localização; sem filtro STRAVA |
| Wear tile / complication | sessão local | Não | Verde |
| Web dashboard activity feed | seed `a-ines` | Demo público no browser | Âmbar — não é o mesmo grafo; ingestão Strava existe em `apps/web/lib/ingestion/providers/strava.ts` |
| Web `/community` | marketing | N/A produto social | — |

### Google Fit

Grep `com.google.android.gms.fitness`: **zero hits**. Health Connect + Wear Health Services.

### ML / treino de modelos

`AiFeedbackStore` declara que **não** re-treina modelos. `AiPerformanceEngine` consome **resumos** de telemetria (`TelemetryAiAdapter`) **sem** exclusão de proveniência Strava. Risco: dataset de contexto de IA pode incluir linhas Strava se existirem no store — viola `AGENTS.md` §1 se isso for usado para treinar ou para *prompts* partilhados. Hoje é on-device / local, mas o filtro de provider **não existe**.

### Health Connect estados

`HealthConnectAvailability.kt:14–16` mapeia só `SDK_AVAILABLE` vs resto → `UNAVAILABLE`. **Falta o terceiro estado** (`SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED`) com UI distinta (`AGENTS.md` / Bloco 3).

---

## C. Auditoria UI vs M3 Expressive + ui-ux-pro-max

Consultas executadas (Windows: `python` não `python3`):

```
search.py "mobile navigation tab bar" --domain ux
search.py "touch target size 48" --domain ux
search.py "fitness app dark interface" --domain style
search.py "jetpack compose" --stack jetpack-compose
```

**Estilo a reter (não cyberpunk, não pastéis):** `dark-mode-oled` (contraste, OLED) + acento único Volt `#C8FF00` já canónico. Neumorphism full pastéis = anti-premium neste produto. Liquid Glass só como *chrome* de navegação, conteúdo opaco.

**UX touch:** Android **48dp** mínimo (`Accessibility.MIN_TOUCH_TARGET_DP`). Ecrã de treino activo (Bloco 5) pede **≥56dp**.

### Violações concretas

| Violação | Ficheiro:linha | Nota |
|---|---|---|
| 5 abas de paridade (limite premium / M3 Expressive: destinos ≤4 + acção) | `android/athlete/.../navigation/AthleteNav.kt` (`AthleteDest`) | HOME, DISCOVER, ACTIVITY, COMMUNITY, PROFILE. ACTIVITY é acção, não sítio. |
| Idem coach | `CoachNav.kt` (5 destinos bottom) | Sem rail em nenhum breakpoint |
| Bottom floating bar no compacto (não rail) | `EliteNavigation.kt:58–87`, `AthleteScaffold.kt` compact | Não é `NavigationBar` Material deprecado; ainda é chrome de 5 tabs. **Decisão: substituir por 4+FAB** |
| Ícone check sem CD próprio | `ActivityScreen.kt:185` | Pai tem CD; OK se permanece decorative |
| Ícone decorative `EliteRows.kt:47` | verificar se o row tem semantics | |
| Health Connect UI não cobre 3 estados | `HealthConnectAvailability.kt:14–16` | update-required colapsado para UNAVAILABLE |
| Loading >300ms | não medido neste audit (emulador offline) | ⏭️ |
| Acção crítica só por gesto | live activity tem botões Start/Pause/Finish | OK neste ecrã |
| Drawer Material | **não encontrado** | PASS |
| `NavigationBar` / `BottomAppBar` Material | **não encontrado** | PASS (usa `EliteFloatingNavBar`) |
| Tab count >5 | não | 5 = no limite, mas o 5º é a acção de treino |

Touch: `EliteNavTab` usa `heightIn(min = 48.dp)` (`EliteNavigation.kt:166`) — cumpre 48dp, **não** o 56dp do ecrã de treino.

---

## D. Top 10 (impacto ÷ esforço)

Horas = ordem de grandeza de engenharia, não calendário.

| # | Melhoria | Impacto | Esforço (h) | I/E |
|---|---|---|---|---|
| 1 | Barreira `shareable` + filtro Room/feed `provider ≠ STRAVA` + teste que falha sem filtro | Legal P0 | 16 | **Muito alto** |
| 2 | `WorkoutFacts.provider` + seed sem telemetria social sem origem | Legal P0 | 8 | Alto |
| 3 | IA 4+FAB (Hoje / Análise / Conquistas / Perfil) | Produto premium | 24 | Alto |
| 4 | `FitnessProvider` + `:core:fitness` + Health Connect 3 estados + Changes API | Núcleo de dados | 40 | Alto |
| 5 | Coach facade bloqueia STRAVA mesmo com consentimento de métrica | Legal P0 coach | 8 | Alto |
| 6 | AI adapter exclui linhas Strava | Legal §1 IA | 6 | Alto |
| 7 | Ecrã treino activo: 56dp, tabular figures, hold-to-end 1.5s | Uso em movimento | 16 | Médio |
| 8 | Dedup `(providerId, externalId)` Room | Integridade | 20 | Médio |
| 9 | Empty “Hoje” → CTA Health Connect | Retenção | 6 | Médio |
| 10 | Wear: um dado/ecrã já existe; Complication streak + Ongoing | Companion | 12 | Médio |

Não incluir nesta lista: scraping Komoot, leaderboards globais, 5ª aba Community.

---

## E. Decisão de navegação (resposta ao conflito 5 vs 4 abas)

**Escolha: 4 destinos + FAB Treinar.**

Motivo (uso 2026, app ultra-premium, não rede social):

1. Apps de referência (Strava Record, NRC Start, Whoop Today) separam **sítio** de **acção**. Treinar não compete com Hoje.
2. M3 Expressive deprecia a navigation bar clássica; FAB Menu + rail em ≥600dp é o padrão actual.
3. Cinco abas iguais diluem a marca OS: Community como par de Home faz o produto parecer feed, não instrumento.
4. ui-ux-pro-max: touch 48dp+; ecrã de treino (Bloco 5) sobe para 56dp e métrica tabular — isso só funciona se Treinar for um ecrã de sessão, não uma tab permanente.
5. Paleta: manter `--eos-floor` / Volt. Estilo *dark-mode-oled* + um acento. Rejeitar cyberpunk neon e pastéis neumorphic.

Mapeamento:

| Destino novo | Absorve |
|---|---|
| Hoje | Home + pulse de squad + próximo bloco |
| Análise | Discover map, telemetry, recovery, history |
| Conquistas | Vault / Ascend |
| Perfil | Profile + settings |
| FAB Treinar | Activity + session start |

Isto **não está implementado**. Código actual continua com 5 abas. Execução = Bloco 5.

---

## O que este relatório não é

Não é GO de produção. Não prova RLS. Emulador Android esteve offline em sessões recentes — violações de loading/TalkBack **não** medidas ao vivo.
