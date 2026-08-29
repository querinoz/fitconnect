# FitConnect — Design System & Branding

> **Canonical docs:** See [`docs/design/FITCONNECT_DESIGN_SYSTEM.md`](./design/FITCONNECT_DESIGN_SYSTEM.md) for the full Elite OS specification.

**Tagline (PT):** Liga. Treina. Perform.

---

## 1. Logomarca oficial (obrigatória)

A identidade visual do FitConnect usa **sempre** a logomarca oficial. Não usar ícones genéricos (ex.: halteres, dumbbells) como substituto.

### Logo completa (lockup)

**Ficheiro:** `public/brand/logo-full-official.png`

- **LogoMark** (hexágono + linha de pulso) à esquerda
- **Wordmark** `Fit` (branco) + `Connect` (verde volt) à direita
- Usar em headers, materiais de marketing, conteúdo Instagram, documentação

### LogoMark / Ícone sozinho

**Ficheiros:**
- `public/brand/logomark-official-256.png` — uso geral (apps, favicons, avatares)
- `public/brand/logomark-official-128.png` — tamanhos pequenos
- `public/brand/logomark-official-64.png` — favicon 32/64px
- `public/brand/logomark.svg` — vetor quando suportado

**Quando usar só o ícone:**
- Favicon e app icon
- Avatar em espaços reduzidos (dock, notificações)
- Watermark em mockups e stories
- Quando o wordmark competiria com outros elementos

**Não usar só o ícone quando:**
- Primeira impressão de marca (landing hero, README, press kit)
- Materiais onde o nome "FitConnect" precisa ser legível

### Regras

| ✅ Fazer | ❌ Não fazer |
|----------|-------------|
| Usar assets de `public/brand/` | Inventar gradientes ou ícones alternativos |
| Manter proporções originais | Distorcer ou rodar a marca |
| Fundo escuro (`#07080A`) preferencial | Colocar wordmark verde sobre verde |
| LogoMark + wordmark em contextos de marca | Substituir por ícones Lucide genéricos |

---

## 2. Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `volt` | `#C8FF00` | Accent principal, "Connect" no wordmark, CTAs |
| `ink` | `#090402` | Fundo principal (Deep Obsidian) |
| `cyan` | `#22d3ee` | Dados, HRV, tech |
| `white` | `#FAFBFC` | "Fit" no wordmark, texto principal |

---

## 3. Tipografia

| Papel | Fonte |
|-------|-------|
| Display / títulos | **Syne** Bold |
| Corpo | **Plus Jakarta Sans** Regular–Bold |
| Métricas | **JetBrains Mono** |

---

## 4. Voz (PT)

- **Especialista** — linguagem de quem treina a sério
- **Honesto** — dados, não hype
- **Calmo** — premium, estilo Nike: confiante, não barulhento

---

## 5. Conteúdo social

Todo o conteúdo gerado para @fitconnectsports deve:
1. Embutir a **LogoMark oficial** (base64 ou asset `public/brand/`)
2. Estar em **português**
3. Usar a tagline **Liga. Treina. Perform.**
4. Seguir publicação **estratégica** (mix de pilares — ver `POSTING-STRATEGY.md`)

```bash
npm run instagram:generate          # pack base
npm run instagram:publish:strategic # publicar com mix premium
```

---

*FitConnect · Liga. Treina. Perform.*
