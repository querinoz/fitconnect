# Auditoria — duplicação na app mobile e o que abre no emulador

**Data:** 2026-08-18 · **Método:** leitura do código. Nada foi executado no emulador
(sem SDK nesta sessão). Cada achado traz ficheiro e linha.

---

## Resposta curta

**Sim, há duplicação — mas provavelmente não é ela que estás a ver.**

O que abre no emulador numa instalação limpa é um **placeholder Material 3 de fábrica**,
não o Elite OS. É um problema de fluxo de arranque, não de duplicação. A duplicação é real
e é um problema separado, que vais ter mais à frente.

---

## ACHADO 1 — o arranque limpo mostra um ecrã genérico (é isto que estás a ver)

**Ficheiro:** `android/app/src/main/java/com/fitconnect/android/ui/navigation/FitConnectNavHost.kt`

O percurso numa instalação sem sessão guardada:

```
MainActivity → FitConnectNavHost
  startDestination = Splash
  Splash → onFinished(loggedIn = false) → CoreRoute.GUEST
  GUEST → FoundationScreen(...)          ← linha 117, testTag "screen_guest"
```

E o `FoundationScreen` (linha 393) é isto:

```kotlin
Column(
    modifier = Modifier.fillMaxSize()
        .background(MaterialTheme.colorScheme.background)   // ← Material 3, não Elite OS
        .padding(24.dp),
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
) {
    Text(text = title, style = MaterialTheme.typography.headlineSmall)  // ← não Syne
    Text(text = body, style = MaterialTheme.typography.bodyMedium)
    Button(onClick = onPrimary) { Text(primaryLabel) }                  // ← não EliteButton
}
```

**Sem honeycomb. Sem volt. Sem Syne. Sem `EliteButton`. Sem `EliteHeader`.** Uma coluna
centrada com dois botões Material por omissão sobre o fundo do tema.

**Cinco rotas usam este placeholder:**

| Linha | Rota | testTag |
|---|---|---|
| 117 | `GUEST` — **o primeiro ecrã de uma instalação limpa** | `screen_guest` |
| 243 | `HOME`, ramo de fallback quando o papel não é ATHLETE nem COACH | `screen_home` |
| 272 | `ERROR` | `screen_error` |
| 388 | `ROLE` | `screen_role` |

O ramo da linha 243 é o mais preocupante: **mesmo autenticado**, se `sessionRole` não for
`ATHLETE` nem `COACH`, a home é o placeholder genérico.

O `AthleteOsApp` — o Elite OS a sério — só aparece depois de: sessão restaurada **e**
`navGuard` a autorizar **e** papel escolhido **e** `isOnboardingDone() == true`. São quatro
portas antes de veres o produto.

**Isto explica as duas queixas de uma vez:** "abre algo diferente do que deveria ser" e
"não está com qualidade".

---

## ACHADO 2 — o catálogo de design é uma rota da app de produção

**Ficheiro:** `FitConnectNavHost.kt` linhas 49 e 250–257

```kotlin
import com.fitconnect.android.designui.catalog.DesignSystemCatalog
...
composable(
    route = AppDestination.Catalog.route,
    deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/catalog" }),
) { DesignSystemCatalog() }
```

O catálogo de componentes está ligado a `CoreRoute.CATALOG` **com deep link**, sem guarda
de build type visível. Qualquer `adb shell am start -d "fitconnect://app/catalog"` abre-o —
e se alguma navegação interna lá cair por engano, vês o catálogo em vez da app.

**Vale a pena verificar:** se o teu atalho ou o teu último `am start` apontava para o
catálogo, é isto que estás a ver.

---

## ACHADO 3 — duas apps completas, com o mesmo nome e o mesmo scheme

Isto é a duplicação a sério.

| | `android/` (nativa) | `apps/mobile` (Expo) |
|---|---|---|
| Tecnologia | Kotlin Compose, 15 módulos Gradle | Expo 52 + expo-router |
| Estado | App de referência | **Congelada** (ADR-005, "Path A frozen") |
| Ecrãs | `athlete/ui/` com 18 áreas + `coach/` | **22 ficheiros** em `(athlete)`, `(coach)`, `(auth)` |
| `name` | `FitConnect` (`@string/app_name`) | `FitConnect` (`app.config.ts:5`) |
| `scheme` | `fitconnect://app` (manifest) | **`fitconnect`** (`app.config.ts:7`) |

Os ecrãs do Expo duplicam directamente os nativos:

```
apps/mobile/app/(athlete)/index.tsx      ↔  android/athlete/ui/home/
apps/mobile/app/(athlete)/discover.tsx   ↔  android/athlete/ui/discover/
apps/mobile/app/(athlete)/sessions.tsx   ↔  android/athlete/ui/training/
apps/mobile/app/(athlete)/community.tsx  ↔  android/athlete/ui/community/
apps/mobile/app/(athlete)/profile.tsx    ↔  android/athlete/ui/profile/
apps/mobile/app/(coach)/*.tsx            ↔  android/coach/
apps/mobile/app/(auth)/signin|signup     ↔  android/app/ui/auth/AuthScreen.kt
```

**A colisão que dá problemas concretos:** ambas declaram o scheme `fitconnect`. Se as duas
estiverem instaladas no emulador:

- dois ícones, ambos com o nome **FitConnect**, ambos com aspeto plausível
- `fitconnect://app/...` fica **ambíguo** — o Android mostra um seletor ou escolhe uma
- é trivial abrir a Expo (congelada, portanto desatualizada) a pensar que é a nativa

**Estado no repositório:** o CI já exclui a Expo (`ci.yml:32-33`, `--filter=!@fitconnect/mobile`),
mas ela **continua no `pnpm-workspace.yaml`** via `apps/*` e o `package.json` mantém
`dev:mobile`. Está congelada para o CI, não para quem a corre à mão.

---

## ACHADO 4 — três pacotes podem coexistir no emulador

`android/app/build.gradle.kts:51,85`

```kotlin
applicationId = "com.fitconnect.android"
debug { applicationIdSuffix = ".debug" }
```

Instaláveis em simultâneo, todos chamados "FitConnect":

1. `com.fitconnect.android` — release
2. `com.fitconnect.android.debug` — debug *(foi este que o turno anterior instalou)*
3. o pacote da Expo, se alguma vez foi construída

**O debug não tem sufixo no nome visível.** Se tiveres o release antigo instalado de um
turno anterior e instalares o debug novo, ficas com dois ícones idênticos e nenhuma forma
de os distinguir a olho.

---

## Diagnóstico — corre isto no Windows para saber o que tens

```powershell
# 1. Quantas FitConnect estão instaladas?
adb shell pm list packages | Select-String -Pattern "fitconnect"

# 2. Qual é que está em primeiro plano AGORA?
adb shell dumpsys activity activities | Select-String -Pattern "mResumedActivity"

# 3. Quem responde ao deep link fitconnect:// ?
adb shell pm query-activities -a android.intent.action.VIEW -d "fitconnect://app/home"

# 4. Que ecrã está a ser mostrado (procura o testTag)
adb shell uiautomator dump /sdcard/ui.xml
adb pull /sdcard/ui.xml
Select-String -Path ui.xml -Pattern "screen_guest|screen_home|screen_role|catalog"
```

**Como ler o resultado do passo 4:**

| Se encontrares | Significa |
|---|---|
| `screen_guest` | Estás no placeholder de arranque — ACHADO 1. Não há sessão |
| `screen_home` | Autenticado mas sem papel válido — ACHADO 1, ramo da linha 243 |
| `screen_role` | Preso na escolha de papel |
| componentes do catálogo | Abriste o `DesignSystemCatalog` — ACHADO 2 |
| nada disto | A app está mesmo no `AthleteOsApp`; o problema é outro |

**Limpar para um arranque conhecido:**

```powershell
adb uninstall com.fitconnect.android
adb uninstall com.fitconnect.android.debug
cd android; .\gradlew.bat :app:installDebug
adb shell am start -n com.fitconnect.android.debug/com.fitconnect.android.MainActivity
```

---

## Correções recomendadas, por retorno

### 1. Vestir os cinco placeholders com Elite OS *(alto retorno, 1 dia)*
`FoundationScreen` é o primeiro ecrã que qualquer pessoa vê. Substituir `MaterialTheme` por
`EliteButton`, `HoneycombBackground` e tipografia Syne resolve a queixa de qualidade de uma
vez, em cinco rotas. **Faz isto primeiro.**

### 2. Distinguir o debug do release *(15 minutos, evita horas de confusão)*
```kotlin
debug {
    applicationIdSuffix = ".debug"
    resValue("string", "app_name", "FitConnect DEBUG")   // ← acrescentar
}
```
Deixa de ser possível confundir dois ícones iguais.

### 3. Fechar o catálogo em release *(15 minutos)*
Registar a rota `Catalog` só quando `BuildConfig.DEBUG`, ou tirar-lhe o deep link. Um
catálogo de design não pertence a um APK de produção.

### 4. Resolver o scheme colidido *(30 minutos)*
Mudar `apps/mobile/app.config.ts` para `scheme: "fitconnect-expo"` e
`name: "FitConnect (Expo)"`. Enquanto a Expo existir, tem de ser distinguível.

### 5. Decidir o destino da Expo *(decisão, não trabalho)*
Está congelada desde o ADR-005 e duplica 22 ecrãs. **Matar ou reanimar** — um módulo
congelado que ainda é instalável e ainda rouba o scheme é a pior das três opções. O
ADR-010 já a tinha marcado como decisão em aberto.

---

## O que NÃO foi verificado

- **Nada foi executado no emulador.** Sem SDK nesta sessão. Os comandos de diagnóstico
  acima é que confirmam qual dos quatro achados é o que estás a ver.
- Não foi comparado o conteúdo dos ecrãs Expo com os nativos linha a linha — a duplicação
  foi estabelecida por correspondência de nomes de rota e por o ADR-005 já a declarar.
- Não foi verificado se o `navGuard` tem algum caminho que devolva um papel inválido, o que
  explicaria o ramo da linha 243 disparar mesmo com sessão válida.
