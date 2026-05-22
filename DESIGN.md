# FitConnect — Design System (Voltline)

**Versão:** 1.0 · Mai 2026  
**Stack:** Next.js 14 · Tailwind · Framer Motion · GSAP · Lenis  
**Prod:** https://fitconnect-phi.vercel.app

Este documento é a referência visual e de implementação para `apps/web` e packages partilhados. Para contexto de produto e roadmap, ver `CLAUDE.md`.

---

## 1. Filosofia

FitConnect combina **precisão científica** (HRV, readiness, wearables) com **energia cinética** (treino, performance, coaches verificados). A identidade **Voltline** traduz isso em:

- **Obsidian + Carbon** — fundos profundos, camadas de profundidade, zero “SaaS template branco”.
- **Volt elétrico** — acção, CTA, dados positivos, identidade athlete.
- **Connect teal** — confiança, links, integrações, fluxos secundários.
- **Editorial cinematográfico** — landing inspirada em referências tipo [landonorris.com](https://landonorris.com/): tipografia monumental, filmstrips, section breaks, zero cards genéricos.

**Regra de ouro:** cada ecrã deve parecer **bespoke**, não um tema comprado. Preferir layout editorial, glass surfaces e motion intencional a grids de feature cards.

---

## 2. Princípios

| Princípio | Significado |
|-----------|-------------|
| **Tokens first** | Cores, spacing e motion vêm de CSS vars / Tailwind — nunca hex solto em componentes novos. |
| **Motion with purpose** | GSAP + ScrollTrigger para narrativa de scroll; Framer Motion para hover/modal; Lenis para smooth scroll. |
| **Mobile-first** | `clamp()` para type hero; touch scroll nos reels; pill nav compacta em `< md`. |
| **Reduced motion** | `prefers-reduced-motion` e `html[data-motion="reduced"]` desactivam animações não essenciais. |
| **i18n by default** | Copy de marketing em `landingEditorial` / locales — não hardcode PT sem wrapper. |
| **Performance budget** | LCP ≤ 3.7s · Lighthouse mobile perf ≥ 84 · hero landing usa imagem, não vídeo pesado por defeito. |

---

## 3. Paleta de cores

### 3.1 Ficheiros fonte

| Ficheiro | Scope |
|----------|--------|
| `apps/web/app/voltline.css` | Tokens runtime web (ink, volt, glass, motion) |
| `apps/web/app/globals.css` | Aliases legacy, utilitários, logo, intro splash |
| `packages/design-tokens/tokens.css` | Tokens partilhados monorepo (`--fc-*`) |
| `packages/design-tokens/motion.ts` | Durações/easing TS (web + mobile) |

### 3.2 Cores principais

```css
/* Fundo base */
--ink-950: #090402;
--ink-900 … --ink-600   /* escala carbon */

/* Identidade Volt */
--volt-500: #bfee16;     /* primária — CTAs, accents athlete */
--volt-400: #c9f622;
--volt-300: #d4ff4d;
--volt-glow: rgba(191, 238, 22, 0.45);

/* Connect / confiança */
--connect-500: #00ddb4;

/* Semânticas */
--crimson-500: #ff3a5c;  /* alertas, strain alto */
--amber-400: #ffb020;     /* âmbar readiness */
--emerald-500: #00e090;   /* verde / ok */
--cyan-500: #00bfff;      /* dados live / plasma */
```

**Aliases legacy** (ainda válidos em código antigo):

```css
--accent: #c8ff00;
--brand: #00ddb4;
```

Usar preferencialmente **`volt-*`**, **`connect-*`**, **`ink-*`** via Tailwind (`text-volt-500`, `bg-ink-950`, `border-glass-border`).

### 3.3 Glass surfaces

```css
--glass-md: rgba(255,255,255,.06);
--glass-border: rgba(255,255,255,.05);
--glass-edge: rgba(200,255,0,.30);
--glass-ink: rgba(7, 8, 11, 0.72);
```

Padrão de card premium: `border-glass-border bg-glass-md backdrop-blur-glass` + highlight top (`via-white/20`).

### 3.4 Roles visuais

| Role | Cor dominante | Uso |
|------|---------------|-----|
| **Athlete OS** | `volt-500` | Readiness, streaks, CTAs primários |
| **Coach OS** | `volt` + lime accent | Roster, earnings, plantel |
| **Marketing / Landing** | Volt + ink editorial | Headlines, section breaks, stats |
| **Trust / Integrations** | Connect + logos monocromáticos | Strava, Garmin, Whoop, Oura |

---

## 4. Tipografia

### 4.1 Famílias (`apps/web/app/layout.tsx`)

| Token | Fonte | Uso |
|-------|-------|-----|
| `--font-sans` | **Plus Jakarta Sans** (400–700) | Body, UI, parágrafos |
| `--font-display` | **Syne** (600–800) | Headlines, hero, section breaks |
| `font-mono` | System monospace | Eyebrows, stats, labels técnicos |

```tsx
className="font-display text-[clamp(2.25rem,11vw,8.75rem)] font-extrabold tracking-[-0.05em]"
className="font-sans text-base text-ink-300"
className="font-mono text-[10px] uppercase tracking-[0.28em] text-volt-500"
```

### 4.2 Escala editorial (landing)

| Elemento | Spec |
|----------|------|
| Hero headline | `clamp(36px, 11vw, 140px)` · Syne 800 · `-0.05em` · line-height ~0.92 |
| Section break | `clamp(2.5rem, 10vw, 7.5rem)` · linha esquerda branca + direita `text-volt-500` |
| Eyebrow | `.eyebrow` — 10px · caps · tracking 0.22em · `volt-400` |
| Pull quote | `clamp(1.35rem, 3.2vw, 2.5rem)` · Syne semibold |
| Stat corner | Syne bold 2xl–4xl + label mono 9–10px caps |

### 4.3 Utilitários

- `.gradient-text` — gradiente volt em palavras de destaque (marketing legado).
- `.eyebrow` — label de secção padrão.

---

## 5. Espaçamento e layout

### 5.1 Tokens de spacing (`packages/design-tokens/tokens.css`)

```
--fc-space-1 … --fc-space-8
--fc-radius-sm … --fc-radius-xl
```

### 5.2 Shell classes

| Classe | Função |
|--------|--------|
| `.fc-page-root` | Root de página — `overflow-x: clip`, mobile safe |
| `.fc-section-x` | Padding horizontal com safe-area insets |
| `.landing-editorial` | Wrapper da landing redesign |

### 5.3 Breakpoints (Tailwind default)

- **Mobile:** 375px — nav pill só logo + CTA; filmstrip touch scroll.
- **Tablet:** `md:` — links nav pill visíveis.
- **Desktop:** `lg:` / `2xl:` — max-width containers (`max-w-7xl`).

---

## 6. Motion

### 6.1 Stack

| Ferramenta | Quando usar |
|------------|-------------|
| **Lenis** | Smooth scroll global (`LenisProvider` em `providers.tsx`) |
| **GSAP + ScrollTrigger** | Hero stagger, section breaks, scroll reveals (`use-gsap-reveal.ts`) |
| **Framer Motion** | Hover cards, modais, micro-interacções de componente |

Registo GSAP: `apps/web/lib/motion/gsap-register.ts` (client-only, once).

### 6.2 Durações (`motion.ts` / CSS)

| Token | Valor | Uso |
|-------|-------|-----|
| `--fc-motion-micro` | 150ms | Hover, toggle |
| `--fc-motion-ui` | 220ms | Panels, tabs |
| `--fc-motion-screen` | 400ms | Entrada de secção |
| `--fc-motion-data` | 1200ms | Pulso readiness / live metrics |

Easing: `--fc-ease-kinetic` · `cubic-bezier(0.16, 1, 0.3, 1)`.

### 6.3 Reduced motion

- Hero gate: saltado se `prefers-reduced-motion: reduce`.
- `AppIntroSplash`: desactivado em `/` (landing tem `HeroGate` próprio).
- Animações GSAP: early return em hooks quando reduced.
- CSS: `html[data-motion="reduced"]` desactiva `.fc-logo-pulse`, marquees, etc.

---

## 7. Componentes

### 7.1 Camadas

```
apps/web/components/
├── landing/          ← Landing editorial (Lando-style)
├── ui-glass/         ← Design system UI (cards, rings, buttons)
├── brand/            ← Logo, lockup, intro splash
├── nav/              ← navbar-pill.tsx
├── marketing/        ← Secções legadas + science, download
└── dashboard/os/     ← Athlete OS / Coach OS surfaces
```

### 7.2 Landing editorial (`components/landing/`)

| Componente | Papel |
|------------|--------|
| `hero-gate.tsx` | Boot 1.8s — logo + barra volt + “INITIALIZING…” |
| `hero-cinematic.tsx` | Fullscreen hero — headline CONNECT/TRAIN/PERFORM + stats corners |
| `trust-editorial.tsx` | Números + logos wearables |
| `section-break.tsx` | Divisores gigantes (CONNECT / PERFORM) |
| `coach-reel.tsx` | Filmstrip horizontal drag + snap |
| `pull-quote.tsx` | Citações editoriais |
| `feature-manifesto.tsx` | Features em manifesto 2 colunas (não cards) |
| `final-cta.tsx` | CTA fullscreen aurora volt |
| `landing-shell.tsx` | Orquestra gate + nav pill + canvas |
| `landing-page-content.tsx` | Assembly + i18n |

Copy: `Dict.landingEditorial` em `apps/web/lib/i18n/locales/*.ts`.

### 7.3 UI Glass (`components/ui-glass/`)

| Componente | Uso |
|------------|-----|
| `premium-system.tsx` | `PremiumCard`, `PremiumMetric`, tones volt/brand/signal |
| `glass-card.tsx` | Superfície glass base |
| `volt-button.tsx` | Botão primário volt |
| `readiness-ring.tsx` | Anel readiness (hero mode disponível) |
| `pill.tsx` | Badges compactos |
| `nivis-panel.tsx` | Painéis cinematográficos legado |

Tones de card: `neutral` · `brand` · `volt` · `plasma` · `signal`.

### 7.4 Brand

| Asset | Path |
|-------|------|
| Logo SVG master (sombra universal) | `/brand/fitconnect-logo.svg` |
| Logo SVG mark (transparente, nav/icons) | `/brand/fitconnect-logo-mark.svg` |
| Logo oficial PNG (nav, app) | `/brand/fitconnect-logo.png` |
| Master PNG (sombra + halo) | `/brand/fitconnect-logo-master.png` |
| Tamanhos export | `fitconnect-logo-{192,256,512,1024}.png` |
| Favicon | `/favicon.svg` (crop do mark) |
| Fontes originais | `brand-sources/` (SVG, HTML variants, PNG, WebP) |
| Intro vídeo | `/fitconnect-intro.mp4` (~36MB — usar com lazy/defer) |
| Hero vídeo legado | `/hero-training.mp4` |

**Paleta do mark:** anel `#A3D400 → #C8FF00 → #39FF14 → #00D4FF` (Voltline Master + Connect cyan). ECG e crosshair em cyan; F branco com accent volt na barra média.

Regenerar PNGs: `node scripts/export-brand-logo.mjs`

Componentes: `BrandLogo`, `BrandLockup`, `Wordmark` — ver `components/brand/`.

Classes logo: `.fc-logo-mark`, `.fc-logo-elevated`, `.fc-logo-pulse`.

### 7.5 Navbar

- **Landing:** `NavbarPill` — fixed, `top: 20px`, pill `bg-ink-950/85 backdrop-blur`, aparece após 80px scroll.
- **Resto do site:** `Nav` clássico sticky (`components/nav.tsx`).

---

## 8. Padrões de implementação

### 8.1 Cores — correcto vs errado

```tsx
// ✅ Correcto
className="text-volt-500 bg-ink-950 border-glass-border"
style={{ color: "var(--volt-500)" }}

// ❌ Errado
style={{ color: "#C8FF00" }}
className="text-[#bfee16]"
```

### 8.2 Imagens

- Sempre `next/image` com `sizes` apropriado.
- `priority` só above-the-fold (hero gate logo, hero bg).
- Unsplash permitido (`images.unsplash.com` em `next.config.mjs`).

### 8.3 Client vs Server

- `'use client'` apenas para GSAP, Lenis, drag, scroll listeners.
- Secções estáticas permanecem Server Components quando possível.

### 8.4 i18n

```tsx
const { landingEditorial } = useLocale();
// ou
const t = useT();
```

Chaves novas de marketing → actualizar `apps/web/lib/i18n/types.ts` + 6 locales (`en`, `pt`, `es`, `fr`, `de`, `it`).

---

## 9. Landing — fluxo da página

Ordem actual (`landing-page-content.tsx`):

1. Hero gate → Hero cinematic  
2. Trust editorial  
3. Section break · CONNECT / PERFORM  
4. Coach reel  
5. Pull quote (atleta)  
6. Section break · TRAIN / SMARTER  
7. Feature manifesto  
8. Pull quote (coach)  
9. Section break · TRACK / EVERY MOVE  
10. Science & tech (wearables — mantido)  
11. Section break · BOOK / YOUR COACH  
12. Final CTA  
13. Pricing · FAQ · Download  
14. Footer  

---

## 10. Dashboards (Athlete / Coach OS)

- **Hero readiness:** `readiness-hero-section.tsx` — ~42dvh, ring 168px, metric tiles.
- **Glass cards:** tone `volt` para athlete, mix volt/connect para coach.
- **Dados live:** animações `--fc-motion-data`; cores semânticas crimson/amber/emerald.
- **Mobile parity:** `MobileAppPreview`, `/mobile` launcher — alinhar visual com dock inferior.

---

## 11. Acessibilidade

- Focus visible: ring `var(--ring-color)` em `globals.css`.
- Contraste alto: `html[data-contrast="high"]`.
- Skip link: `SkipLink` no layout.
- Filmstrip: `aria-labelledby` + hint de drag; cards são links.
- Gate / splash: `aria-hidden` (decorative boot).

---

## 12. Performance

| Métrica | Target |
|---------|--------|
| LCP | ≤ 3.7s |
| Lighthouse mobile perf | ≥ 84 |
| Lighthouse a11y | ≥ 90 |
| CLS | ≤ 0.05 |
| TBT | ≤ 20ms |

Práticas:

- Landing hero: **imagem** Unsplash, não autoplay vídeo.
- Secções below-fold: `LazyInView` + `dynamic()`.
- Vídeos marketing: poster-first, `preload="none"`, defer (`cinematic-background.tsx`).
- GSAP: registar plugins uma vez; evitar timelines duplicadas.

---

## 13. Referências visuais

| Referência | O que adoptar |
|------------|----------------|
| [landonorris.com](https://landonorris.com/) | Hero gate, type monumental, filmstrip, section breaks, pill nav |
| Nivis / Awwwards | Lime `#bfee16`, void `#090402`, glass borders |
| Dribbble sports dashboards | Density de dados, rings, bento — adaptar a Voltline |

---

## 14. Checklist para novos ecrãs

- [ ] Cores via tokens Tailwind / CSS vars  
- [ ] Syne headlines + Jakarta body  
- [ ] Mobile-first + `overflow-x: clip`  
- [ ] Reduced motion respeitado  
- [ ] Copy via i18n  
- [ ] `next/image` para media  
- [ ] Sem feature-card grid genérico em marketing  
- [ ] Typecheck + testes UI glass se tocado  

---

## 15. Mapa rápido de ficheiros

```
apps/web/
├── app/
│   ├── layout.tsx          # Fonts Syne + Jakarta
│   ├── page.tsx            # Landing server shell
│   ├── globals.css         # Utilitários + logo motion
│   └── voltline.css        # Design tokens runtime
├── components/
│   ├── landing/            # Landing editorial
│   ├── ui-glass/           # Component library
│   ├── brand/              # Logo system
│   └── nav/navbar-pill.tsx
├── hooks/use-gsap-reveal.ts
└── lib/
    ├── motion/             # Lenis + GSAP register
    ├── landing/            # coach-reel-data.ts
    └── i18n/               # locales + types

packages/design-tokens/
├── tokens.css
├── motion.ts
└── index.ts
```

---

*Maintainers: actualizar este ficheiro quando tokens, landing sections ou brand assets mudarem.*
