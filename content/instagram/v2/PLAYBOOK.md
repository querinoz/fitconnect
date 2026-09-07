# FitConnect Instagram Playbook v2 — @fitconnectsports

**Data:** 2026-08-28 · **Referências analisadas:** @theapplehub, @nike, @garmin, @garminpt, @strava (padrões apenas — sem marca Strava no conteúdo FitConnect)

---

## 1. O que os líderes fazem (padrão 2026)

| Conta | Padrão visual | Estratégia | Lição para FitConnect |
|-------|---------------|------------|------------------------|
| **@theapplehub** | Fundo escuro, produto hero, tipografia gigante, 1 ideia por frame | Reels curtos com hook nos 1ºs 2s; grid uniforme | Um acento por peça; produto como protagonista |
| **@nike** | Atleta real + copy mínima + CTA implícito | Emoção primeiro, produto segundo; sequência narrativa | Lifestyle fotográfico + frase que dói |
| **@garmin / @garminpt** | Dados no pulso, atleta em acção, UI legível | Feature → benefício → prova (mapa, FC, pace) | Mostrar relógio + telemóvel com UI real |
| **@strava** | Comunidade + movimento + métricas | Social proof + desafios | **Não replicar marca** — só ritmo de publicação |

### Mix de conteúdo (target)

| Formato | % | Função |
|---------|---|--------|
| Reels 9:16 | 40% | Descoberta, hook, emoção |
| Carrosséis 3:4 | 40% | Educação, conversão, swipe |
| Imagem única | 20% | Manifesto, CTA, bookmark |

---

## 2. Dimensões canónicas (2026)

| Uso | Pixels | Ratio | Notas |
|-----|--------|-------|-------|
| **Feed (default)** | **1080 × 1440** | 3:4 | Grid nativo — zero crop no perfil |
| Safe zone feed | 1012 × 1350 centrado | — | Texto/logo nunca nos 34px laterais |
| Reels | 1080 × 1920 | 9:16 | H.264 + AAC, ≤90s |
| Reel safe zone | y: 480–1440 | — | UI Instagram não tapa o hook |
| Capa reel (grid) | Centro do 9:16 | 3:4 crop | Título no centro vertical |
| Perfil | 320 × 320 | 1:1 | Logo centrada, 60% do círculo |

**Export:** PNG feed · MP4 reel CRF 18 · sem filtros Instagram

---

## 3. Estética FitConnect (EOS)

- Fundo `#070B14` · acento único `#C8FF00` · texto `#E8EDF4`
- Logo oficial (mark + wordmark) em **todas** as peças — watermark 22% opacidade + footer
- Fotografia real de atletas + mockups com **screenshots reais** do app (QA captures)
- Zero cyberpunk · zero pastel · zero segunda cor saturada
- Tipografia: display bold + mono para labels `SYS.*`

---

## 4. Narrativa do feed (scroll = timeline)

Ordem **v2_01 → v2_10** — o utilizador desce e acompanha:

```
01 REEL   Gancho      "Treinas. Registas. Recomeças."
02 CAR    Problema    4 apps que não falam entre si
03 IMG    Solução     Um sistema. Uma progressão.
04 REEL   Produto     App no bolso — demo real
05 CAR    Features    5 ecrãs que importam
06 REEL   Wear        Pulso + telemóvel sincronizados
07 IMG    Coach       Treinador com dados, não adivinha
08 CAR    Confiança   Build in public (honesto)
09 REEL   CTA         Lista de espera — link na bio
10 IMG    Manifesto   Connect. Train. Perform.
```

---

## 5. Reels — craft (além de zoom)

Cada reel v2 usa **3 actos** (4s + 4s + 4s = 12s):

1. **Impact** — flash + scale punch + hook text
2. **Proof** — pan lateral + screenshot/app ou atleta
3. **Resolve** — logo reveal + CTA text

Áudio: faixa energética royalty-free mixada a -8 LUFS, fade in/out 0.3s.

---

## 6. Guardrails (não negociáveis)

- `PRODUCTION = NO-GO` — nunca "app disponível" ou "descarrega já"
- Sem marca Strava em posts
- Sem testemunhos inventados
- PT europeu · tratamento por **tu**
- Wear OS = **preview** até go-live
- CTA único: lista de espera / link na bio

---

## 7. Perfil canónico

| Campo | Valor |
|-------|-------|
| Nome | `FitConnect \| Treino Gamificado` |
| Bio | `O sistema de performance para atletas e treinadores.` / `Connect. Train. Perform.` / `↓ fitconnect-phi.vercel.app` |
| Foto | `v2/profile/fitconnect-profile-320.png` |
| Link | https://fitconnect-phi.vercel.app |
| Email | fitconnectsports@gmail.com |

---

## 8. Comandos

```powershell
pnpm instagram:profile-asset      # foto perfil 320px
pnpm instagram:build-v2           # todas as imagens v2
pnpm instagram:reels-v2           # reels com efeitos + áudio
pnpm instagram:verify-v2          # checklist antes de publicar
pnpm instagram:publish-v2         # só depois de verify PASS
```
