# Zenith Mobile Visual DNA

Canonical contract for FitConnect Android (Compose). Evolve `android/design-ui` — do not fork a second system.

## Product north star

**Elite human performance OS** — cinematic, social, athletic, premium.  
Not a generic gym tracker. Not a clone of any reference app.

## Hierarchy (Athlete)

```
LOGO + GLOBAL ACTIONS
        ↓
STORIES
        ↓
LARGE MEDIA
        ↓
SOCIAL CONTEXT + ACTIONS
        ↓
MORE MEDIA
        ↓
SOFT CHROME  ·  TRAIN FAB
```

Telemetry lives in **Dashboard**; progression rings in **Ascend**; session energy in **Train**.

## Brand lock

| Role | Token | Hex |
|------|-------|-----|
| Floor | `--eos-floor` | `#070B14` |
| Accent / CTA | `--eos-voltline` | `#C8FF00` |
| Secondary focus | `--eos-iris` | `#6C63FF` |
| Live data | `--eos-telemetry` | `#3CD7FF` |

**Type:** Syne (display) · Plus Jakarta Sans (body) · JetBrains Mono (metrics / SYS.*)

**Mark:** White slashed **F** · Voltline ring + cardinal ticks · Voltline EKG pulse under ring.  
Vectors: `ic_fitconnect_logo` (splash tile) · `ic_fitconnect_mark` (chrome / Compose) · `docs/brand/fitconnect-mark.svg`.

## Spacing / radius (semantic)

Use `EliteSpace` / `EliteRadius` — no ad-hoc `17.dp` / `17.sp`.

| Token idea | Guidance |
|------------|----------|
| Story ring | 72dp outer, 2–2.5dp stroke, 3dp inset |
| Media radius | `EliteRadius.Media` |
| TRAIN FAB | 72dp, Voltline, primary action surface |
| Touch | ≥48dp; FAB intentionally 72dp |

## Media

- **Hero / splash:** multi-sport (run · ride · swim · climb · strength) — never gym-only as sole identity.
- **Feed cards:** media is the hero (≈320dp default height); facts as soft overlay, not metric dashboards.
- Decode to display size; Coil port when remote URLs land (`ImageLoader` interface).

## Motion (`EliteMotionTokens`)

| Class | Target |
|-------|--------|
| Press | 100–140ms (`FAST`) |
| Card / drawer | 220–280ms (`MEDIUM`) |
| Hero / splash | 350–500ms (`SLOW`) |
| Reduced motion | duration → 0 |

## Glass / performance

Optical glass: alpha + border + ≤2 blur layers. No stacked animated blurs on scroll media.

## IA lock

`Feed · Ascend · TRAIN · Dashboard · Profile` — unchanged.

## States (minimum)

Every interactive control: default · pressed · disabled · loading · error (where network).  
Stories: unseen · seen · active · (live optional).
