# FASE A + D1 — Environment Recovery, Remediação P0/P1, Auditoria de UI

**Data:** 2026-08-18
**Documento anterior:** `docs/design/ANDROID_NATIVE_UI_AUDIT.md` (Fase D0) — **intacto**, este é evidência nova, não sobrescreve.
**Regra aplicada:** nada foi apagado; nada foi declarado PASS sem output que o prove.

---

## 1. O achado que muda o plano

A auditoria D0 dizia que o gap visual estava em telas não vistas. **Medi todas elas por código-fonte e o resultado é o oposto do esperado:**

| Veredito | Telas | |
|---|---|---|
| **OK** (Elite OS consistente, zero Material cru) | **36 / 37** | |
| **PARCIAL** | **1 / 37** | `ActivityScreen` — um único `Slider` Material 3 cru |
| **GAP** (Material puro / zero Elite) | **0 / 37** | |

Método: para cada uma das 37 telas de `app`/`athlete`/`coach`/`wear` contei ocorrências de componentes `Elite*` contra 30 componentes Material 3 crus, cores hardcoded (`Color(0x…)`) e literais `.dp` mágicos fora dos tokens.

Exemplos (Elite / Material cru / cores hardcoded):
`HomeScreen` 73/0/0 · `AuthScreen` 81/0/0 · `ProfileScreen` (athlete) 75/0/0 · `OverviewScreen` (coach) 64/0/0 · `ActivityScreen` 87/1/0 · `TelemetryScreen` 40/0/0.

**Conclusão:** não existe uma dívida visual espalhada por 32 telas. A queixa de qualidade vinha de um conjunto muito pequeno e muito visível de superfícies — que eram exatamente as que **não** seguem o padrão de nome `*Screen.kt` e por isso escaparam à contagem inicial. Encontrei-as com uma segunda varredura sobre todo ficheiro com `@Composable` fora daquele padrão.

### As superfícies realmente fora do padrão

| Ficheiro | Elite | Material cru | Diagnóstico |
|---|---|---|---|
| `FitConnectNavHost.FoundationScreen` | 0 | Column + Button + MaterialTheme | **P0** — 4 rotas de arranque (GUEST, fallback HOME, ERROR, ROLE) |
| `ui/ErrorBoundary.kt` | 0 | Column + Button | **P0** — ecrã de falha, e com copy em inglês hardcoded (não localizado) |
| `AthleteScaffold` / `CoachScaffold` | 14 / 10 | 1 `Scaffold` cada | ✅ legítimo — `Scaffold` é estrutura/ergonomia Android, é o que a §10 do prompt manda usar |
| `WearInstrument` | 16 | 7 `Button` | ✅ legítimo — são `androidx.wear.compose.material.Button`, o componente **correto** para Wear (não é Material 3 de telemóvel) |
| `AthleteNav` / `CoachNav` | 0 | 0 | ✅ legítimo — só grafo de rotas, sem UI |

Ou seja: **duas** superfícies com problema real, ambas de arranque/falha — as duas mais prováveis de o utilizador ver quando algo corre mal, e as duas que davam a impressão de "outro produto".

---

## 2. Remediação executada

### P0-a — `FoundationScreen` (4 rotas de arranque)
`android/app/src/main/java/com/fitconnect/android/ui/navigation/FitConnectNavHost.kt`

Antes: `Column` sobre `MaterialTheme.colorScheme.background`, `Text` Material, `Button` Material, `padding(24.dp)` mágico.
Depois: `HoneycombAtmosphere` (atmosfera da marca) → `EliteCard(Glass)` → `EliteSysLabel` + tipografia Elite + `EliteButton` (primário/secundário), spacing por `EliteSpace.Inset/Sm/Xs/Lg`.

**Preservado deliberadamente:** assinatura da função, todos os `testTag` (`screen_guest`, `screen_home`, `screen_role`, `screen_error`, `*_primary`, `*_secondary`), o contrato de acessibilidade (o `EliteButton` já garante `MIN_TOUCH_TARGET_DP` internamente e aceita `contentDescription`). Nenhuma rota, botão ou fluxo removido.

### P0-b — `ErrorBoundary`
`android/app/src/main/java/com/fitconnect/android/ui/ErrorBoundary.kt`

Mesmo tratamento visual, e um bónus não previsto: as strings estavam **hardcoded em inglês** (`"Something went wrong"`, `"Retry"`). Passaram a usar os recursos já traduzidos `nav_error_title`, `nav_error_body`, `auth_retry` — ou seja, o ecrã de erro deixa de aparecer em inglês para um utilizador pt/es. Comportamento (retry + logging) idêntico.

### P1 — guarda da rota de catálogo
```kotlin
if (BuildConfig.DEBUG) {
    composable(route = AppDestination.Catalog.route, deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/catalog" })) {
        DesignSystemCatalog()
    }
}
```
Em release a rota e o deep link deixam de existir no grafo, e o R8 passa a poder remover `DesignSystemCatalog` do APK. Verifiquei antes de mexer que **nada** no código navega para `CoreRoute.CATALOG` (só o mapeamento em `AppDestinations.kt`), portanto a guarda não quebra nenhum caminho existente.

### Fronteira Expo ↔ nativo
`apps/mobile/app.config.ts`

| | Antes | Depois |
|---|---|---|
| `name` | `FitConnect` | `FitConnect (Expo)` |
| `scheme` | `fitconnect` ⚠️ colidia | `fitconnect-expo` |
| `android.package` | (derivado do slug) | `com.fitconnect.expo` |
| `ios.bundleIdentifier` | (derivado) | `com.fitconnect.expo` |

E `apps/mobile/lib/notifications.ts` — o deep link `fitconnect://sessions/s-101` foi realinhado para `fitconnect-expo://` (senão a notificação da Expo abriria o app nativo).

**Nada foi apagado.** A app Expo continua a existir e a compilar; deixou apenas de se fazer passar pela nativa. A decisão de matar ou reanimar continua em aberto (ADR-005/ADR-010) — é sua, não minha.

### Bónus — distinguir debug de release
Criado `android/app/src/debug/res/values/strings.xml` com `app_name = "FitConnect DEBUG"` (+ `tools:ignore="MissingTranslation"`, por ser string só de debug). Como o debug já instala com `applicationIdSuffix = ".debug"`, os dois builds podiam coexistir com ícones e nomes idênticos — agora não.

---

## 3. Verificação feita e não feita (honestidade explícita)

**Feita nesta sessão:**
- Balanço de chavetas/parênteses dos 2 ficheiros Kotlin reescritos: `{}` 89/89 e 9/9, `()` 203/203 e 33/33 — **OK**.
- Zero imports duplicados; imports que a reescrita tornou órfãos (`sizeIn`, `Accessibility`, `material3.Button`) removidos após verificação de que não restava uso real (o `Button(` residual era só `EliteButton(`).
- Existência e assinatura de **cada** símbolo Elite usado, lida no código-fonte: `EliteButton(label,onClick,modifier,variant,enabled,loading,status,contentDescription)`, `EliteCardVariant.Glass`, `EliteSysLabel(text)`, `HoneycombAtmosphere(modifier,strokeColor)`, `EliteSpace.{Inset,Sm,Xs,Lg}`.
- `:app` depende de `:design-ui` e `:foundation` — confirmado em `app/build.gradle.kts`.
- Nenhum teste existente referencia os `testTag` tocados (procurei em `app/athlete/coach src/test`) — não há teste para quebrar.

**Não feita — e não vou fingir que foi:**
- **Compilação.** Não executei `gradlew`. Não tenho shell na sua máquina Windows (a plataforma dá-me clique, não escrita, em terminais/IDEs) e o SDK Android não existe no ambiente onde corro comandos.
- **Runtime das alterações.** As 2 telas que corrigi ainda não foram vistas a correr.
- **Baseline de screenshots.** Existe **1** screenshot real (a Home do atleta, capturada antes destas alterações). Não 37.
- Profiler, Layout Inspector, TalkBack, recomposição: nada medido.

---

## 4. Bloco de status

```
P0_REMEDIATION:              PASS (código) / UNVERIFIED (build)
                             2 superfícies corrigidas: FoundationScreen (4 rotas) + ErrorBoundary
P1_REMEDIATION:              PASS (código) / UNVERIFIED (build)
                             catálogo + deep link só em BuildConfig.DEBUG
EMULATOR:                    PASS (existe e arranca — fitconnect_phone:5556 visto a correr)
                             BLOCKED para mim (sem adb/typing nesta sessão)
RUNTIME_SCREENS:             1 / 37 VERIFIED   (Home do atleta, pré-alterações)
VISUAL_QA:                   PARTIAL
ELITE_OS_USAGE:              PASS  (36/37 telas OK, 1 PARCIAL, 0 GAP — medido por código)
ACCESSIBILITY:               UNVERIFIED (contrato preservado; TalkBack/escala de fonte não testados)
PERFORMANCE:                 UNVERIFIED (nada perfilado)
EXPO_NATIVE_BOUNDARY:        PASS (name, scheme, applicationId e bundleId agora distintos)
PRODUCTION_DEBUG_ROUTE_GUARD: PASS (código) / UNVERIFIED (build)
NEXT_PHASE:                  BLOCKED → precisa de build + varrimento de ecrãs
```

**UI_NOT_IMPLEMENTED** (engines completos, zero UI — confirmado na D0, não construir agora):
- Ascend: XP, níveis, badges, conquistas, streaks, títulos, missões (`:ascend`)
- Squads: squad home, live squad, missão, mapa, XP coletivo
- Social: feed dedicado, stories, reels, comentários, reações (`:community` tem os engines)
- Player Card / Badge Showcase / Journey no perfil

**PENDING_HUMAN** (dependências humanas reais, não desculpas):
1. Executar `gradlew test`, `gradlew lintDebug`, `gradlew :app:assembleDebug` e colar o resultado — é o único caminho para os PASS acima deixarem de ser condicionais.
2. Instalar o APK e percorrer as telas para a baseline de screenshots.
3. Decidir o destino da app Expo (matar vs reanimar) — ADR-005/ADR-010.
4. Keystore de release, `google-services.json`, credenciais Supabase de produção.

---

## 5. Comandos para desbloquear a fase seguinte

```powershell
cd D:\fitconnect\android

# 1. o gate que valida tudo o que escrevi
.\gradlew.bat --no-daemon test
.\gradlew.bat --no-daemon :app:assembleDebug

# 2. ambiente (para o relatório da Fase A)
java -version
.\gradlew.bat -v
adb --version
emulator -list-avds
adb devices

# 3. instalar e ver as duas correções
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.fitconnect.android.debug/com.fitconnect.android.MainActivity

# 4. confirmar que o catálogo morreu em release e vive em debug
adb shell pm query-activities -a android.intent.action.VIEW -d "fitconnect://app/catalog"
```

Se o `assembleDebug` falhar, cole o erro — corrijo na hora. Se passar, o bloco de status acima sobe de "PASS (código) / UNVERIFIED (build)" para PASS pleno e a D2 destranca.
