# ADR-011: Sincronização em tempo real, offline-first e posse de sessão

**Estado:** Proposto
**Data:** 2026-08-18
**Decisores:** dono do produto · engenharia Android · engenharia backend
**Relaciona-se com:** ADR-009 (Supabase/Postgres), ADR-010 (três superfícies)
**Nota de numeração:** o MEGA PROMPT v4 pede isto como "ADR-002-realtime-sync". `ADR-002` já existe (formato de tokens). Fica ADR-011.

---

## Contexto

"Sincronização em tempo real" não é uma coisa só, e tratá-la como se fosse é o que parte
apps de fitness multi-dispositivo. Cada par de superfícies fala por um canal diferente,
com uma latência diferente e um modo de falha diferente.

### Estado real do repositório

| Componente | Realidade verificada |
|---|---|
| `packages/realtime-client` | **48 linhas em três ficheiros.** É uma *porta* (`IRealtimeTransport` com `subscribe`/`publish`), não uma implementação |
| Transporte web atual | Broadcast, por omissão **na mesma aba** (5/10 no inventário) |
| Wear ↔ telefone | `play-services-wearable` 19.0.0, `WearPaths`, `SessionControlCodec`, `WearTelemetrySender` — **código existe, falha fechado quando não há nó remoto** |
| Fila offline | `android/shared/.../sync/Outbox.kt` — ACK e enqueue idempotente **testados em unitário**; reconexão real **por verificar** |
| Envelope | `telemetry.v1` canónico em `:shared` |
| Posse de sessão | **Não existe.** Grep por `sessionOwner`, `activeSessionLock`, `transferSession`, `takeover` não devolve nada |
| Backend realtime | Convex decidido em CLAUDE.md §15; na prática **PENDING_HUMAN** por falta de credenciais |

**A lacuna mais grave não é o transporte — é a ausência de posse de sessão.** Sem ela,
começar um treino no relógio e abrir o telemóvel cria uma segunda sessão, e a partir daí
não há resolução de conflitos que salve os dados.

---

## Decisão

### 1. Quatro canais, declarados e distintos

| Ligação | Canal | Latência-alvo | Falha quando |
|---|---|---|---|
| Mobile ↔ Cloud | subscrição (Convex) | ≤ 2 s | sem rede → fila local |
| Web ↔ Cloud | mesma subscrição | ≤ 2 s | sem rede → IndexedDB |
| Watch ↔ Phone | **Wearable Data Layer (Bluetooth)** | ≤ 1 s | sem nó par → local, `CapabilityClient` reporta |
| Watch standalone | cloud direto (LTE/WiFi) | ≤ 3 s | sem rede → local |

**O relógio não fala com a nuvem quando o telefone está por perto.** Fala por Bluetooth.
Tratar isto como "internet" é o erro que faz a app parecer partida em qualquer ginásio
com mau sinal.

### 2. Offline-first, sem exceção

Cada superfície **escreve primeiro no armazenamento local** e sincroniza depois:
Room (Android/Wear) · IndexedDB (web — **nunca `localStorage` como fonte de verdade**).
**A UI nunca espera pela rede.** Um registo de série aparece no ecrã antes de qualquer
pedido sair do dispositivo.

### 3. Resolução de conflitos: `updatedAt` + `deviceId`

Last-write-wins com `updatedAt` (relógio do servidor quando disponível, do dispositivo
quando não) e `deviceId` como desempate determinístico e estável (ordem lexicográfica),
para que dois dispositivos cheguem à mesma conclusão sem falar um com o outro.

**Exceção obrigatória:** séries concluídas **nunca** são resolvidas por LWW. São eventos
append-only com chave de idempotência `(sessionId, setIndex, deviceId)`. Perder uma série
registada por sobreposição é inaceitável; ter duas é recuperável por dedupe.

### 4. Posse de sessão — o núcleo desta ADR

**Uma sessão de treino tem exatamente um dispositivo dono de cada vez.**

```
SessionOwnership {
  sessionId:   UUID
  ownerDevice: DeviceId
  ownedSince:  Instant
  heartbeatAt: Instant     // dono renova a cada 10 s
  epoch:       Int         // incrementa a cada transferência
}
```

- Um dispositivo que abra a app e encontre sessão ativa com **outro** dono mostra
  *"sessão a decorrer no relógio"* e **oferece transferir** — nunca abre uma segunda.
- Transferir incrementa `epoch`. Escritas com `epoch` antigo são **rejeitadas**, não
  fundidas. É isto que impede o duplo registo durante a troca.
- **Heartbeat expirado (>45 s)** liberta a posse — o dono pode ter ficado sem bateria.
  A retoma exige confirmação explícita do utilizador, nunca automática.
- Terminar a sessão no telemóvel encerra no relógio e mostra resumo (cenário 8).
- **Logout na web não termina a sessão em curso no telemóvel** (cenário 9). Posse é do
  dispositivo, não da sessão de autenticação.

### 5. Indicador de origem

Cada métrica declara de onde veio quando não é óbvio: **⌚ relógio · 📱 telemóvel ·
☁ importado**. Já implementado na maquete dos dashboards (coluna ORIGEM do histórico).

### 6. Reconciliação ao reconectar

Fila de escritas pendentes (`Outbox`), reenvio **idempotente** por chave de operação,
backoff exponencial com jitter. Uma sessão nunca duplica por reenvio.

---

## Opções consideradas (transporte cloud)

### Opção A — Convex ✅

| Dimensão | Avaliação |
|---|---|
| Complexidade | Média — subscrições reativas nativas, sem gerir WebSockets |
| Custo | Serviço gerido; mais um fornecedor |
| Escalabilidade | Boa para o volume esperado |
| Familiaridade | Já decidido em CLAUDE.md §15; `convex/` existe no repositório |

**Prós:** reatividade sem infraestrutura; decisão já tomada e parcialmente implementada.
**Contras:** um segundo fornecedor a par do Supabase (ADR-009), com a fronteira por
definir. **Risco real:** ninguém sabe hoje o que é do Convex e o que é do Postgres.

### Opção B — Supabase Realtime

**Prós:** um fornecedor só; o Postgres já é o Supabase por ADR-009; RLS aplica-se
diretamente às subscrições.
**Contras:** exige desenhar o modelo de subscrição à mão; menos ergonómico que o Convex.
**Nota honesta:** se a fronteira Convex/Supabase não for resolvida em duas semanas, esta
opção passa a ser a escolha certa por simplicidade operacional.

### Opção C — WebSocket próprio

**Prós:** controlo total.
**Contras:** reconexão, backpressure, escala e autenticação passam a ser problema da
equipa. **Rejeitada** — não há aqui nenhum requisito que o justifique.

### Opção D — Manter Broadcast/polling

**Rejeitada.** Broadcast na mesma aba não é sincronização entre dispositivos. É o estado
atual e é o que a ADR existe para substituir.

---

## Análise de trade-offs

O trade-off que interessa **não é qual o transporte** — é **quanta complexidade de posse
se aceita**.

A alternativa barata a esta ADR é "última escrita ganha, sem posse". Custa quase nada a
implementar e falha exatamente no cenário mais comum do produto: o utilizador começa no
relógio e tira o telemóvel do bolso a meio. Sem `epoch`, as duas sessões escrevem em
paralelo e o histórico fica com séries a dobrar ou em falta — o dano é silencioso e só é
descoberto dias depois, quando já não há como reconstruir.

O `epoch` é a peça que custa pouco e evita isso: um inteiro monotónico que torna toda a
escrita tardia **rejeitável em vez de fundível**. É deliberadamente mais rígido do que um
CRDT — para dados de treino, rejeitar e avisar é melhor do que fundir e mentir.

Escolher Convex sobre Supabase Realtime **não é uma decisão forte** e esta ADR não finge
que é. É a continuação de uma decisão anterior. O que é forte é a exigência de **resolver
a fronteira**: dois sistemas de dados sem fronteira escrita é pior do que qualquer um
deles sozinho.

---

## Consequências

**Fica mais fácil**
- A UI deixa de depender da rede — ganho imediato de qualidade percebida
- O cenário 1 dos dez testes de integração passa a ser implementável e testável
- Origem visível torna divergências entre dispositivos diagnosticáveis pelo utilizador

**Fica mais difícil**
- Toda a escrita passa a carregar `epoch` e chave de idempotência
- Testar exige dois dispositivos ou dois emuladores em simultâneo — o que hoje está
  bloqueado por falta de hypervisor
- O heartbeat gasta bateria. 10 s é um compromisso, e tem de ser **suspenso em modo
  ambiente no relógio** (ver `ELITE_OS_MOTION_LANGUAGE.md` §4)

**A revisitar**
- Se aparecerem sessões colaborativas (dois atletas, um treinador a assistir), a posse
  única deixa de servir e passa a ser preciso um modelo de papéis
- Se o `epoch` gerar rejeições frequentes em uso real, o problema é a UX da transferência,
  não o modelo — não relaxar o `epoch` como resposta

---

## Itens de ação

1. [ ] Implementar `SessionOwnership` em `android/shared` com `epoch` e heartbeat —
       **é o item que desbloqueia os cenários 1, 8 e 9**
2. [ ] Escrever a fronteira Convex ↔ Supabase numa tabela explícita. Se não estiver
       resolvida em duas semanas, migrar para Supabase Realtime e fechar a questão
3. [ ] Substituir Broadcast por transporte real em `packages/realtime-client` — hoje são
       48 linhas de porta sem implementação
4. [ ] IndexedDB na web com camada de sincronização; auditar e remover qualquer
       `localStorage` usado como fonte de verdade
5. [ ] Verificar `CapabilityClient` a reportar o nó par **antes** de correr os testes de
       integração — sem isso a Data Layer falha em silêncio e os testes passam por não
       fazerem nada
6. [ ] Medir e registar a latência real dos 10 cenários. *"Tempo real" sem número medido
       não conta*
7. [ ] Testes de propriedade sobre a resolução de conflitos: gerar escritas concorrentes
       aleatórias e afirmar que duas réplicas convergem
