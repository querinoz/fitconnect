# Auditoria de acessibilidade — maquetes Elite OS

**Data:** 2026-08-18 · **Norma:** WCAG 2.1 AA
**Método:** medição no DOM real com Chromium headless, compondo alpha de toda a pilha de
fundos. Não estimado — cada rácio abaixo foi calculado sobre a cor efetivamente pintada.
**Ficheiros:** `docs/design/dashboards-web.html` · `docs/design/landing-page.html`

---

## Resultado

**Todo o texto visível passa AA em ambas as maquetes.** Nove falhas foram encontradas e
corrigidas durante a auditoria.

## Achado que afeta o repositório, não só as maquetes

`--eos-on-surface-faint: rgba(228,225,238,.28)` mede **2,16:1** sobre `--eos-instrument-face`.

Isso reprova AA para texto (4,5:1) e reprova até o mínimo de 3:1 para elementos gráficos.
Estava a ser usado em rótulos de eixo, labels de mosaico, cabeçalhos de tabela e legendas
de escala — tudo texto.

**Correção aplicada nas maquetes:** token novo `--eos-chart-ink: rgba(228,225,238,.56)`,
medido em **≥4,5:1 em todas as superfícies** onde aparece, incluindo por cima de
`--eos-voltline-dim`. O `faint` fica reservado a separadores e ornamento — nunca texto.

**Recomendação para `apps/web/app/elite-os.css` e `packages/design-tokens`:** adotar a
mesma separação e auditar os usos existentes. Um token de texto que mede 2,16:1 é uma
falha de sistema, não de ecrã.

### Falhas corrigidas

| Onde | Antes | Depois |
|---|---|---|
| Rótulos de eixo dos gráficos (`.tick`, 9,5px) | 2,16:1 | ≥4,5:1 |
| Labels de mosaico de métrica | 2,16:1 | ≥4,5:1 |
| Cabeçalhos de tabela | 2,16:1 | ≥4,5:1 |
| Legenda da escala do rácio (`0,4` · `ZONA 0,8–1,3` · `2,0`) | 2,13:1 | ≥4,5:1 |
| `ELITE OS` na marca, atalhos `kbd`, rodapé lateral | 2,16:1 | ≥4,5:1 |
| Texto discreto da landing (notas de CTA, evidências, rodapé) | 2,16:1 | ≥4,5:1 |

### Falso positivo que quase gerou uma correção errada

A primeira passagem acusou 15 falhas adicionais — a marca `ACTIVITY` ativa, o indicador de
sessão, a caixa de honestidade da landing. Eram **erro do medidor**, que lia fundos `rgba`
translúcidos como opacos e comparava o texto contra ciano ou volt puros em vez da cor
composta. Corrigido o medidor, passam todos com folga.

Fica registado porque a lição é geral: **um medidor de contraste que não compõe alpha
produz correções que pioram o design.**

---

## Paleta de séries dos gráficos

Validada com `dataviz/scripts/validate_palette.js`:

```
node scripts/validate_palette.js "#00A2C4,#7EA200,#7F80FF,#C38400" \
     --mode dark --surface "#0A0E15"
```

| Verificação | Resultado |
|---|---|
| Banda de lightness (OKLCH L 0,48–0,67) | **PASS** — 4/4 dentro |
| Piso de croma (≥0,1) | **PASS** |
| Separação para daltonismo | **PASS** — pior par adjacente ΔE 20,3 (protan) · 8,1 (tritan) |
| Piso de visão normal | **PASS** — ΔE 21,3 |
| Contraste contra a superfície | **PASS** — 4/4 acima de 3:1 (medidos 5,92 a 6,49) |

**Nota de design:** as hues canónicas a brilho pleno (`#C8FF00`, `#3CD7FF`, `#FFB020`)
**reprovam** a banda de lightness quando usadas como séries — medem L 0,93 / 0,82 / 0,81
contra o teto de 0,67. Os tokens `--eos-chart-1..4` mantêm a **mesma hue** dessaturada
para a banda. Volt pleno fica reservado ao número herói e ao CTA, o que reforça a regra de
um só herói por ecrã.

---

## Outras verificações

| Item | Estado |
|---|---|
| Zero erros de JavaScript | ✅ 5 renderizações, 4 viewports |
| Conteúdo visível sem JavaScript | ✅ corrigido — a classe `js-anim` só é adicionada pelo script, portanto uma falha de JS nunca esconde conteúdo |
| `prefers-reduced-motion` | ✅ respeitado, com fade de 100 ms em vez de duração 0 |
| Navegação por teclado | ✅ skip link, `:focus-visible` em volt, células de gráfico focáveis com `aria-label` descritivo, tabelas ordenáveis por teclado |
| Alternativa não-visual aos gráficos | ✅ vista de tabela comutável nos painéis de carga e progressão; `aria-label` de resumo em cada SVG |
| Cor nunca sozinha | ✅ estado do rácio traz ícone + texto; origem dos dados traz emoji + palavra |
| Alvos de toque ≥44px | ✅ botões, separadores e `summary` do FAQ |
| Responsivo até 320px | ✅ sem scroll horizontal |
| Estados vazios | ✅ próprios por painel, com ação de recuperação |

## Por verificar

- **Leitor de ecrã a sério** (NVDA/VoiceOver). `aria-label` presente não é o mesmo que
  testado — o relatório anterior já cometeu esse erro com o TalkBack e não o repito.
- **Zoom de texto a 200%** nas duas maquetes.
- **Modo de contraste forçado** do Windows.
