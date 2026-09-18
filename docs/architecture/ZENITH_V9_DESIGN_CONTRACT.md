# Zenith V9 — Design Contract

**Branch:** `feat/zenith-v9-product-excellence`  
**Baseline tip:** V8.5 `48a43bd` (ancestor of frozen `c78c2fd`)  
**Authority:** FitConnect brand + Elite OS tokens win over generic UI recommendations.

## Brand (non-negotiable)

| Token | Value | Use |
|-------|-------|-----|
| Floor | `#070B14` | OLED background |
| Voltline | `#C8FF00` | Primary CTA / athlete peak |
| Iris | `#6C63FF` | Secondary focus |
| Telemetry | `#3CD7FF` | Live data |
| Connect | `#00DDB4` | Trust / sync |
| Performance | `#00E090` | Success |
| Recovery | `#FFB020` | Amber caution |
| Alert | `#FF3A5C` | Errors |

**Forbidden:** generic SaaS blue, random gradients, gaming/crypto looks, 21st/Componentry identity copy.

## Typography

- **Syne** — display / headlines  
- **Plus Jakarta Sans** — body / UI  
- **JetBrains Mono** — metrics, SYS.* labels  

Source: `packages/design-tokens/typography.ts` · `apps/web/app/elite-os.css`

## Spacing / radius / elevation / glass

Canonical: `packages/design-tokens/layout.ts` + `--eos-*` CSS.  
Compose: `android/design-ui/.../EliteSpace`, `EosGlassSurface`.

## Motion

`packages/design-tokens/motion.ts` — micro / ui / screen / data + kinetic easing.  
Reduced motion: `prefers-reduced-motion` + `data-motion="reduced"` + Compose reduced checks.  
Motion communicates state — never decoration-only.

## Interaction states (all interactive controls)

Every control must support where applicable:

`default · hover · focus-visible · pressed · disabled · loading · success · error`

Dead clicks are bugs. Decorative-only controls must be non-interactive or explicitly disabled.

## Navigation IA (athlete)

`Feed → Ascend → [TRAIN FAB] → Dashboard → Profile`  
Nutrition lives as a first-class destination under Dashboard / Profile deep-link `/nutrition` (V9).  
Social/squad inside Feed & Ascend — not a fifth dock tab.

## Data honesty vocabulary

`REAL · ESTIMATE · LOADING · MISSING · UNAVAILABLE · NOT_CONNECTED · ERROR · OFFLINE · QUEUED · SYNCING · SYNCED`

Never invent biometrics, food facts, or device metrics.

## Priority surfaces (V9)

1. Android TRAIN  
2. WearOS companion  
3. Athlete Dashboard TODAY  
4. Nutrition (real UI)  
5. Web app interactions  
6. Landing (preserve HeroEliteOs unless audited defect)

## Accessibility floor

- Touch targets ≥ 44×44 CSS px / 48dp  
- Keyboard + focus-visible  
- Contrast on Floor/Voltline pairs  
- Semantic structure + ARIA for custom controls  
- Reduced motion path required

## Component DONE definition

VISUAL + STRUCTURE + BEHAVIOR + DATA + STATE + INTERACTION + A11Y + RESPONSIVE + PERF + TEST
