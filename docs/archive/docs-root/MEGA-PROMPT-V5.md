# MEGA PROMPT v5 — FitConnect / ELITE OS
### Corrigido contra o repositório real · 2026-08-18

> **Cola inteiro como primeira mensagem no Claude Code, na raiz de `D:\fitconnect`.**
> O v4 foi escrito contra um repositório imaginado. Este é escrito contra o que lá está.

---

## O QUE MUDA FACE AO v4 — lê isto primeiro

O v4 parte de premissas falsas. Corrigidas:

| v4 assumia | Realidade |
|---|---|
| "Wear OS está fora do âmbito, agora entra" | **`android/wear` já existe e compila.** `:wear:assembleDebug` e `:wear:lintDebug` passam |
| "A web app pode não existir; escolhe entre Wasm, React ou PWA" | **`apps/web` é Next.js 14 em produção na Vercel**, 73 rotas, 143 testes. A escolha foi feita por construção — ver `docs/adr/ADR-010` |
| "Gera tokens para as três superfícies a partir de uma fonte" | **`packages/design-tokens` já faz isso.** `pnpm tokens:kotlin` + `tokens:kotlin:check` |
| "Paleta `#0A0C10` / `#C8FF3D` / `#3DE1FF`" | **Errada.** A canónica é `#070B14` / `#C8FF00` / `#3CD7FF` (ADR-007). Já foi recusada uma vez; não voltar a pedir |
| "Primeiro commit: snapshot antes de tocar em nada" | **Já foi feito:** `a913959` |
| "FASE 6 — corre os emuladores" | **Bloqueado por falta de hypervisor na máquina.** Não é falha do agente |
| "ADR-001 e ADR-002" | `ADR-001` a `ADR-009` já existem. São **ADR-010 e ADR-011** |

**Documentos normativos que já existem e ganham a qualquer coisa neste prompt:**

- `docs/adr/ADR-010-multiplatform-surfaces.md` — fronteira entre as três superfícies
- `docs/adr/ADR-011-realtime-sync-session-ownership.md` — canais, offline-first, posse de sessão
- `docs/design/ELITE_OS_MOTION_LANGUAGE.md` — curvas, durações, 9 padrões nomeados, anti-padrões
- `docs/design/dashboards-web.html` — maquete funcional dos 6 painéis
- `docs/design/landing-page.html` — maquete da landing
- `docs/AGENT_TOOLCHAIN.md` — skills/MCP instalados e rejeitados, com razões
- `CLAUDE.md` — memória do projeto

---

## 0. PAPEL E PROTOCOLO

**Staff-level Engineer + Product Designer**, multiplataforma, em modo agente contínuo.

```
PLANEAR → EXECUTAR → VERIFICAR COM EVIDÊNCIA → REGISTAR → PRÓXIMO
```

Nunca declares nada feito sem output que o prove. `⏭️ NÃO EXECUTADO` vale mais do que um
resultado inventado. **60% real vale mais que 100% inventado.**

Decisões não triviais em `docs/DECISION-LOG.md`, uma linha cada.
Bloqueio: tenta três abordagens, documenta, regista em pendentes, **continua com o resto**.
Contexto a encher: escreve `docs/AGENT-STATE.md`, resume, retoma.

Output para o utilizador em **Português de Portugal**. Código e commits em inglês.

**Branch:** `feat/elite-os-v2` (já existe).

---

## 1. FASE A — LIMITES DE AMBIENTE (fazer primeiro, 5 minutos)

Antes de planear seja o que for, descobre o que a máquina consegue. Escreve
`docs/qa/ENVIRONMENT.md` com os resultados **verbatim**:

```powershell
node --version; pnpm --version; java -version
where.exe adb; where.exe emulator; where.exe android
adb devices
emulator -list-avds
# hypervisor — é isto que bloqueou o turno anterior:
Get-CimInstance Win32_ComputerSystem | Select HypervisorPresent
sc.exe query intelhaxm 2>$null; sc.exe query gvm 2>$null
Get-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform | Select State
```

**Se o hypervisor estiver ausente:** não tentes emuladores. Marca as FASES F e G como
`BLOQUEADO POR AMBIENTE`, diz ao utilizador o que ele precisa de ativar
(Windows Features → *Windows Hypervisor Platform*, e desativar o Hyper-V se estiver a
competir com o HAXM), e **continua com tudo o resto**. Não simules capturas.

---

## 2. FASE B — RECONHECIMENTO DELTA

`docs/00-BASELINE.md` já existe. **Não o reescrevas.** Escreve `docs/00-BASELINE-DELTA.md`
só com o que mudou, e responde a estas perguntas concretas:

1. `readiness` ainda está duplicado em `apps/web/lib/readiness/compute.ts` e
   `apps/mobile/lib/readiness.ts`? (ADR-010, item 1)
2. `packages/realtime-client` ainda tem 48 linhas sem implementação?
3. Existe algum símbolo de posse de sessão (`sessionOwner`, `epoch`, `transferSession`)?
4. `pnpm tokens:kotlin:check` está no CI ou continua a correr à mão?
5. Quantos ficheiros importam `components/ui-glass/**`? (eram ~47)
6. `NEXT_PUBLIC_DEMO_MODE` continua a `true` por omissão?
7. Prisma e `supabase/migrations/` continuam a divergir?

Corre o build e guarda o log. **Não faças suposições sobre nada disto — mede.**

---

## 3. FASE C — DÍVIDA QUE BLOQUEIA TUDO O RESTO

Por esta ordem. Cada item é um commit atómico com build verde entre eles.

1. **`@fitconnect/utils` com `readiness` único.** Apagar as duas cópias. É o teste de fogo
   do ADR-010 — duas superfícies podem *mostrar* diferente, não podem *calcular* diferente.
2. **`SessionOwnership` em `android/shared`** com `epoch` + heartbeat de 10 s + expiração a
   45 s. Sem isto os cenários 1, 8 e 9 da FASE H são impossíveis. **É o item de maior
   retorno de todo o prompt.**
3. **Transporte realtime a sério** em `packages/realtime-client`, substituindo Broadcast.
   Se a fronteira Convex ↔ Supabase não estiver escrita, **para e pergunta** (ADR-011, ação 2).
4. **`tokens:kotlin:check` como gate do CI.**
5. **`NEXT_PUBLIC_DEMO_MODE=false` + auth em todas as rotas `/api/v1/`.** Se isto partir a
   demo, esconde os fluxos de pagamento em vez de reabrir o bypass.

---

## 4. FASE D — DESIGN SYSTEM

Tokens exatamente como em `packages/design-tokens` e `apps/web/app/elite-os.css`.
**Zero literais fora do ficheiro de tokens.**

**Conflito conhecido a resolver:** `elite-os.css` define
`--eos-ease-spring: cubic-bezier(0.25, 1.5, 0.5, 1)` — 50% de overshoot. Isso viola
`ELITE_OS_MOTION_LANGUAGE.md` §1 em qualquer elemento com dados. Audita os usos, migra
para `--eos-ease-settle`, e mantém o spring **só** no selo de confirmação de recorde.

Aplica a escada de durações do documento de movimento: micro 120 · UI 220 · ecrã 340 ·
dados 800 · saída 160. Stagger 28 ms, máximo 6, teto de 170 ms.

Componentes `Elite*` com cinco estados cada, entrada no `DesignSystemCatalog`.
Verificação: build verde + catálogo a renderizar em Android **e** no browser + screenshots.

---

## 5. FASE E — SUPERFÍCIES

### E1 · Mobile (Compose)
Home · Discover · Activity · Sessão (lista, detalhe, execução, conclusão) · Sono · Corrida ·
Community · Profile · Onboarding · Login.

Cinco estados por ecrã: default, loading, vazio, erro com recuperação, offline com
timestamp de cache. Safe areas, IME, rotação, gestos.

**Perfil reestruturado:** definições saem para ecrã próprio via engrenagem no `EliteHeader`.
Perfil ganha 4 abas (`RESUMO · CONQUISTAS · HISTÓRICO · SOCIAL`) com estado preservado em
`rememberSaveable`. Detalhe completo na §5B do v4 — mantém-se válido.

### E2 · Wear OS
**Já existe. Não recomeces.** O que falta:

- **Modo ambiente** — preto `#000000` puro (não `#070B14`, que acende pixels OLED), sem
  honeycomb, sem halo, atualizado ao minuto, acento em **<10% da área acesa** a ~40% de
  luminância, com deslocamento de posição contra burn-in. Ver `ELITE_OS_MOTION_LANGUAGE.md` §4.
- **Migração `compose-material` → `compose-material3`** — o catálogo está em M2. Usa a skill
  oficial `wear/wear-compose-m3`.
- Complicação de recuperação (`RANGED_VALUE`) e streak (`SHORT_TEXT`); tile do treino de hoje.
- Alvos ≥48dp mesmo a 1.4". Tipografia sobe um passo face ao telemóvel.

### E3 · Web
**A maquete `docs/design/dashboards-web.html` é a especificação.** Implementa-a em
`apps/web`. Contém já: navegação lateral, indicador de sessão ativa com origem, os 6
painéis, estados vazios, vista de tabela acessível, exportação CSV real, atalhos
`g h` / `g a` / `/` / `?`.

**Regras de gráfico que a maquete já respeita e que não podes quebrar:**
- **Nunca dois eixos y.** Sono e HRV são gráficos separados, não um com dois eixos
- Paleta de séries `--eos-chart-1..4` — as hues canónicas a brilho pleno caem fora da banda
  de lightness OKLCH do modo escuro. Volt pleno fica reservado ao herói e ao CTA
- Legenda sempre presente com ≥2 séries; rótulos diretos em ≤4
- A cor nunca anda sozinha: estado traz ícone e texto
- Exportação real, não botão decorativo

3 colunas ≥1280px · 2 ≥900px · 1 abaixo. Responsivo até 320px sem scroll horizontal.
Lighthouse ≥90 nas quatro categorias. **Testar Safari a sério** — o `.mcp.json` já tem o
perfil `playwright-webkit` para isso.

### E4 · Landing page
**A maquete `docs/design/landing-page.html` é a especificação.**

**Regra de honestidade, não negociável:** as imagens são **capturas reais do emulador**
produzidas na FASE G. Se uma funcionalidade não existe, não aparece. Números de
utilizadores, avaliações e testemunhos **só se forem verdadeiros** — caso contrário a
secção não existe. A maquete já traz os placeholders marcados e uma secção explícita a
dizer o que não tem e porquê.

Meta tags e Open Graph, imagem OG gerada, `sitemap.xml`, `robots.txt`, Lighthouse ≥95,
FCP <1.5s. **Sem tracking de terceiros sem autorização (§9.4).**

---

## 6. FASE F — LIMPEZA

Código morto, dependências não usadas, duplicação consolidada, zero hardcoded, assets
comprimidos, sem segredos, lint sem warnings. **Um commit atómico por remoção, build verde
entre eles.** Dúvida sobre uso → não removes, marcas como candidato.

`app:lintDebug` falha hoje com 23 erros `MissingTranslation` **pré-existentes**. Ou
corriges, ou registas como dívida aceite — não silencies a regra.

---

## 7. FASE G — POLIMENTO

Passagem dedicada, superfície a superfície. "Polido" = estes oito, verificados um a um:

1. **Alinhamento óptico** — margens reais, baselines coerentes
2. **Ritmo vertical** — tudo na escala de 4dp; 12 e 14 no mesmo ecrã é erro
3. **Consistência de estado** — um skeleton, um vazio, um erro. Não três variantes
4. **Coerência de movimento** — famílias de curvas do documento de movimento, nada com
   duração por omissão
5. **Densidade** — um herói e um CTA volt por ecrã
6. **Texto** — maiúsculas nas strings e não por transformação, sem corte a 200%
7. **Toque** — alvos ≥48dp, press-scale e háptico nas primárias
8. **Cor** — contraste **medido**, não estimado

`docs/POLISH-CHECKLIST.md`: tabela ecrã × 8, por superfície.

---

## 8. FASE H — TESTE

### H1 · Matriz por categoria
Unitários (≥70% em domínio/dados) · estado · componente (5 estados × 3 superfícies) ·
screenshot (light/dark, 100% e 200%) · navegação (back stack, deep links, process death) ·
dados (2xx/4xx/5xx/timeout/offline/cache/paginação/volume) · E2E por superfície ·
acessibilidade (**TalkBack a sério, não dump de `content-desc`**; teclado e leitor de ecrã
na web) · performance (arranque, jank, memória, APK, Lighthouse) · background (10 min
minimizado, `am kill`, avião, poupança) · widget e tile · segurança (sem segredos no
binário nem no bundle, HTTPS, dados de saúde fora dos logs, CSP) · i18n (pseudo-locale,
DE, RTL) · regressão.

### H2 · Integração entre dispositivos — **é o teste que interessa**

| # | Cenário | Critério |
|---|---|---|
| 1 | Iniciar no relógio → abrir telemóvel | Mostra em curso, **não cria segunda sessão** |
| 2 | Iniciar no telemóvel → abrir web | Web mostra em curso, com indicador de origem |
| 3 | Concluir série no relógio | Telemóvel ≤1s, web ≤2s |
| 4 | Editar treino na web | Telemóvel atualiza sem refrescar à mão |
| 5 | Relógio sem Bluetooth durante sessão | Continua local, sincroniza ao reconectar, sem duplicar |
| 6 | Telemóvel em avião durante sessão | Escritas em fila, reenvio idempotente |
| 7 | Escrita simultânea em dois dispositivos | Resolução conforme ADR-011, sem perda silenciosa |
| 8 | Terminar no telemóvel | Relógio encerra e mostra resumo |
| 9 | Logout na web | **Não** termina a sessão em curso no telemóvel |
| 10 | Relógio standalone | Sincroniza direto com a cloud |

**Medir latência real em cada um e registar.** "Tempo real" sem número medido não conta.

**Pré-requisito que falha em silêncio:** verifica que `CapabilityClient` reporta o nó par
**antes** de correr estes testes. Sem isso a Data Layer não faz nada e os testes passam
por vacuidade.

---

## 9. FASE I — EMULADORES, BUILDS E QR

**Só se a FASE A disser que o hypervisor existe.** Caso contrário: `BLOQUEADO POR AMBIENTE`
e segue.

```powershell
# Telemóvel — imagem Google APIs/Play, NUNCA AOSP (sem Play Services o mapa nunca renderiza)
adb shell pm list packages | Select-String com.google.android.gms
emulator -avd fitconnect_phone -no-snapshot-load -gpu host

# Relógio
sdkmanager "system-images;android-34;android-wear;x86_64"
avdmanager create avd -n fitconnect_watch -k "system-images;android-34;android-wear;x86_64" -d wearos_small_round
adb -s emulator-5554 forward tcp:5601 tcp:5601   # ponte da Data Layer
```

**Tarefa em aberto — mapa:** detalhe de corrida preso em loading infinito. Confirma por
logcat e corrige a **causa-raiz**: a máquina de estados precisa de quatro ramos —
Loading com timeout de 8s → Error, Success, Empty, Error — não dois.

Depois: `assembleRelease` de mobile e wear; build de produção da web; **capturar todos os
ecrãs reais** para `docs/qa/shots/` (alimentam a landing page); publicar a web e obter URL;
gerar QRs para APK e web app em `docs/qa/qr-*.png`.

**O URL aparece sempre em texto por baixo do QR** — QRs falham e é preciso alternativa.
Se for APK debug, dizê-lo. Se exigir fontes desconhecidas, avisar.

---

## 10. FASE J — RELATÓRIO

Atualiza `docs/RELATORIO-ELITE-OS.md` (não crias outro). Secções: sumário executivo ·
resumo dos ADR-010 e 011 · antes/depois por superfície com métricas · design system ·
alterações por ecrã · Wear (incluindo **consumo medido** em ambiente) · web (dashboards,
Lighthouse, matriz de browsers) · landing (capturas, Lighthouse, SEO) · limpeza ·
polimento · testes (✅/⚠️/❌/⏭️ com números) · **os 10 cenários com latência medida** ·
emuladores · 📱 instalar (QRs + URLs em texto) · bugs com causa-raiz · **⏳ PENDENTE**
(descrição · porquê · impacto · esforço · próximo passo) · riscos e dívida · próximos
passos por retorno/esforço.

---

## 11. PARAGENS OBRIGATÓRIAS

Paras e perguntas se:

1. Alterar a paleta canónica ou a estrutura de 5 tabs parecer necessário
2. Uma remoção é irreversível e tens dúvida se é usada
3. Precisas de `push --force`, `reset --hard`, ou rebase sobre trabalho existente
4. Precisas de adicionar analytics, tracking, publicidade ou envio de dados para terceiros
   — **inclui a landing page**
5. Encontras segredos ou credenciais no repositório
6. Precisas de mostrar dados de saúde simulados sem marcador `LOCAL_DEMO`
7. **A fronteira Convex ↔ Supabase continua por definir** e precisas de escrever código
   que dependa dela
8. A landing page precisaria de números, testemunhos ou funcionalidades que não existem
9. Uma instrução deste prompt entra em conflito com um ADR aceite ou com
   `ELITE_OS_MOTION_LANGUAGE.md` — **os documentos ganham**
10. Um teste de acessibilidade só passa se a acessibilidade for reduzida

Fora destes dez: decides, registas, continuas.

---

## 12. ENTREGA

Branch `feat/elite-os-v2` · `RELATORIO-ELITE-OS.md` · `DECISION-LOG.md` ·
`POLISH-CHECKLIST.md` · `00-BASELINE-DELTA.md` · `qa/ENVIRONMENT.md` · `docs/qa/` com
capturas, logs, latências e QRs · APK mobile · APK wear · web publicada · landing page.

---

## 13. COMEÇA

FASE A → FASE J, sem parar, exceto §11. Uma linha de progresso ao fim de cada fase.

**Ordem de retorno, se tiveres de escolher:** FASE A (5 min, evita horas perdidas) →
FASE C item 2 (`SessionOwnership`, desbloqueia metade dos testes) → FASE C item 1
(`readiness` único) → FASE E3 (a maquete já está feita, é implementar).
