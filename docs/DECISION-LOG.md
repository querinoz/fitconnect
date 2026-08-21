# Decision log — Elite OS v5

One line each. Newest first.

| Date | Decision |
|---|---|
| 2026-08-20 | Athlete IA: 4 destinations (Hoje · Análise · Conquistas · Perfil) + Treinar FAB. Supersedes 5-tab HOME/DISCOVER/ACTIVITY/COMMUNITY/PROFILE. Social is not a peer tab. `AGENTS.md` §6. |
| 2026-08-18 | Removed HTML landing mockup (`docs/mockups/landing.html`). Production Next.js `/` is the only landing. |
| 2026-08-18 | Dashboards HTML ported to `/insights` (not replacing the 5-item EliteAppShell). SessionOwnership lives in `:shared` + TS mirror; Transfer = offer+ACK, never a second START. |
| 2026-08-18 | MEGA PROMPT v5 this session: audit + ADR-001/002 + HTML mockups only. No Gradle, no emulator, no APK, no production landing rewrite. |
| 2026-08-18 | Snapshot commit already exists (`a913959`). Did not create a second snapshot; working tree was clean except untracked skills/QA XML. |
| 2026-08-18 | ADR-001: keep Next.js web + Compose phone + Wear companion. Reject Compose Wasm. §16.7 rewrite stop **not** triggered. |
| 2026-08-18 | ADR-002: four channels; LWW `updatedAt`+`deviceId`; exclusive session owner; Data Layer ≠ cloud. |
| 2026-08-18 | Companion files `ELITE_OS_VISUAL_SPEC.md` and `ELITE_OS_MOTION_BACKGROUND_WIDGET.md` are absent. Canonical lock = `ELITE_OS_HANDOFF.md` + `packages/design-tokens`. If they appear and conflict, stop. |
| 2026-08-18 | Mockups are `docs/mockups/*.html` (persistent), not new Next routes. Landing shots = real `docs/qa/*.png` only. No testimonials. |
| 2026-08-18 | Dashboard charts in the maquette are **LOCAL_DEMO** series, not production physiology. |
| 2026-08-18 | Do not install 30+ third-party GitHub skills. FitConnect skills: elite-surface, elite-os-multiplatform, elite-os-html-mockups, android-emulator, android-accessibility, sports-metrics, impeccable, design-taste, emil-design-eng, ui-ux-pro-max. |
| 2026-08-18 | Cursor MCP catalog in this workspace: `cursor-app-control` + `cursor-ide-browser` only. Vercel/Supabase/Sentry/Figma connectors from Claude are **not** wired here. |
| 2026-08-17 | Paleta canónica kept (`#070B14` / `#C8FF00`). Honeycomb Off\|Subtle only. Coach OS out of Athlete chrome. |

## 2026-08-18 — Sessão Cowork (dashboards, tokens de gráfico, posse de sessão)

- ADR-010 e ADR-011 numerados a partir de 010, não 001/002 como pedia o MEGA PROMPT: ADR-001 a 009 já existem e renumerar ADRs aceites é pior que a divergência de nome.
- Séries de gráfico deixam de usar as hues canónicas a brilho pleno: reprovam a banda de lightness OKLCH do modo escuro, e connect vs telemetry medem ΔE 11,7 para visão normal (piso 15). Novos tokens `chartSeries1..4` mantêm a hue, dessaturada. Validado 5/5.
- `chartInk` (56%) criado para texto dentro de gráficos: `onSurfaceFaint` (28%) mede 2,16:1 e reprova WCAG AA como texto.
- `CHART_TOKENS.heartRate` mantém `alert` de propósito — é leitura de estado com convenção de domínio, não uma série entre outras.
- `SessionOwnership` ganha `epoch` e liveness do dono. Escritas tardias são REJEITADAS, nunca fundidas: para dados de treino, recusar e avisar é melhor que fundir e mentir.
- `reclaimStale` é explícito e nunca automático — mover uma sessão viva em silêncio é como se criam sessões duplicadas.
- `--eos-ease-spring` (50% de overshoot) não foi removido apesar de não ter uso: §11.2 proíbe remoções irreversíveis com dúvida. Ficou com guarda documentada e marcado como candidato.
- Landing page **não tocada** a pedido explícito do dono. `docs/design/landing-page.html` permanece como estava.
