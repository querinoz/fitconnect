# Wear OS — upgrade contra a referência oficial

**Data:** 2026-08-18
**Referência:** `developer.android.com/design/ui/wear` (get-started, surfaces/apps, layouts, scrolling, tiles/states) + páginas de release AndroidX.
**Regra:** nada apagado; nenhuma versão ou API inventada — cada versão abaixo foi lida na página de release oficial.

---

## 1. Descoberta importante antes de escrever código

Ao abrir o módulo encontrei **um upgrade Wear já em curso** que não era meu — `WearTheme.kt`, `WearOngoingController.kt` e `WearTileService.kt` já existiam, e o catálogo já tinha M3, navigation, tiles, protolayout e wear-ongoing.

Em vez de reescrever por cima, auditei o que lá estava. **A qualidade é boa:** o `WearTileService` usa a API `androidx.wear.protolayout` **atual** (não os builders `androidx.wear.tiles.*` que estão deprecados), com `onTileResourcesRequest` a devolver o tipo certo e `setTileTimeline` em vez do `setTimeline` deprecado — que é exatamente o erro mais comum nesta API. Deixei-o intacto.

Verificação que corri no módulo inteiro:

```
restos de Wear Material 2.5 (deprecado):  nenhum — migração M3 completa
```

| Ficheiro | Tecnologia Wear em uso |
|---|---|
| `WearMainActivity.kt` | AppScaffold · **AmbientLifecycleObserver** · material3 · HealthServices |
| `WearInstrument.kt` | ScreenScaffold · **TransformingLazyColumn** · **rotaryScrollable** · material3 |
| `WearTheme.kt` | material3 |
| `WearTileService.kt` | protolayout |
| `WearOngoingController.kt` | OngoingActivity |
| `WearComplicationService.kt` | ComplicationData ← **novo, meu** |

Ou seja: app, tile e ongoing activity já lá estavam. **A complicação era a única das quatro superfícies que faltava por completo** — e foi a que construí.

---

## 2. O que acrescentei

### Superfície nova: Complication (`WearComplicationService.kt`)
Põe um número FitConnect diretamente no mostrador do relógio do utilizador — a superfície de maior frequência e menor esforço que existe: o valor está lá sempre que ele levanta o pulso, sem navegação nenhuma.

- Estende `SuspendingComplicationDataSourceService` (variante coroutines do artefacto `-ktx`).
- Suporta `SHORT_TEXT` e `RANGED_VALUE`, com `getPreviewData` para o seletor de complicações.
- Toque abre a app (`PendingIntent` com `FLAG_IMMUTABLE`).
- **Mantém as regras de honestidade do resto do projeto:** readiness continua a ser `LOCAL_DEMO` e a content description diz isso; durante uma sessão mostra o estado da sessão em vez de um readiness velho; se a posse (ownership) estiver bloqueada mostra o código de bloqueio em vez de um valor plausível inventado.
- `SUPPORTED_TYPES` no manifesto está sincronizado com os ramos do `when` — tipos não declarados devolvem `null` em vez de adivinhar.

### Dependências (versões lidas nas páginas de release, 2026-07-29)
| | Antes | Depois |
|---|---|---|
| `wear.tiles` | 1.6.1 | **1.6.2** |
| `wear.protolayout` | 1.4.1 | **1.4.2** |
| `watchface-complications-data-source-ktx` | ausente | **1.3.0** |
| `tiles-tooling` / `tiles-tooling-preview` / `wear-tooling-preview` | ausentes | **adicionados** (previews de tile no Studio; `tiles-tooling` só em debug) |
| guava | hardcoded `33.4.0-android` no build.gradle | movido para o catálogo |

`wear-ongoing` foi **deixado em 1.0.0 de propósito** — é a última versão estável; não inventei um 1.1.0.

### Correções de acabamento
- **Ícone da app**: era `@android:drawable/sym_def_app_icon`, o placeholder genérico do Android. Criei a marca Elite OS como adaptive icon vetorial (célula de favo + pulso voltline `#C8FF00` sobre FLOOR `#070B14`), com camada `monochrome` para o modo temático.
- **Tile no seletor**: faltavam `android:description` e `android:icon`, que é o que o utilizador vê ao escolher tiles. Adicionados.
- **Strings**: labels estavam hardcoded no manifesto; passaram para `res/values/strings.xml`.

---

## 3. Verificação feita

```
XML bem-formado ....................... 7/7 OK
Kotlin novo, balanço {} e () .......... 12/12 e 42/42 OK
@string/* referenciados existem ....... 5/5 OK
@drawable/* e @mipmap/* existem ....... 3/3 OK
classes do manifesto existem .......... 4/4 OK
```

**Não compilei.** Continua sem SDK Android nesta sessão. Os PASS acima são estruturais, não de compilação.

---

## 4. Uma coisa que encontrei e NÃO mexi

`androidx.wear.compose:compose-navigation` está declarado como dependência mas **não é usado por nenhum ficheiro**. A navegação atual usa `HorizontalPager` do wear foundation — o que, lendo a referência, **está certo**: pager é o padrão para ecrãs irmãos (peer panes), enquanto `SwipeDismissableNavHost` é para navegação hierárquica em profundidade. Não é um bug, é uma dependência que ainda não tem uso.

Não a removi (regra de não apagar). Ou se remove, ou fica à espera do primeiro ecrã de drill-down. Decisão tua.

---

## 5. Estado

```
WEAR_M3_MIGRATION:      PASS (código) — zero imports Material 2.5 no módulo
WEAR_APP_SURFACE:       PASS (código) — AppScaffold, ScreenScaffold, TransformingLazyColumn,
                        rotaryScrollable, HorizontalPager, AmbientLifecycleObserver
WEAR_TILE:              PASS (código) — protolayout atual, declarado e com preview/description
WEAR_ONGOING_ACTIVITY:  PASS (código)
WEAR_COMPLICATION:      PASS (código) — novo nesta sessão
WEAR_ICON:              PASS (código) — deixou de ser o placeholder do Android
BUILD:                  UNVERIFIED — precisa de `.\gradlew :wear:assembleDebug`
RUNTIME:                UNVERIFIED — nenhuma superfície vista num relógio/emulador Wear
```

**Para fechar:**
```powershell
cd D:\fitconnect\android
.\gradlew.bat --no-daemon :wear:assembleDebug
.\gradlew.bat --no-daemon :wear:lintDebug
```

Se falhar, o suspeito nº1 é a API de complicações (`ShortTextComplicationData.Builder` / `RangedValueComplicationData.Builder` — nomes de parâmetro). Cola o erro que ajusto de imediato.

Depois, para ver as três superfícies num AVD Wear: instalar, adicionar o tile pelo carrossel, e adicionar a complicação editando o mostrador.
