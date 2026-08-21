# FASE B — Reconhecimento delta

**Data:** 2026-08-18 · **Base:** `docs/00-BASELINE.md` (não reescrito)
**Método:** medido no repositório, não assumido. Cada resposta traz o comando ou o ficheiro.

> **Conclusão que muda o plano:** três dos cinco itens da FASE C do MEGA PROMPT v5
> **já estavam feitos** por uma passagem anterior. O prompt estava desatualizado face ao
> repositório. Medir primeiro poupou refazer trabalho existente.

---

## As sete perguntas

### 1. `readiness` ainda está duplicado? — **NÃO, já resolvido**

`apps/web/lib/readiness/compute.ts` (334 B) e `apps/mobile/lib/readiness.ts` (257 B) são
hoje **shims de re-export**. A implementação canónica vive em `packages/utils/src/readiness.ts`.

```
// Canonical implementation lives in @fitconnect/utils — re-exported here for
// backwards compatibility.
```

O teste de fogo do ADR-010 está **passado**. Item 1 da FASE C: ⏭️ já feito.

### 2. `packages/realtime-client` ainda tem 48 linhas sem implementação? — **SIM**

```
6 src/index.ts · 13 src/ports.ts · 29 src/routing.ts = 48
```

Continua a ser uma **porta** (`IRealtimeTransport` com `subscribe`/`publish`), sem
transporte. Item 3 da FASE C: ⏳ **por fazer**, e bloqueado pela fronteira Convex ↔ Supabase
(§11.7 — paragem obrigatória).

### 3. Existe posse de sessão? — **SIM, mas incompleta**

`android/shared/.../session/SessionOwnership.kt` já existia, com posse exclusiva, oferta e
aceitação de transferência com timeout de 8 s, e 4 testes.

**Faltavam as duas peças centrais do ADR-011:**

| Peça | Antes | Depois |
|---|---|---|
| `epoch` — contador monotónico que torna escritas tardias **rejeitáveis** | ausente | ✅ implementado |
| Liveness do dono (heartbeat 10 s / expiração 45 s) | ausente | ✅ implementado |
| `authorizeWrite` — porta de todas as escritas | ausente | ✅ implementado |
| `reclaimStale` — retomar sessão de dono sem bateria | ausente | ✅ implementado |

**Achado adicional e importante:** `SessionOwnership` **não tem chamadores em produção** —
só o próprio teste. Existe, compila, está testado, e **não está ligado à app**.

### 4. `tokens:kotlin:check` está no CI? — **SIM, já resolvido**

```
.github/workflows/ci.yml:34       - run: pnpm tokens:kotlin:check
.github/workflows/android.yml:38          pnpm tokens:kotlin:check
```

Item 4 da FASE C: ⏭️ já feito.

### 5. Quantos ficheiros importam `ui-glass`? — **40** (eram ~47)

Reduziu 7. Continua a ser dívida aberta; não é candidato a remoção enquanto for este número.

### 6. `NEXT_PUBLIC_DEMO_MODE` continua a `true`? — **SIM, em ambos os `.env.local`**

```
.env.example:17          NEXT_PUBLIC_DEMO_MODE="false"   ← o exemplo está correto
.env.local:11            NEXT_PUBLIC_DEMO_MODE="true"    ← local
apps/web/.env.local:10   NEXT_PUBLIC_DEMO_MODE="true"    ← local
```

Item 5 da FASE C: ⏳ **por fazer**. É configuração local, não código — decisão do dono,
porque desligar isto sem auth real parte a demo.

### 7. Prisma e `supabase/migrations/` continuam a divergir? — **SIM**

Ambos presentes, sem fronteira escrita. Ver ADR-009 e ADR-011 ação 2.

---

## Defeito encontrado que não estava em nenhuma lista

**As séries dos gráficos da web usavam as hues canónicas a brilho pleno.**

`insights-workspace.tsx` usava `--eos-voltline`, `--eos-telemetry` e `--eos-connect` como
cores de série. Validado com o validador de paletas:

```
node scripts/validate_palette.js "#C8FF00,#3CD7FF,#00DDB4" --mode dark --surface "#0A0E15"

[FAIL] Lightness band      voltline 0.928 · telemetry 0.817 · connect 0.800  (teto 0.67)
[FAIL] Normal-vision floor connect ↔ telemetry ΔE 11.7  (piso 15)
```

O segundo é o grave: **ΔE 11,7 para visão normal** significa que ninguém distingue as duas
séries — não é uma questão de daltonismo. Aparecia no gráfico de distribuição de treino,
onde as três coexistem.

**Corrigido** com `--eos-chart-1..4` (mesma hue, dessaturada para dentro da banda),
validado 5/5. Ver secção seguinte.

---

## Estado da FASE C após esta medição

| # | Item | Estado |
|---|---|---|
| 1 | `@fitconnect/utils` com `readiness` único | ⏭️ **já estava feito** |
| 2 | `SessionOwnership` com epoch + heartbeat | ✅ **completado agora** |
| 3 | Transporte realtime a sério | ⏳ bloqueado pela fronteira Convex ↔ Supabase (§11.7) |
| 4 | `tokens:kotlin:check` no CI | ⏭️ **já estava feito** |
| 5 | `NEXT_PUBLIC_DEMO_MODE=false` | ⏳ decisão do dono |

---

## Não medido — e porquê

- **Build e testes.** Esta sessão não os corre: o bash local não tem rede nem Android SDK,
  e os `node_modules` são binários de Windows. `docs/qa/ENVIRONMENT.md` regista o que se
  conseguiu executar.
- **Contagem de rotas e testes da web.** Os números do v5 (73 rotas, 143 testes) vêm de
  `CLAUDE.md` e não foram reconfirmados.
