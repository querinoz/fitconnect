# FitConnect — Conteúdo v3 (Ago 2026)

Gerado com `npm run instagram:generate` · conta [@fitconnectsports](https://www.instagram.com/fitconnectsports)

---

## 1. Mockups de app (novas funções)

| Ficheiro | Função | Legenda sugerida |
|----------|--------|------------------|
| `Mockups/mockup-09-community-feed.png` | Community Feed | PRs, check-ins e race day — o feed da tua comunidade. |
| `Mockups/mockup-10-ranks-leaderboard.png` | Ranks / Leaderboard | Sobe no ranking da tua modalidade. Top 5% esta semana? |
| `Mockups/mockup-11-athlete-profile.png` | Perfil atleta | Identidade multi-sport · readiness · streak · PRs. |
| `Mockups/mockup-12-coach-search.png` | Discover / busca coach | 12.418 coaches verificados. Match em 60s. |
| `Mockups/mockup-13-coach-roster.png` | Coach roster heatmap | O plantel do coach em tempo real. |
| `Mockups/mockup-14-inbox-nudge.png` | Inbox + nudges | Coach ↔ atleta. O plano muda quando o HRV muda. |

Carousel: `Carousels/09-app-features/` (6 slides)

---

## 2. Posts de features (feed)

`Posts/25-feature-community-feed.png` … `28-feature-coach-search.png`  
`Posts/29-…` … `34-…` (cópias dos mockups para publicação single)

---

## 3. Educativos v2

| Ficheiro | Tema |
|----------|------|
| `edu-08-training-zones.png` | 5 zonas de treino |
| `edu-09-periodization.png` | Periodização |
| `edu-10-coach-match.png` | Como escolher coach |
| `edu-11-load-management.png` | Acute/chronic load |
| `edu-12-morning-handshake.png` | Morning handshake |

Carousel: `Carousels/10-educational-v2/`

---

## 4. Abstratos / brand

| Ficheiro | Mensagem |
|----------|----------|
| `abstract-01-connect-train-perform.png` | Connect. Train. Perform. |
| `abstract-02-readiness-ring.png` | Readiness is the new PR |
| `abstract-03-signal-grid.png` | Signal over noise |
| `abstract-04-weekly-load.png` | Load up. Then recover. |
| `abstract-05-volt-pulse.png` | Your pulse. Their plan. |

Carousel: `Carousels/11-abstract-brand/`  
Também em `Posts/` e `Abstract/`

---

## 5. Reels animados (MP4 9:16 · ~6.5s)

Pasta: `Reels/Animated/`

| Reel | Frase | Sport |
|------|-------|-------|
| `reel-hero-01-runner.mp4` | Bad night? Lighter session. | Running |
| `reel-hero-02-strength.mp4` | O plano muda. O atleta sente. | Strength |
| `reel-hero-03-swim.mp4` | Measure. Then move. | Swimming |
| `reel-hero-04-cycle.mp4` | Consistency beats intensity. | Cycling |
| `reel-hero-05-stack.mp4` | Connect. Train. Perform. | Multi-sport |
| `reel-hero-06-recovery.mp4` | Rest is part of the work. | Recovery |

Covers PNG: `Reels/reel-hero-XX-*-cover.png`

### Como publicar Reels
1. Instagram app → Novo Reel → upload do `.mp4`
2. Cover = ficheiro `*-cover.png`
3. Áudio: trending sound ou silent + captions on-screen (já no vídeo)

### Legenda template Reel
```
POV: acordas, vês o readiness, o coach já ajustou o plano.

#FitConnect #ConnectTrainPerform #SportsTech #AthleteLife
```

---

## 6. Regenerar

```bash
npm run instagram:generate
# ou só uma parte:
node scripts/generate-instagram-content.mjs --only mockups
node scripts/generate-instagram-content.mjs --only posts
node scripts/generate-instagram-content.mjs --only reels
```
