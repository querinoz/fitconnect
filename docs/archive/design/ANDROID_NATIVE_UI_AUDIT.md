# Android Native UI Audit — Phase D0 (auditoria, zero mudança de código)

**Data:** 2026-08-18
**Escopo:** Fase D0 do "FITCONNECT — ANDROID STUDIO ENGINEERING LOOP" (última versão do mega-prompt, confirmada pelo usuário).
**Regra seguida:** nenhuma linha de código foi alterada nesta fase. Tudo abaixo é auditoria.
**Método:** leitura direta do repositório em `D:\fitconnect\android` via bridge (não staging/cópia — arquivos lidos no local real). Uma tela foi verificada **ao vivo** no emulador (screenshot real). As demais foram inspecionadas **por código-fonte** — marcadas explicitamente como tal, conforme a Regra 2 do próprio prompt ("Never invent evidence").

---

## 1. Inventário real de módulos (15, confirmado via `settings.gradle.kts`)

| Módulo | Papel | Tem UI (Screens)? |
|---|---|---|
| `app` | shell, navegação raiz, auth, onboarding | Sim — 4 screens próprias + telas inline no NavHost |
| `athlete` | experiência do atleta | Sim — 17 screens |
| `coach` | experiência do coach | Sim — 15 screens |
| `wear` | Wear OS | Sim — 1 activity/instrumento (`WearInstrument`) |
| `design` | tokens gerados (cor, spacing, motion, glass) | Não é UI — é a camada de tokens (auto-gerada de `packages/design-tokens`) |
| `design-ui` | componentes Elite (átomos/moléculas) | Sim — biblioteca de componentes, não screens |
| `foundation` | auth, sessão, navegação, i18n, segurança, tema base | Não — lógica pura |
| `community` | feed, posts, comments, reactions, challenges, leaderboards, moderation | **Não — só engines/domínio.** Zero Compose. |
| `ascend` | XP, níveis, achievements, streaks, títulos, anti-abuso | **Não — só engines/domínio.** Zero Compose. |
| `sports`, `geo`, `telemetry`, `ai`, `core-capture`, `shared` | lógica de domínio (sensores, mapas, telemetria, IA, KMP types) | Não — zero arquivos `Screen*.kt` |

**Achado estrutural mais importante desta auditoria:** o mega-prompt pede para "redesenhar" telas de Squads, Gamification (badges, XP bar, level-up), Stories, Reels, Live Squad, Badge Showcase, Player Card. **Essas telas não existem como screens navegáveis ainda.** O que existe é:
- `:ascend` — engine completo (XP, `LevelTable`, `AchievementRegistry`, `StreakLogic`, `TitleRegistry`, `MissionLogic`) — dados prontos, zero UI.
- `:community` — engine completo (`FeedEngine`, `PostEngine`, `ReactionEngine`, `CommentEngine`, `ChallengeEngine`, `LeaderboardEngine`, `GroupEngine`) — dados prontos, zero UI.
- `athlete/ui/community/CommunityScreen.kt` — uma única tela genérica, não um sistema de Feed/Stories/Reels.
- `design-ui/components/EliteAchievementTile.kt`, `ElitePatent.kt` — átomos isolados que uma tela de badges usaria, mas não há tela.

Ou seja: para essas seções do prompt (26, 35, 36, 40 no primeiro mega-prompt; seções equivalentes nos outros dois) o trabalho real é **construir UI nova sobre engines já prontas**, não "redesenhar" algo existente. Isso muda a estimativa de esforço dessas fases (D10–D13 / J–K) para cima.

---

## 2. Sistema de design já existente (achado positivo — o prompt subestima a maturidade atual)

Ao contrário do que os 3 mega-prompts presumem ("crie um sistema de Glass/Liquid Glass/Neumorphism/Motion do zero"), o módulo `design-ui` **já tem**:

- **Glass de 5 níveis já tokenizado**: `EliteGlass.L1`…`L5`, com blur radius dedicado para L3/L4/L5 (`theme/Tokens.kt`), consumido a partir de `EliteSurfaceGlass` gerado em `:design`.
- **Escala de spacing/radius/elevation/opacity** completa e nomeada (`EliteSpace`, `EliteRadius`, `EliteElevation`, `EliteOpacity`), grid de 4dp implícito nos valores.
- **Sistema de motion centralizado**: `EliteMotion` (`motion/EliteMotion.kt`) com 16 presets (`FADE`, `SLIDE`, `SCALE`, `CARD_EXPAND`, `BOTTOM_SHEET`, `NAVIGATION`, `MICRO`, `LOADING`, `SUCCESS`, `ERROR`, `PAGE`, `SPRING`, `DECELERATE`, `EMPHASIS`, `ENTER`, `EXIT`), com suporte nativo a `reduceMotionEnabled()` (retorna `tween(0)` quando ativo — acessibilidade de movimento já implementada, não é gap).
- **Honeycomb atmosphere** (`EliteAtmosphere` — subtle/parallax/pulse) — um efeito de fundo específico da marca que nenhum dos 3 prompts menciona, e que deve ser preservado (é identidade visual, não genérico).
- **`LocalHighContrast`** já existe como composition local — acessibilidade de contraste já tem gancho arquitetural.
- Biblioteca de ~30 componentes `Elite*` (Button, Card, Sheet, Navigation, Chrome/Badge, Input, InstrumentRing, RecoveryRing, Chart, FeedPost, Hexatar/avatar, Media, Rows, ShareCard, Controls, Feedback) — cobre boa parte da seção 31 dos prompts ("Component Library") já.

**Conclusão desta seção:** as fases D2 (Design Tokens), D3 (Surfaces/Glass), D8/D14 (Motion) do loop têm uma base real para auditar-e-consolidar, não para construir do zero. O risco maior não é ausência de sistema — é **inconsistência de uso** (ver seção 3).

---

## 3. Inconsistência de uso confirmada (build sobre auditoria anterior desta sessão)

Já documentado em `docs/audit/MOBILE-DUPLICACAO.md` (auditoria anterior desta sessão) e revalidado aqui:

| Achado | Local | Severidade |
|---|---|---|
| `FoundationScreen` genérico (Material 3 puro, zero token Elite) usado em 5 rotas de arranque (GUEST, fallback de HOME, ERROR, ROLE) | `app/.../FitConnectNavHost.kt:393`, usado nas linhas 117/243/272/388 | **P0** — provavelmente a causa direta da queixa "não está com qualidade" |
| `DesignSystemCatalog()` acessível por deep link não protegido em produção (`fitconnect://app/catalog`) | `FitConnectNavHost.kt:251-257` | P1 |
| `apps/mobile` (Expo, congelado pela ADR-005) duplica 22 telas e colide `scheme`/`name` com o app nativo | `apps/mobile/app.config.ts` | P0 (duplicação real, não só visual) |

Essas 3 já tinham fix proposto no áudito anterior; permanecem válidas e não foram tocadas nesta fase (D0 = zero mudança).

---

## 4. Evidência ao vivo (única tela verificada em runtime nesta fase)

**`athlete/HomeScreen`** (rota logada, `AppDestination.LoggedHome`) — screenshot real capturado do emulador `fitconnect_phone:5556` nesta sessão:

- Header "FitConnect" com badge `LOCAL_DEMO`
- "Athlete OS · Today" / "Good evening, Inês"
- Anel Prime Recovery (59, Moderate) — usa `EliteInstrumentRing`/`EliteRecoveryRing` pelo padrão de nome
- Cards HRV / Day Strain / Sleep
- Bloco AI Directive + botão "Start session"
- Navegação inferior flutuante (Home/Discover/Activity/Community/Profile)

**Avaliação desta tela específica:** consistente com o sistema Elite (fundo escuro, verde-limão como acento, hierarquia clara: sinal primário → secundários → ação). **Não** é a tela genérica do Achado P0 acima — então o problema de qualidade relatado pelo usuário não está na Home, está em outra rota (mais provável: a rota de arranque/guest, ou uma das 32 telas ainda não vistas ao vivo).

**Todas as outras ~31 telas de `athlete`/`coach` + as 4 de `app` + a do `wear` não foram vistas ao vivo nesta fase — apenas listadas por nome de arquivo.** Não há avaliação de qualidade visual para elas ainda; isso é trabalho de fase seguinte (precisa de build + navegação real, que depende dos comandos que você roda — ver pedido na seção 6).

---

## 5. O que esta auditoria NÃO cobre (limitação real, não escondida)

- Conteúdo interno de cada uma das ~32 screens de `athlete`/`coach` (só sabemos que existem, não a qualidade de cada uma).
- Versões reais instaladas de Android Studio / SDK / Build Tools / emulator / AVDs disponíveis — não tenho acesso de execução de terminal nesta sessão (só clique, não digitação — restrição de plataforma).
- Estado atual do `:app:assembleDebug`/testes — o último dado real que tenho é do relatório `FINAL_ANDROID_WEAR_KMP_COMPLETION_REPORT.md` (2026-08-17): 166/166 testes unitários, `assembleDebug` PASS, emulador bloqueado por hypervisor **naquela data**. Você confirmou que o emulador já funciona agora — preciso de uma leitura atualizada (comandos abaixo).
- Performance (Profiler), Layout Inspector, TalkBack, recomposição — nada disso foi medido; requer sessão interativa no Android Studio que só você pode dirigir.

---

## 6. Pedido para a Fase A (Environment Report) — comandos para você rodar

Cole a saída de cada bloco e eu preencho `docs/android/ANDROID_STUDIO_ENVIRONMENT_REPORT.md` com dados reais em vez de placeholders:

```powershell
# versões
java -version
.\android\gradlew.bat -v
adb --version
emulator -version

# AVDs disponíveis
emulator -list-avds

# device atual
adb devices

# Android Studio (Help > About, ou via linha de comando se tiver o launcher no PATH)
```

---

## Status conforme seção 47 do prompt

```
ENVIRONMENT   = PENDING_HUMAN (aguardando output acima)
GRADLE        = UNVERIFIED nesta sessão (última evidência real: 2026-08-17, PASS)
BUILD         = UNVERIFIED nesta sessão
TESTS         = UNVERIFIED nesta sessão (última evidência real: 166/166 PASS, 2026-08-17)
ANDROID_EMULATOR = PARCIAL — 1 screenshot real capturado (Home), demais telas não visitadas
VISUAL        = PARCIAL — 1/33 telas com evidência ao vivo
AUDITORIA D0  = PASS (este documento)
```

Nenhum PASS acima foi inventado — cada um está com a evidência que o sustenta ou marcado como não verificado.
