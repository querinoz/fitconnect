# ELITE OS — Linguagem de Movimento

> **Estado:** proposta normativa · 2026-08-18
> **Âmbito:** mobile (Compose) · Wear OS · web (Next.js) · landing page
> **Regra-mãe:** *no Elite OS, todo o movimento é uma leitura.* Se um elemento se
> move e não consegues dizer que número, que estado ou que transição de contexto
> esse movimento comunica, o movimento é ruído e sai.

Derivado da análise de raylight.app, animos.app, gsap.com, autoae.online,
rebrand.gallery, unblast.com, fontpair.co e gradientlab.co. O que foi **observado**
nessas fontes está separado do que é **inferência** — ver `## Proveniência`.

---

## 1. Curvas

```css
:root {
  /* 1. Defeito do sistema. Saída imediata, assentamento longo, zero overshoot.
        Derivada do power1.out da GSAP. Usar em caso de dúvida. */
  --eos-ease-standard: cubic-bezier(0.33, 1, 0.68, 1);

  /* 2. Assentamento de dados. Arranque agressivo, cauda longa (≈ expo.out).
        Só para valores que "chegam" a um número.
        Já existe em elite-os.css como --eos-ease-out. */
  --eos-ease-settle:   cubic-bezier(0.16, 1, 0.30, 1);

  /* 3. Simétrica. Deslocação, não aparição: indicador de tab, painel, reordenação. */
  --eos-ease-traverse: cubic-bezier(0.65, 0, 0.35, 1);

  /* 4. Superfícies grandes (sheets, modais). Peso sem elasticidade. */
  --eos-ease-surface:  cubic-bezier(0.25, 1, 0.50, 1);

  /* 5. Saída. Acelera para fora. NUNCA para entradas. */
  --eos-ease-exit:     cubic-bezier(0.40, 0, 1, 1);

  /* 6. Tempo real. Cronómetros, telemetria, eixo temporal. Não negociável. */
  --eos-ease-realtime: linear;
}
```

**Não existe curva de overshoot no sistema.** Uma única exceção autorizada — recorde
pessoal batido — usa `cubic-bezier(0.34, 1.26, 0.64, 1)` (≈2% de overshoot, contra
os ≈10% do `back.out(1.7)`) e **apenas no selo de confirmação, nunca no número nem
no anel**.

> **Conflito a resolver:** `elite-os.css` define hoje `--eos-ease-spring:
> cubic-bezier(0.25, 1.5, 0.5, 1)` — 50% de overshoot. Isso viola esta
> especificação em qualquer elemento com dados. Auditar os usos antes de remover.

---

## 2. Escada de durações

| Escalão | Alvo | Intervalo | Curva | Aplicação |
|---|---|---|---|---|
| **Micro** | **120 ms** | 90–140 | `standard` | Press, toggle, foco, hover, mudança de cor de estado |
| **UI** | **220 ms** | 180–260 | `standard` / `traverse` | Cartão, chip, tooltip, indicador de tab, accordion |
| **Ecrã** | **340 ms** | 300–400 | `surface` | Rota, bottom sheet, modal, painel de detalhe |
| **Dados** | **800 ms** | 600–1200 | `settle` / `realtime` | Anel, count-up, traçado de gráfico, gauge |
| **Saída** | **160 ms** | 120–200 | `exit` | Sempre 60–70% da entrada correspondente |
| **Ambiente** | — | — | — | **Não existe.** Sem loops de fundo. |

**Stagger:** 28 ms por elemento, máximo 6 elementos, total nunca acima de 170 ms.
A partir daí, agrupar e animar o grupo.
*(Os 100 ms do exemplo canónico da GSAP são lentos demais para UI móvel densa —
6 cartões dariam 500 ms só de desfasamento.)*

**Teto absoluto:** nada no caminho crítico durante treino ativo excede **400 ms**.
O utilizador está entre séries, com o relógio a correr.

Os valores existentes em `elite-os.css` (`micro 150ms` · `ui 220ms` · `screen 400ms`
· `data 1200ms`) já estão dentro dos intervalos — `micro` desce de 150 para 120 e
`screen` de 400 para 340 como alvo, mantendo 400 como teto.

---

## 3. Padrões nomeados

### `ring.fill` — preenchimento do anel
`900 ms · settle` · `stroke-dashoffset` 0% → valor, traço volt `#C8FF00`.
O contador numérico corre **na mesma timeline** e termina no mesmo frame. Zero
overshoot: o anel para no valor e fica imóvel — **repouso absoluto**.
*Só anima na primeira apresentação do valor da sessão.* Reentradas mostram o valor
já preenchido — um instrumento não repete a sua própria calibração.

### `card.ingress` — entrada de cartão
`240 ms · standard` · `translateY 12px → 0` + `opacity 0 → 1` · stagger 28 ms, máx 6.
**Sem `scale`.** Escalar sugere que o cartão vem de outra profundidade; ele
materializa-se na sua posição. *Arc-free.*

### `tab.traverse` — transição de separador
Indicador: `200 ms · traverse`, translação + largura a interpolar para o texto do novo
separador. Conteúdo: crossfade `160 ms` com 40 ms de sobreposição. O conteúdo **não**
desliza lateralmente — exceto se a transição for arrastada, e aí é 1:1 com o dedo.

### `metric.land` — aterragem de métrica
`600 ms · realtime` nos dígitos + `120 ms` de opacidade no label.
Contagem linear, `tabular-nums` obrigatório, sem salto de layout. Uma passagem só —
sem rolo de odómetro. Decimais aparecem já fixas; só a parte inteira conta.

### `telemetry.draw` — traçado de telemetria
`700 ms · realtime`, path da esquerda para a direita.
Linear porque o eixo X **é** tempo — acelerar o traçado distorce a representação
temporal. Pontos entram depois com fade de 100 ms, stagger 20 ms. A grelha de
referência (dot matrix ciano a 4%) é **estática** e já lá está antes do traçado.

### `surface.present` — sheet / painel de detalhe
Entrada `340 ms · surface`, `translateY 100% → 0`.
Backdrop: `opacity 0 → 0.6` em 240 ms linear **+ `backdrop-filter: blur(0 → 12px)`**
— o *rack focus* roubado ao Raylight. Saída `240 ms · exit`. Se dispensado por gesto,
segue o dedo a 1:1 e a curva só cobre a porção restante.

### `set.confirm` — série registada
Press `120 ms · standard`, `scale 1 → 0.97`, retorno 120 ms.
Confirmação: borda volt `opacity 0 → 1 → 0` em `320 ms · standard`.
**Háptico no frame 0 do press, não no fim.** O tátil precede sempre o visual.

### `state.arm` — foco / estado armado
`120 ms · standard`, borda + halo de 1px em ciano `#3CD7FF`.
**Estático depois de atingido.** Um campo focado não pulsa. Estado persistente
animado consome atenção continuamente sem acrescentar informação.

### `rest.deplete` — cronómetro de descanso *(o mais importante da app)*
`realtime`, sempre. O anel esvazia em proporção exata ao tempo real. Dígitos com
`steps()` — mudam de segundo a segundo, sem interpolação.
Nos 3 s finais: volt → âmbar em 200 ms + háptico por segundo. **Sem aceleração, sem
pulsação.** Acelerar o movimento de um relógio é mentir sobre o tempo.

---

## 4. Anti-padrões

### Movimento
1. **Nunca `elastic`, `bounce` ou spring com bounce** em elemento que represente um
   número. Um valor que ultrapassa e volta diz "não tenho a certeza". A métrica é o produto.
2. **Nunca movimento em arco.** Nada percorre uma curva entre dois pontos.
3. **Nunca loops infinitos** — shimmer, pulse, glow, breathing, gradiente animado,
   partículas. Se está sempre a mexer, é ruído com custo permanente de atenção.
4. **Nunca revelação letra-a-letra** em conteúdo funcional. Ilegibilidade não é sofisticação.
5. **Nunca scroll com inércia ou parallax** em ecrãs de treino. O conteúdo para quando
   o dedo para — mão suada, entre séries.
6. **Nunca confetti nem medalhas a girar.** Um PR confirma-se com número + delta +
   `set.confirm`. Este é o corte entre instrumento e app social.
   *(Coerente com a decisão já registada no relatório: "Confetti → Não, lock de produto".)*
7. **Nunca 3D, tilt ou perspetiva** em elementos de dados. Distorcer geometria que
   representa números é falsificar a leitura.
8. **Nunca acima de 400 ms** no caminho crítico durante treino ativo.
9. **Nunca ignorar `prefers-reduced-motion`** — mas também **nunca duração 0 global**.
   No modo reduzido: `ring.fill`, `metric.land` e `telemetry.draw` aparecem no valor
   final; entradas passam a fade de 100 ms; `surface.present` perde o translate.
   Remover *todo* o feedback deixa a interface a saltar, o que é pior para sensibilidade
   vestibular do que um fade curto.

### Bateria e ecrã sempre ligado — o caso do relógio
10. **Em ambiente (AOD), toda a animação para.** O SO permite uma atualização por
    minuto. Um anel a tentar animar dá frames descartados e parece avariado. No AOD o
    anel **salta** para o valor; o cronómetro mostra minutos, não segundos.
11. **No AOD, `#070B14` não é preto** — é cinzento-azulado que acende pixels OLED.
    Trocar para `#000000` puro no modo ambiente. Custo de energia real, 24h por dia.
12. **Volt `#C8FF00` em área grande no AOD é risco duplo:** burn-in e consumo. O
    verde-lima está perto do pico de sensibilidade do olho e usa o subpixel verde, o
    mais brilhante e o de degradação mais rápida. Regra: **<10% da área acesa**, ~40%
    de luminância, e deslocar a posição alguns pixels a cada atualização.
13. **Nunca traçado de telemetria em direto num mostrador AOD.** FC a atualizar ao
    segundo durante 60 minutos é o pior padrão de consumo desta app. No AOD: um
    número, uma zona, mais nada.
14. **Bateria <20% ou poupança de energia:** degradação automática. Mesmo caminho do
    `prefers-reduced-motion`, mais desligar `backdrop-filter: blur` (caro em GPU), a
    grelha dot matrix e qualquer gradiente.
15. **Nunca animar com a app a registar em segundo plano com o ecrã ligado no bolso.**
    Detetar proximidade e suspender renderização não essencial.

---

## 5. Aquisições visuais aprovadas

| Fonte | O que entra | Onde |
|---|---|---|
| Raylight | *arc-free* — trajetória reta entre dois pontos | Regra global de movimento |
| Raylight | *rack focus* — blur mensurável no fundo, não só escurecer | `surface.present` |
| Raylight | vocabulário deliberadamente pobre (2 primitivas de entrada) | Todo o sistema |
| GSAP | timelines em vez de animações soltas | `ring.fill` — anel e número nunca dessincronizam |
| GSAP | `steps()` para cronómetros | `rest.deplete` |
| GSAP | `DrawSVG` / `stroke-dasharray`, `Flip` para continuidade de layout | Gráficos, expansão de cartão |
| rebrand.gallery | `.webm` em loop como unidade de catálogo de movimento | Documentação do design system |
| rebrand.gallery | reveal = tensão curta → resolução exata → **repouso absoluto** | `ring.fill` |
| gradientlab | **dot matrix** como material de instrumento | Grelha de fundo estática, ciano 4% |
| gradientlab | HSV para rampas de intensidade (evita cinzentos lamacentos entre volt e ciano) | Zonas de FC |
| fontpair | validar tipografia com dados reais (`142.5 kg`, `00:47:32`), nunca lorem ipsum | QA tipográfico |

### Rejeitado explicitamente
Bloom, film grain, vignette, motion blur, 3D tilt (Raylight) · `elastic`, `bounce`,
`rough`, `Physics2D`, `Inertia`, `ScrollSmoother`, `ScrambleText` (GSAP) · transições
"virais" e "no keyframes" (autoae) · eixos de estilo Playful/Retro/Hand-drawn/Mascot
(rebrand.gallery) · mockups, ícones 3D, fontes *groovy*, gradientes de biblioteca
(unblast) · gradientes WebGL animados de fundo, holographic, iridescent, metallic,
aurora, warps (gradientlab).

**O caso do gradiente animado de fundo tem três razões independentes para sair, cada
uma suficiente:** *(a)* movimento contínuo que não comunica nada é ruído com custo de
atenção permanente; *(b)* não se garante WCAG contra um fundo que muda de frame a
frame; *(c)* um shader WebGL num ecrã de treino aberto 60 minutos é dos piores
padrões de consumo possíveis — e é precisamente o ecrã que o utilizador deixa ligado
mais tempo.

---

## 6. Tipografia — regras que saem desta análise

- Três famílias com papéis rígidos, e não mais: **Syne** (display), **Plus Jakarta
  Sans** (corpo), **JetBrains Mono** (métricas).
- **O mono nunca aparece em prosa. A Syne nunca aparece abaixo de ~20px** — em corpo
  pequeno sobre `#070B14` as contraformas fecham.
- `tabular-nums` obrigatório em qualquer número que mude.
- *[a testar no dispositivo]* Sobre obsidiana o peso ótico aumenta: o corpo
  provavelmente precisa de descer um grau (500 → 400) e de +2 a +4% de
  `letter-spacing` em texto pequeno.

---

## Proveniência

**Observado nas fontes:** o `power1.out` e o defeito de 0.5s da GSAP; as famílias de
ease e a lista de plugins; o `stagger: 0.1` canónico; o "arc-free" e o vocabulário
"Fade ou Typewriter" do Raylight; os nove tipos de gradiente e os efeitos
dot-matrix/ASCII do gradientlab; a taxonomia Formato/Indústria/Estilo e os thumbnails
`.webm` do rebrand.gallery; o modelo de licenciamento e a curadoria do unblast.

**Inferência e proposta:** toda a escada de durações, todos os valores de
`cubic-bezier` acima, os oito padrões nomeados, o valor de stagger de 28 ms, e as
regras de AOD/bateria. Nenhuma destas fontes publica uma escada de durações.

**Não foi possível ler:** animos.app (corpo renderizado por JS, só metadados) e
fontpair.co (idem). Nada foi inventado a partir de meta tags. Se estas duas
referências importarem, têm de ser vistas com browser, não com fetch.
