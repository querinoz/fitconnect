# ADR-010: Arquitetura das três superfícies (mobile · Wear OS · web)

**Estado:** Proposto
**Data:** 2026-08-18
**Decisores:** dono do produto · engenharia Android · engenharia web
**Substitui:** nada. **Relaciona-se com:** ADR-005 (Expo → Android nativo), ADR-006 (elite-core Rust), ADR-007 (naming Elite OS Surface)
**Nota de numeração:** o MEGA PROMPT v4 pede isto como "ADR-001-multiplatform". `ADR-001` já existe (unificação de tokens) e renumerar ADRs aceites seria pior do que a divergência de nome. Fica ADR-010.

---

## Contexto

O MEGA PROMPT v4 §3.1 pede que se escolha **como a app web passa a existir**, oferecendo
três opções: Compose Multiplatform/Wasm, app React separada sobre a mesma API, ou PWA.
A premissa da pergunta é que o repositório é Kotlin/Compose e que a web ainda não existe.

**Essa premissa é falsa.** O reconhecimento do repositório mostra:

| Superfície | Estado real |
|---|---|
| `apps/web` | **Next.js 14 em produção na Vercel.** 73 rotas, ~133 testes Vitest, 10 specs Playwright, PWA com manifest, i18n em 6 locales |
| `android/` | **15 módulos Gradle, Compose.** É a app de referência. `:app:assembleDebug` passa |
| `android/wear` | **Existe e compila.** `:wear:assembleDebug` e `:wear:lintDebug` passam |
| `android/shared` | **kotlin-jvm**, não KMP. Contém sessão, envelope de telemetria, outbox, eventos realtime |
| `apps/mobile` | Expo 52, **congelado** (ADR-005, "Path A frozen") |
| `packages/design-tokens` | **Fonte única** que gera CSS *e* Kotlin (`pnpm tokens:kotlin`, com `:check`) |

A decisão de §3.1 está, na prática, tomada há muito: **a opção B foi escolhida por
construção**. O que falta não é escolher — é **documentar a fronteira** e travar a
deriva, porque o repositório tem hoje duas navegações diferentes, dois cálculos de
readiness duplicados e dois esquemas de base de dados em paralelo.

### Forças em jogo

- **Trava explícita do §16.7:** se a escolha implicar reescrever >30% do código, parar e
  perguntar. Compose Multiplatform/Wasm implicaria exatamente isso — deitar fora uma app
  Next.js em produção. Logo, está excluída sem discussão.
- O `:shared` é **kotlin-jvm, não KMP**. O relatório de conclusão diz textualmente:
  *"Multiplatform plugin — Not applied (AGP 9 risk)"*.
- O design system **já é partilhado a sério** — é o ativo mais forte do repositório e o
  que torna a divergência de UI aceitável.
- Divergências reais e registadas: navegação athlete web (`Today · Sessions · Coach ·
  Inbox · Profile`) vs Expo (`Home · Discover · Sessions · Programs · Community`) vs os
  5 tabs do prompt (`HOME · DISCOVER · ACTIVITY · COMMUNITY · PROFILE`). **Três verdades.**

---

## Decisão

**Manter três superfícies com UI independente sobre um núcleo partilhado em duas camadas.**
Não unificar a camada de UI. Unificar tokens, contratos de dados e regras de domínio.

```
         packages/design-tokens          ← fonte única (JÁ EXISTE)
          ├── CSS custom properties  → apps/web, landing
          └── EliteSurfaceTokens.kt  → android/design, android/design-ui
                                        (pnpm tokens:kotlin:check no CI)

         Contratos de dados (OpenAPI/tRPC + envelope telemetry.v1)
          ├── apps/web        (Next.js 14)      — UI própria, densa, teclado
          ├── android/        (Compose)         — UI própria, tátil, 5 tabs
          └── android/wear    (Wear Compose)    — UI própria, glance de 2s

         android/shared (kotlin-jvm)  ← domínio partilhado phone ↔ watch
```

**Regra de fronteira:** o que é **medição** é partilhado; o que é **apresentação** é por
superfície. Cálculo de 1RM, zonas de FC, readiness, carga aguda/crónica, resolução de
conflitos — uma implementação só. Navegação, layout e densidade — por superfície.

**Consequência imediata e obrigatória:** os 5 tabs do prompt aplicam-se **só ao mobile**.
A web usa navegação lateral persistente (§7 do prompt já o diz). O relógio não tem
navegação. Documentar as três como deliberadas, e **alinhar a web nos mesmos cinco nomes
de secção** para acabar com a terceira verdade.

---

## Opções consideradas

### Opção A — Compose Multiplatform / Wasm

| Dimensão | Avaliação |
|---|---|
| Complexidade | **Alta** — exige migrar `:shared` de kotlin-jvm para KMP, e AGP 9 já foi sinalizado como risco |
| Custo | **Proibitivo** — deitar fora uma app Next.js em produção com 73 rotas e 143 testes |
| Escalabilidade | Boa a longo prazo para paridade de UI; má para densidade de dashboards |
| Familiaridade da equipa | Média em Compose, alta em React |
| SEO | **Nulo.** A landing page e as páginas de marketing morrem |

**Prós:** um só código de UI; paridade garantida por construção.
**Contras:** dispara a trava do §16.7; bundle Wasm pesado num produto cuja web serve
dashboards densos; ecossistema jovem; perde SEO, que é requisito da §8 (Lighthouse ≥95).

### Opção B — App web separada (React/Next) sobre a mesma API ✅

| Dimensão | Avaliação |
|---|---|
| Complexidade | **Baixa** — é o estado atual; o trabalho é documentar e travar deriva |
| Custo | **Zero de migração.** Custo recorrente: duplicar a camada de UI |
| Escalabilidade | Boa. Cada superfície evolui ao ritmo do seu ecossistema |
| Familiaridade da equipa | **Alta** nos dois lados |
| SEO | **Total** — Next.js com SSR |

**Prós:** preserva produção; dashboards densos com o ecossistema certo; tokens já
partilhados garantem coerência visual sem partilhar UI; a web pode usar teclado e tabelas,
que o telemóvel não comporta.
**Contras:** a camada de UI é escrita duas vezes; risco real de deriva de comportamento
(já visível na navegação e no readiness duplicado). Exige disciplina de contratos.

### Opção C — PWA sobre a app web

| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa — **já parcialmente feito** (manifest ok, PWA prod-only, 7/10) |
| Custo | Baixo |
| Escalabilidade | Limitada em Android: sem Health Connect, sem Data Layer, sem serviço em primeiro plano |
| Familiaridade | Alta |

**Prós:** instalável sem loja; um só código para web e "app".
**Contras:** **não substitui o nativo neste produto.** Uma app de fitness precisa de
serviço em primeiro plano durante a sessão, de sensores e da Data Layer para o relógio.
Nenhuma dessas coisas existe numa PWA em Android.
**Veredicto:** não é alternativa às outras — é um **complemento**, e mantém-se como tal.

---

## Análise de trade-offs

O trade-off central é **duplicação de UI contra adequação de cada superfície**.

A Opção A elimina a duplicação e paga com o produto: uma app web em Wasm serve mal
dashboards de doze semanas com tabelas ordenáveis e exportação, e mata o SEO de que a
§8 depende. A Opção B aceita escrever a UI duas vezes e compra, com isso, o ecossistema
certo em cada lado e a preservação do que já está em produção.

A duplicação só é aceitável porque **o que se duplica é apresentação, não medição**. Se
`readiness` estiver implementado duas vezes — e hoje está, em
`apps/web/lib/readiness/compute.ts` e `apps/mobile/lib/readiness.ts` — a decisão está a
ser violada. Esse é o teste concreto: *duas superfícies podem mostrar o mesmo número de
forma diferente; não podem calculá-lo de forma diferente.*

---

## Consequências

**Fica mais fácil**
- Evoluir a web sem tocar no Android e vice-versa
- Dashboards densos com tabelas, teclado e exportação — impossíveis em Wasm com bom custo
- Manter SEO e Lighthouse ≥95 na landing
- Preservar 143 testes e um pipeline de deploy funcional

**Fica mais difícil**
- Garantir paridade de comportamento. Passa a exigir testes de contrato, não boa vontade
- Cada funcionalidade nova custa duas implementações de UI
- A divergência de navegação torna-se dívida visível e tem de ser resolvida

**A revisitar**
- Se o `:shared` alguma vez migrar para KMP, reabrir a hipótese de partilhar **lógica de
  apresentação** (não UI) entre Android e web via Wasm
- Se `apps/mobile` (Expo) for descongelado, esta ADR precisa de uma quarta superfície ou
  de uma decisão de morte explícita. **Recomendação: decidir matá-lo ou reanimá-lo — um
  módulo congelado com readiness duplicado é a pior das opções**

---

## Itens de ação

1. [ ] Extrair `readiness` para `@fitconnect/utils` e apagar as duas cópias — é o teste de
       fogo desta ADR
2. [ ] Alinhar a navegação da web nos cinco nomes de secção do mobile (`HOME · DISCOVER ·
       ACTIVITY · COMMUNITY · PROFILE`), mantendo o padrão lateral
3. [ ] Adicionar `pnpm tokens:kotlin:check` como gate obrigatório do CI (hoje corre à mão)
4. [ ] Escrever testes de contrato sobre o envelope `telemetry.v1` que corram nas três
       superfícies com as mesmas fixtures
5. [ ] Decidir o destino de `apps/mobile` (Expo): matar ou reanimar
6. [ ] Unificar Prisma vs `supabase/migrations` — duas fontes de esquema tornam qualquer
       contrato partilhado uma ficção (ver ADR-009)
