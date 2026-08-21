# Toolchain de agentes — o que foi instalado, o que foi rejeitado e porquê

**Data:** 2026-08-18 · **Verificado contra:** READMEs em bruto (`raw.githubusercontent.com`)

> **Aviso de método:** as contagens de estrelas devolvidas por fetch em `github.com`
> foram descartadas por serem manifestamente fabricadas (48,9k / 90k / 64,9k para
> repos minúsculos). Onde havia pacote publicado usou-se o **npm/PyPI como sinal real
> de atividade**; onde não havia, diz-se "não verificável". Nenhum comando de
> instalação abaixo foi inventado — todos vêm do README respetivo.

---

## Instalado

| Ferramenta | Tipo | Comando | Sinal de atividade |
|---|---|---|---|
| **impeccable** | Skill + detetor determinístico (CLI) + hooks | `npx impeccable install` | npm 3.6.0, 2026‑08‑14 |
| **emilkowalski/skills** | 10 skills de animação/design web | `npx skills@latest add emilkowalski/skills` | não verificável |
| **@playwright/mcp** | MCP server | `.mcp.json` (3 perfis) | npm 0.0.79 |
| **firecrawl-mcp** | MCP server | `.mcp.json` | npm 3.24.0 |
| **@perplexity-ai/mcp-server** | MCP server | `.mcp.json` | npm 1.2.0 |
| **mcp-chrome-bridge** | MCP server + extensão Chrome | `npm i -g mcp-chrome-bridge` | npm 1.0.31 |
| **claude-code-setup** | Plugin oficial Anthropic (read-only) | `/plugin install claude-code-setup@claude-plugins-official` | oficial |
| **omniroute** ⚠️ | Gateway/proxy de LLMs — **ver aviso abaixo** | `npm i -g omniroute` | npm 3.8.49, 2026‑07‑30 |

Correr `pwsh -File scripts/setup-agent-toolchain.ps1` faz tudo o que é automatizável.
`-DryRun` mostra sem instalar.

### OmniRoute — instalado por decisão do dono, contra recomendação

**Decisão registada:** Eduardo Querino, 2026-08-18, depois de lhe ser apresentado o
risco por escrito. Fica no `setup-agent-toolchain.ps1` com um aviso em vermelho no
arranque e um `-SkipOmniRoute` para desligar.

**O que o README diz, literalmente:** vende **"TLS fingerprint stealth"** como
funcionalidade e admite, no texto do gráfico de free tiers, **"15 providers
ToS-flagged so you decide"**. Parte do modelo é agregar tiers gratuitos e contornar
deteção de fornecedores.

**O que isso significa na prática:** o OmniRoute é um gateway OpenAI-compatível em
`localhost:20128`. Qualquer pedido que passe por lá — incluindo prompts com código do
FitConnect — é reencaminhado para um fornecedor à escolha do router. Riscos concretos:

1. **Termos de serviço.** Usar tiers gratuitos por trás de fingerprint alterado pode
   violar os ToS dos fornecedores. A responsabilidade é de quem opera o proxy.
2. **Confidencialidade.** Sem saber que fornecedor serviu cada pedido, não há como
   afirmar onde ficou o código nem sob que política de retenção.
3. **Reprodutibilidade.** Respostas de fornecedores rotativos tornam o comportamento
   do agente não determinístico entre sessões.

**Mitigação mínima, se for mesmo usado:** só para tarefas sem código proprietário
(pesquisa, rascunhos, tradução), nunca no caminho de `apps/`, `packages/` ou
`android/`. Confirmar em cada sessão que fornecedor está ativo. Manter fora do CI.

Isto cai na **§16.4 do MEGA PROMPT** — envio de dados para terceiros. A paragem foi
feita, a pergunta foi feita, a resposta foi "instalar mesmo assim".

### Porquê três perfis de Playwright
O `.mcp.json` regista `playwright`, `playwright-mobile` (`--device "Pixel 7"`) e
`playwright-webkit` (`--browser webkit`). A §7 do MEGA PROMPT exige testar Safari a
sério e capturar 1920/1280/768/375 — o WebKit do Playwright é a única forma de o
fazer sem um Mac. Todos usam `--isolated` porque **um perfil persistente só pode ser
usado por uma instância de cada vez**; clientes MCP concorrentes no mesmo workspace
entram em conflito.

### Chaves de API — nenhuma está no repositório
O `.mcp.json` usa `${FIRECRAWL_API_KEY}` e `${PERPLEXITY_API_KEY}`, expandidas pelo
Claude Code a partir do ambiente. Se a variável não existir, o texto fica literal e o
`claude mcp list` avisa.

- **Firecrawl** — https://www.firecrawl.dev/app/api-keys · `scrape`, `search` e
  `parse` funcionam **sem chave** com limite; `crawl`, `map` e `agent` exigem chave.
- **Perplexity** — https://console.perplexity.ai · **pago, sem tier gratuito.**

O README do Firecrawl é o **único** que documenta explicitamente o problema de
Windows (`cmd /c "set KEY=... && npx -y firecrawl-mcp"`) — por isso é o único que usa
`"command": "cmd"` no `.mcp.json`. Se outro servidor falhar a arrancar em Windows,
aplica o mesmo padrão: `"command": "cmd", "args": ["/c", "npx", ...]`.

---

## Rejeitado

### glyph — **não instalar**
MCP server em Go que gera outlines de símbolos via Tree-sitter. Suporta Go, Java,
JS/TS e Python. **Kotlin não está na lista**, e Java não cobre Compose — logo deixa
`android/` inteiro de fora, que é onde está a app de referência. Repo minúsculo, sem
releases. Redundante com a pesquisa nativa do Claude Code.

---

## Adiado (não rejeitado)

### claude-mem
Memória persistente entre sessões. Genuinamente útil num monorepo deste tamanho, mas
**200 versões publicadas e releases de dias a dias** é sinal de superfície instável, e
instala hooks + um worker service persistente. Se experimentares: **branch próprio** e
confirma que desinstala limpo antes de o deixares no fluxo principal.

### headroom
Compressão de contexto. Dois problemas: os `project_urls` do pacote PyPI apontam para
`github.com/chopratejas/headroom` e **não** para `headroomlabs-ai/headroom` — o pacote
não declara como origem o repo auditado. E o SDK npm está parado no 0.22.4 (Junho)
enquanto o Python vai no 0.35.0 — num monorepo TS/Kotlin ficarias com o caminho menos
mantido.

### task-observer (rebelytics/one-skill-to-rule-them-all)
Meta-skill que observa sessões e propõe melhorias às tuas skills. **Sem comando de
instalação documentado** — é clonar e copiar para `.claude/skills/task-observer/`,
preservando a subpasta `references/`. O próprio README admite pouco retorno com poucas
skills. Faz sentido *depois* de teres o resto a correr.

### design-taste-frontend
Já está em `skills-lock.json`. **Sobrepõe-se ao impeccable** sem acrescentar
verificação determinística. Deixa ficar, mas não esperes valor adicional.

---

## Camada Android / Jetpack Compose

Verificado em 2026-08-18. **Três das cinco skills pedidas não existem** — são nomes
citados em artigos do Medium sem artefacto por trás:

| Pedido | Estado real |
|---|---|
| "Jetpack Compose Expert Skill" | **NÃO EXISTE.** Os agregadores que a listam (mcpmarket, popularaitools) apontam para `nimoqup046-collab/agora-test01` — uma plataforma Next.js/FastAPI **sem uma linha de Kotlin**. Listagem mal-raspada. |
| "Health Connect / Health API Integration Pack" | **NÃO EXISTE.** Busca agressiva não devolveu nada. Nem o catálogo oficial da Google tem skill de Health Connect. |
| "ASO Audit" | **NÃO EXISTE com esse nome.** O `--audit` é uma flag do `furkancingoz/aso-skill`, não uma skill. O análogo correto e oficial é `play/play-policy-insights`. |
| "android-skills" | **Ambíguo — são 4 artefactos diferentes.** O que interessa é o **oficial da Google**, que não estava na lista. |
| "mobile-app-ui-design" | **Existe** (`ceorkm/mobile-app-ui-design`) mas os exemplos são **React + Tailwind + Recharts**. Zero Compose. Não instalado. |

### O critério que decidiu tudo: este repositório não usa Hilt nem Koin

`android/gradle/libs.versions.toml` não declara nenhum dos dois — a injeção é manual.
Isto **elimina metade do ecossistema**, porque a maioria das skills de Android impõe
um deles e faria o agente propor migrações de DI que ninguém pediu:

| Impõem Hilt | Impõem Koin | **Neutros — instalados** |
|---|---|---|
| `dpconde/claude-android-skill`, `Drjacky/claude-android-ninja`, `gecko23`, `new-silvermoon` | `rcosteira79/android-skills`, `humanshell/android-skills`, `felipechaux` (anti-Hilt explícito), `ahmed3elshaer` | `android/skills`, `chrisbanes/skills`, `skydoves/compose-performance-skills`, `hamen/material-3-skill` |

### Instalado

**1. `android/skills` — oficial da Google, Apache-2.0.** 9 das 21 skills, escolhidas.
A Google declara que evita de propósito *"basic Jetpack Compose best practices"* e
ataca o que os LLMs fazem mal. As selecionadas:

- `wear/wear-compose-m3` — **o único artefacto público no mundo que toca em
  `android/wear`.** Relevância direta: o catálogo deste repo usa
  `androidx.wear.compose:compose-material` (M2), não M3 — é exatamente a migração
  que a skill cobre.
- `performance/r8-analyzer` — 15 módulos significa regras de keep quase de certeza
  redundantes a inchar o APK (hoje 27,9 MB em debug).
- `profilers/perfetto-trace-analysis` + `perfetto-sql` — jank do honeycomb e do anel.
  É aqui que um agente sem skill é inútil.
- `build-system/agp/agp-9-upgrade` — o relatório KMP já registou AGP 9 como risco.
- `jetpack-compose/adaptive`, `jetpack-compose/theming/styles`
- `testing/testing-setup` — **com ressalva:** o `SKILL.md` não trata multi-módulo a
  sério, assume aplicar config "a cada módulo". Ponto de partida, não autoridade.
- `play/play-policy-insights` — o substituto honesto da ideia de "ASO Audit". Uma app
  com Health Connect tem exigências pesadas de data safety.

**2. `chrisbanes/skills` — Apache-2.0.** Chris Banes, ex-equipa Compose da Google.
6 skills Compose + 3 Kotlin. Auto-ativa em `.kt`/`.kts` pelo frontmatter `paths`.
As duas que mais interessam aqui: `compose-component-design` (slot APIs
caller-placeable — é literalmente a skill para desenhar `design-ui`) e
`kotlin-api-design` (fronteiras de plataforma KMP, o que o `:shared` precisa **hoje**
sem migrar para Compose Multiplatform).

**3. `skydoves/compose-performance-skills` — Apache-2.0.** 26 skills atómicas com um
`INDEX.md` que é uma tabela **sintoma → causa → skill**. Com 15 módulos, os problemas
de estabilidade cruzam fronteiras — `stabilizing-compose-types` e o
`stability_config.conf` são o mecanismo para tipos vindos de outros módulos.
⚠️ **Um `git clone` para `~/.claude/skills` não funciona:** o repo usa layout
`<categoria>/<slug>/SKILL.md` e o Claude Code espera `<slug>/SKILL.md`. O
`scripts/install-skills.sh` cria os symlinks planos e é idempotente.

**4. `hamen/material-3-skill` — MIT.** Compose é a plataforma primária. 30+ componentes
mapeados, tokens M3, M3 Expressive, e **auditoria de conformidade pontuada em 10
categorias**. É a peça que falta ao par `design` / `design-ui`.
⚠️ O repo vive em `master`, não em `main`. O comando
`claude plugin install github:hamen/material-3-skill` que circula em blogs **nunca
funcionou** — foi corrigido na v1.1.1.

### Não instalado, e porquê

- **`Drjacky/claude-android-ninja`** — o mais extenso do lote, mas **não tem ficheiro
  `LICENSE`** (404 em `main` e `master`). Sem licença explícita o default legal é
  todos os direitos reservados.
- **`felipechaux/kmp-compose-multiplatform-skill`** — Koin-only e **explicitamente
  anti-Hilt**. Enquanto o `:shared` for kotlin-jvm, é peso morto.
- **`anhvt52/jetpack-compose-skills`** — Compose BOM 2024.x; este repo está no 2026.06.00.
- **`gecko23/android-agent-skills` + `new-silvermoon/awesome-android-agent-skills`** —
  quase-duplicados (README idêntico, um é fork do outro), e vivem em `.github/skills/`
  (convenção Copilot) sem instalação documentada para Claude Code.
- **`ahmed3elshaer/...-mobile`, `affaan-m/ECC`** — marketplaces generalistas enormes;
  mau rácio sinal/ruído com 15 módulos já a competir por contexto.
- **`skydoves/android-skills-mcp`** — reexpõe o catálogo da Google; redundante se as
  oficiais forem instaladas nativamente, e gasta contexto duas vezes.

### Sobreposição a vigiar
`chrisbanes/compose-performance` e as 26 do `skydoves` cobrem ambas stability, strong
skipping e deferred reads. Coexistem bem (granularidades diferentes: um router de
diagnóstico em 6 passos vs. skills atómicas por sintoma), mas espera dupla ativação
no mesmo prompt.

### Lacunas que nenhuma ferramenta pública preenche

Três, e são as mais caras deste projeto:

1. **Health Connect** — zero skills no mundo, incluindo a Google.
2. **Wear OS Data Layer** (`DataClient`, `MessageClient`, `CapabilityClient`, tiles,
   complications) — a `wear-compose-m3` cobre só UI. Três buscas distintas
   confirmaram: não existe nada comunitário sobre Wear OS.
3. **A topologia dos 15 módulos** — nenhuma skill genérica sabe que `athlete` pode
   depender de `foundation` mas não de `coach`.

**Próximo passo recomendado:** escrever `.claude/skills/fitconnect-android/SKILL.md`
com (por ordem de retorno):
1. **Grafo de dependências permitido entre os 15 módulos** — tabela explícita de quem
   importa quem. Trava a maior parte dos erros de um agente num monorepo.
2. Contrato de Health Connect — `RECORD_TYPES` usados, fluxo de permissões,
   `getSdkStatus`, política de leitura em background, exigências de data safety do Play.
3. Contrato do Wear Data Layer — paths, formato de payload em `:shared`, estratégia de
   conflito, capabilities declaradas, o que fica em `wear` vs `shared`.
4. Regras da casa para `design` ↔ `design-ui` e nomenclatura de eventos em `telemetry`.

Delegar o resto às skills acima — não duplicar R8, Perfetto nem Wear Compose M3.

---

## Camadas — onde cada coisa vive

| Camada | Ficheiro / local | Quem instala |
|---|---|---|
| MCP do projeto | `D:\fitconnect\.mcp.json` | **já escrito** |
| Skills do projeto | `.claude/skills/`, `skills-lock.json` | script |
| MCP da conta Claude | app Claude → Definições → Conectores | **só tu, na app** |
| Plugins do Claude Code | `/plugin install …` dentro do Claude Code | **só tu, no CLI** |

Nesta sessão Cowork já ficaram ligados à conta: **Figma, Supabase, Vercel e Sentry**.
