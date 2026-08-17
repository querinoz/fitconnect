# Elite OS v2 — locked deviations

Handoff numbers from the visual spec apply **through `packages/design-tokens`**, not a Kotlin `object EliteColor { Color(0xFF…) }`.

| Spec text | Locked in this repo |
|---|---|
| Cyan `#3DE1FF` | Keep **`--eos-telemetry` `#3CD7FF`**. Do not fork the hue. |
| Honeycomb Off / Subtle / Full | User setting is **Off \| Subtle only**. Empty-state **16%** is a composition boost, not a Full toggle. |
| Grotesk unnamed | **Syne / Plus Jakarta Sans / JetBrains Mono** stay. Numerals use `tnum`. |
| Google Maps SDK | Athlete map is **`EliteRouteMap` Canvas polyline**. No Play Services Maps in this phase. |
| FGS + Glance widget | **Not in this pass.** Notification is the live minimized UI; widget after session service emits state. `setColorized` stays off. |
| Coach OS / Wear / Auth | Out of FASE 2 Athlete OS scope. |
| `TextFaint` / `NavIdle` | Fail AA — decorative only. Readable labels use `INSTRUMENT_MUTED` `#8A93A0`. Text on Volt = `ON_VOLT` `#0F1400`. |

Ring thickness is a **fraction of diameter D**. Glow is radial + wide-arc fallback (minSdk 26) — never silent-disable `RenderEffect`.

## Progression (patents / Hexatar / header)

| Spec text | Locked in this repo |
|---|---|
| Extra hues | **Progression + social + achievements only.** Metrics (HRV, strain, ring) stay Volt + telemetry cyan. |
| ATIVO cyan `#3DE1FF` | Uses **`--eos-telemetry` `#3CD7FF`**. |
| FORTE amber | Uses **`--eos-recovery` `#FFB020`**. |
| ELITE | Uses **Volt / OnVolt**. |
| `String.hashCode()` | **Forbidden.** Hexatar uses FNV-1a (`stableHash`). |
| Patent thresholds | **Proposals**, not calibrated. `PatentThresholds` is the swap point for remote config. **Never demote.** |
| Header streak | Ember **numeral**, no fire emoji (OEM-stable). Achievement tiles may use emoji **with a text label**. |
| Header on session | Hidden with the nav on live Activity and session detail. |
