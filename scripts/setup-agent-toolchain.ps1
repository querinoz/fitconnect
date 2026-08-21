<#
.SYNOPSIS
  FitConnect - instala o toolchain de agentes (skills + MCP servers) na maquina local.

.DESCRIPTION
  A sessao Cowork corre na cloud e o bash local nao tem rede, por isso nao consegue
  clonar repositorios nem instalar pacotes. Este script corre na TUA maquina.

  Decisoes registadas (detalhe em docs/AGENT_TOOLCHAIN.md):
    - OmniRoute  : INSTALADO POR DECISAO EXPLICITA DO DONO DO PROJETO (2026-08-18),
                   contra recomendacao. O README vende "TLS fingerprint stealth" e
                   admite "15 providers ToS-flagged so you decide". Ver seccao 3b.
    - glyph      : REJEITADO. Outline de simbolos via Tree-sitter, sem suporte a
                   Kotlin. Deixa android/ inteiro de fora. Redundante com a
                   pesquisa nativa do Claude Code.
    - claude-mem : ADIADO. 200 versoes publicadas, releases de dias a dias.
                   Instala hooks + worker persistente. So com branch de teste.
    - headroom   : ADIADO. O pacote PyPI declara outro repo de origem
                   (chopratejas/headroom) e o SDK npm esta 3 meses atrasado.

.EXAMPLE
  pwsh -ExecutionPolicy Bypass -File scripts/setup-agent-toolchain.ps1
  pwsh -File scripts/setup-agent-toolchain.ps1 -DryRun
  pwsh -File scripts/setup-agent-toolchain.ps1 -SkipOmniRoute
#>

param(
  [switch]$DryRun,
  [switch]$SkipChromeMcp,
  [switch]$SkipOmniRoute
)

$ErrorActionPreference = 'Stop'
$script:failed = @()

function Step($label) { Write-Host ""; Write-Host "==> $label" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "    OK    $m" -ForegroundColor Green }
function Warn($m) { Write-Host "    AVISO $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "    FALHA $m" -ForegroundColor Red; $script:failed += $m }

function Run($cmd) {
  if ($DryRun) { Write-Host "    [dry-run] $cmd" -ForegroundColor DarkGray; return $true }
  Write-Host "    > $cmd" -ForegroundColor DarkGray
  cmd /c $cmd
  return ($LASTEXITCODE -eq 0)
}

# --- 0. Pre-requisitos -----------------------------------------------
Step "Pre-requisitos"
$node = (node --version 2>$null)
if (-not $node) { Fail "Node nao encontrado no PATH"; exit 1 }
$major = [int]($node -replace 'v(\d+)\..*','$1')
if ($major -lt 20) { Fail "Node $node - os MCP servers exigem Node 20+" } else { Ok "Node $node" }
if (-not (Test-Path ".mcp.json")) { Fail "Corre a partir da raiz do repositorio (falta .mcp.json)"; exit 1 }
Ok "Raiz do repositorio confirmada"

# --- 1. Skills de design/frontend ------------------------------------
# O repo ja usa o CLI `skills` (ver skills-lock.json). Mantemos o mecanismo.
Step "Skills - camada web (Next.js / Expo)"

# impeccable: skill de design COM detetor deterministico + hooks.
# skills-lock.json so tinha o SKILL.md; a versao completa traz o detetor.
if (Run "npx -y impeccable install") { Ok "impeccable (skill + detetor + hooks)" }
else { Fail "impeccable" }

# emilkowalski/skills: 10 skills de animacao e design web.
if (Run "npx -y skills@latest add emilkowalski/skills") { Ok "emilkowalski/skills" }
else { Fail "emilkowalski/skills" }

Warn "task-observer (rebelytics) - sem comando de instalacao documentado."
Warn "  Instalacao manual: clona e copia para .claude/skills/task-observer/,"
Warn "  PRESERVANDO a subpasta references/."
Warn "design-taste-frontend ja esta em skills-lock.json e sobrepoe-se ao impeccable."

# --- 1b. Skills Android / Jetpack Compose ----------------------------
# Verificado em 2026-08-18 contra os READMEs. Achados que interessam:
#   - "Jetpack Compose Expert Skill" NAO EXISTE. Os agregadores que a listam
#     apontam para um repo Next.js sem uma linha de Kotlin.
#   - "Health Connect Integration Pack" NAO EXISTE. Nem a Google tem skill de
#     Health Connect. E o maior buraco do projeto e nenhum artefacto o tapa.
#   - O libs.versions.toml deste repo NAO tem Hilt nem Koin (DI manual). Todas
#     as skills abaixo sao NEUTRAS em DI de proposito. Instalar uma skill
#     opinativa (dpconde=Hilt, rcosteira79/felipechaux=Koin) faria o agente
#     propor migracoes de DI que ninguem pediu.
Step "Skills Android / Compose - 15 modulos Gradle, Wear OS, :shared"

# 1) OFICIAIS DA GOOGLE (Apache-2.0). A propria Google diz que evita de
#    proposito "basic Jetpack Compose best practices" e ataca o que os LLMs
#    fazem mal: R8, Perfetto, AGP, politicas Play.
#    Relevancia direta: android/wear usa compose-material (M2), nao M3 —
#    wear-compose-m3 cobre exatamente essa migracao.
$androidCli = Get-Command android -ErrorAction SilentlyContinue
if ($androidCli) {
  foreach ($sk in @(
      'wear/wear-compose-m3',              # unico artefacto publico p/ android/wear
      'jetpack-compose/adaptive',
      'jetpack-compose/theming/styles',
      'performance/r8-analyzer',           # 15 modulos = regras keep redundantes
      'profilers/perfetto-trace-analysis', # jank do honeycomb + anel
      'profilers/perfetto-sql',
      'build-system/agp/agp-9-upgrade',
      'testing/testing-setup',
      'play/play-policy-insights'          # Health Connect => data safety pesado
    )) {
    if (Run "android skills add --skill $sk") { Ok "google: $sk" } else { Warn "google: $sk falhou" }
  }
} else {
  Warn "Android CLI ('android') nao esta no PATH - skills oficiais por instalar."
  Warn "  Alternativa: Android Studio, ou o MCP skydoves/android-skills-mcp"
  Warn "  (redundante se instalares as oficiais nativamente)."
  Warn "  Catalogo: https://developer.android.com/tools/agents/android-skills/browse"
}

# 2) chrisbanes/skills (Apache-2.0) - Chris Banes, ex-equipa Compose da Google.
#    6 skills Compose + 3 Kotlin. compose-component-design e a skill exata para
#    desenhar as slot APIs de design-ui. kotlin-api-design cobre fronteiras KMP
#    para o :shared sem exigir migracao para Compose Multiplatform.
#    Auto-ativa em .kt/.kts via frontmatter `paths`.
if (Run "npx -y skills@latest add chrisbanes/skills") { Ok "chrisbanes/skills (Compose + Kotlin)" }
else { Fail "chrisbanes/skills" }

# 3) skydoves/compose-performance-skills (Apache-2.0) - 26 skills atomicas de
#    performance, com INDEX.md sintoma->causa->skill.
#    ATENCAO: git clone simples NAO funciona. O repo usa layout aninhado
#    <categoria>/<slug>/SKILL.md e o Claude Code espera <slug>/SKILL.md.
#    O script de instalacao cria os symlinks planos. E idempotente.
$srcDir = Join-Path $HOME ".claude\skills-sources\compose-performance-skills"
if (-not (Test-Path $srcDir)) {
  if (-not (Run "git clone https://github.com/skydoves/compose-performance-skills.git `"$srcDir`"")) {
    Fail "clone compose-performance-skills"
  }
} else { Ok "compose-performance-skills ja clonado" }
if (Test-Path (Join-Path $srcDir "scripts\install-skills.sh")) {
  if (Run "bash `"$srcDir/scripts/install-skills.sh`"") { Ok "compose-performance-skills (26 skills)" }
  else { Warn "install-skills.sh falhou - precisa de bash (Git Bash/WSL). Corre a mao." }
} else { Warn "install-skills.sh nao encontrado apos clone" }

# 4) hamen/material-3-skill (MIT) - Compose e a plataforma primaria.
#    30+ componentes mapeados, tokens M3, M3 Expressive, e auditoria de
#    conformidade pontuada em 10 categorias. E a peca que falta ao par
#    design/design-ui. NOTA: o repo vive em `master`, nao em `main`.
if (Run "npx --yes skills add hamen/material-3-skill --skill material-3 -y") { Ok "material-3" }
else { Fail "material-3-skill" }

Warn "NAO instalados de proposito (ver docs/AGENT_TOOLCHAIN.md):"
Warn "  Drjacky/claude-android-ninja  - SEM ficheiro LICENSE (todos os direitos reservados)"
Warn "  felipechaux/kmp-compose...    - Koin-only e anti-Hilt explicito; :shared ainda e kotlin-jvm"
Warn "  anhvt52/jetpack-compose-skills- Compose BOM 2024.x (este repo esta no 2026.06.00)"
Warn "  gecko23 + new-silvermoon      - duplicados um do outro, sem instalacao Claude Code"
Warn "  ceorkm/mobile-app-ui-design   - React/Tailwind, zero Compose"
Warn "LACUNAS sem artefacto publico no mundo: Health Connect e Wear Data Layer."
Warn "  -> escrever .claude/skills/fitconnect-android/ (ver docs/AGENT_TOOLCHAIN.md)"

# --- 2. Playwright ---------------------------------------------------
Step "Playwright - browsers para o MCP e para os E2E"
if (Run "npx -y playwright install chromium firefox webkit") { Ok "Chromium + Firefox + WebKit" }
else { Fail "playwright install - sem WebKit nao ha teste de Safari" }

# --- 3. mcp-chrome (precisa de extensao) -----------------------------
if (-not $SkipChromeMcp) {
  Step "mcp-chrome - usa o TEU Chrome com as sessoes ja autenticadas"
  if (Run "npm install -g mcp-chrome-bridge") {
    Ok "mcp-chrome-bridge instalado"
    Warn "PASSO MANUAL: extensao de https://github.com/hangwin/mcp-chrome/releases"
    Warn "  chrome://extensions -> Developer mode -> Load unpacked"
    Warn "  Depois: icone da extensao -> connect (porta 12306)"
    if (-not $DryRun) {
      cmd /c "mcp-chrome-bridge register" | Out-Null
      if ($LASTEXITCODE -eq 0) { Ok "native messaging host registado" }
      else { Warn "registo automatico falhou - corre 'mcp-chrome-bridge register' a mao" }
    }
  } else { Fail "mcp-chrome-bridge" }
}

# --- 3b. OmniRoute ---------------------------------------------------
if (-not $SkipOmniRoute) {
  Step "OmniRoute - gateway/proxy de LLMs"
  Write-Host ""
  Write-Host "  ################################################################" -ForegroundColor Red
  Write-Host "  #  AVISO - LIDO E ACEITE PELO DONO DO PROJETO EM 2026-08-18     #" -ForegroundColor Red
  Write-Host "  #                                                              #" -ForegroundColor Red
  Write-Host "  #  O README do OmniRoute vende 'TLS fingerprint stealth' como  #" -ForegroundColor Red
  Write-Host "  #  funcionalidade e admite '15 providers ToS-flagged so you    #" -ForegroundColor Red
  Write-Host "  #  decide'. Trafego encaminhado por este proxy pode violar os  #" -ForegroundColor Red
  Write-Host "  #  termos de servico dos fornecedores de LLM.                  #" -ForegroundColor Red
  Write-Host "  #                                                              #" -ForegroundColor Red
  Write-Host "  #  NAO encaminhes codigo proprietario do FitConnect por aqui   #" -ForegroundColor Red
  Write-Host "  #  sem saberes que provider esta a servir cada pedido.         #" -ForegroundColor Red
  Write-Host "  #  Escuta em localhost:20128 (endpoint OpenAI-compativel).     #" -ForegroundColor Red
  Write-Host "  ################################################################" -ForegroundColor Red
  Write-Host ""
  if (Run "npm install -g omniroute") { Ok "omniroute instalado (localhost:20128)" }
  else { Fail "omniroute" }
}

# --- 4. Chaves de API ------------------------------------------------
Step "Chaves de API (o .mcp.json le variaveis de ambiente, nunca literais)"
$keys = @(
  @{ Name='FIRECRAWL_API_KEY';  Where='https://www.firecrawl.dev/app/api-keys (scrape/search funcionam sem chave, com limite)' },
  @{ Name='PERPLEXITY_API_KEY'; Where='https://console.perplexity.ai (pago, sem tier gratuito)' }
)
foreach ($k in $keys) {
  if ([Environment]::GetEnvironmentVariable($k.Name, 'User')) { Ok "$($k.Name) definida" }
  else {
    Warn "$($k.Name) em falta -> $($k.Where)"
    Warn "  [Environment]::SetEnvironmentVariable('$($k.Name)','<chave>','User')"
  }
}

# --- 5. Plugins do Claude Code (nao scriptaveis) ---------------------
Step "Plugins - correr DENTRO do Claude Code"
Write-Host "    /plugin install claude-code-setup@claude-plugins-official" -ForegroundColor White
Write-Host "      Skill oficial da Anthropic, read-only: analisa o monorepo e recomenda" -ForegroundColor DarkGray
Write-Host "      hooks, skills, MCP e subagentes. Custo zero. Corre-a primeiro." -ForegroundColor DarkGray

# --- Resumo ----------------------------------------------------------
Step "Resumo"
if ($script:failed.Count -eq 0) { Ok "Tudo o que era automatizavel passou." }
else { $script:failed | ForEach-Object { Fail $_ }; Write-Host ""; Warn "Reve as falhas antes do MEGA PROMPT v5." }
Write-Host ""
Write-Host "    Verificar MCP:    claude mcp list" -ForegroundColor White
Write-Host "    Detalhe completo: docs/AGENT_TOOLCHAIN.md" -ForegroundColor White
Write-Host "    Movimento:        docs/design/ELITE_OS_MOTION_LANGUAGE.md" -ForegroundColor White
Write-Host ""
