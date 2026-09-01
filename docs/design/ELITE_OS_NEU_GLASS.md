# Elite OS Neu-Glass (Android athlete surfaces)

**Status:** Wave 7 Today (editorial) complete · waves 0–6 ENGINEERING COMPLETE · **Branch:** `feat/elite-os-v2` · **Date:** 2026-09-01

Canonical wave report (screenshots + commits): [android/docs/elite-os-neu-glass-wave6.md](../../android/docs/elite-os-neu-glass-wave6.md)

**Scope:** Android athlete surfaces — Today · Analysis · Achievements · Profile · Train FAB. Coach OS and web dashboards are **out of scope** for this wave.

**Production:** Neu-glass is a **LOCAL DEMO / engineering** visual pass. It does **not** change the global **PRODUCTION = NO-GO** verdict.

---

## Visual model

| Layer | Use | Primitive |
|-------|-----|-----------|
| **Neumorphic (anchored)** | Metrics, lists, wells, route cards, data panels | `EosNeumorphic`, `EosPremiumCard`, `EosPremiumWell` |
| **Glass (floating)** | Nav, FAB, badges, hero overlays | `EosGlassSurface`, `EosGlassBadge` |

### Rules (non-negotiable)

1. **Neumorphic = anchored data.** Glass = floating chrome only.
2. **Voltline `#C8FF00`:** one hero semantic meaning per screen (e.g. LEVEL on Profile, primary CTA on Today).
3. **Max 2 visible glass blur layers** per screen (bottom nav + FAB counts as two). Use `enableBlur = false` on nested glass when needed.
4. **Destructive actions:** plain text only — no glass or neumorphic chrome (`ProfileDestructiveAction`).
5. **Do not modify** unless fixing a real bug: `EosNeumorphic.kt`, `EliteReadinessNeumorphicCard.kt`, `AndroidFirebaseAuthGateway.kt`.

### Neumorphic tokens

| Token | Value |
|-------|-------|
| Surface | `#0D1321` |
| Radius | 20dp |
| Shadow | dual (light top-left, dark bottom-right) |

### Glass tokens

| Property | Range |
|----------|-------|
| Fill | `rgba(255,255,255,0.06–0.08)` |
| Border | `rgba(255,255,255,0.12–0.14)` |
| Blur | 10–16dp (budget ≤2 layers/screen) |

**Critical implementation note:** `EosGlassSurface` uses a **single-box** pattern. Sibling overlay layers block nav taps and broke P1 auth instrumentation — do not reintroduce stacked hit-test blockers.

---

## Chart palette

Source of truth: `packages/design-tokens/index.ts` + `semantic.ts` (`CHART_TOKENS`). Regenerate Kotlin:

```powershell
pnpm tokens:kotlin
pnpm tokens:kotlin:check   # recommended in CI on token changes
```

| Role | Token key | Hex |
|------|-----------|-----|
| Hero | `chartVoltline` | `#C8FF00` |
| Success | `chartSuccess` | `#7ED957` |
| Negative | `chartNegative` | `#E24B4A` |
| Secondary | `chartSecondary` | `#5B9BD1` |
| Muted | `chartMuted` | `#262F47` |
| Axis | `chartAxis` | `#5B6478` |
| Zone 1–5 | `chartZone1` … `chartZone5` | `#5B9BD1` … `#E24B4A` |

Compose helpers: `EliteChartPalette.kt`, `EliteAnalysisCharts.kt`, `EliteChartZoneStrip.kt`.

---

## Typography & responsive (wave 6)

| File | Purpose |
|------|---------|
| `android/design-ui/.../theme/EliteTypography.kt` | Full Material3 slot mapping → Syne / Plus Jakarta / JetBrains Mono |
| `android/design-ui/.../theme/EliteResponsive.kt` | Breakpoints (`EliteCompactWidthDp=400`, `EliteHeaderCompactWidthDp=420`) |

**Root cause fixed:** unmapped `headlineSmall` / `bodySmall` fell back to Roboto → metric overlap and misalignment.

**Responsive patterns:** header status pill hidden &lt;420dp; train monitor badges stack &lt;400dp; ellipsis on titles, labels, and glass badges.

---

## Wave delivery

| Wave | Commit | Surface |
|------|--------|---------|
| 0 | `4f6f3dd` | Tokens + `EosGlassSurface` |
| 1 | `f51428c` | Today |
| 2 | `a2d4b06` | Analysis |
| 3 | `19facaf` | Achievements |
| 4 | `83fb58d` | Profile |
| 5 | `ff04981` | Train / Activity |
| 6 | `93928e2` | Design catalog + typography/responsive |
| 7 | `d1113b6` | Today editorial — hero readiness · metric strip · session carousel |

### Wave 7 Today (editorial)

Dribbble-inspired density pass: **one hero readiness card**, **4-metric neumorphic strip** (HRV · Sleep · Steps · Load), **horizontal session carousel** with sparklines, **compact AI CTA**. Squad bento, world feed, duplicate ascend blocks, and verbose task lists removed from Today.

| Component | Path |
|-----------|------|
| Editorial header | `TodayEditorialHeader.kt` |
| Metric strip | `TodayMetricStrip.kt` |
| Session carousel | `TodaySessionCarousel.kt` |
| Session resolver | `TodaySessionResolver.kt` |
| Screen wiring | `HomeScreen.kt` |

### Screenshots

| Surface | File |
|---------|------|
| Today | `android/wave1-today-screenshot.png` |
| Analysis | `android/wave2-analysis-screenshot.png` |
| Achievements | `android/wave3-achievements-screenshot.png` |
| Profile | `android/wave4-profile-screenshot.png` |
| Train | `android/wave5-train-screenshot.png` |
| Today (wave 7 editorial) | `android/wave7-today-screenshot.png` |

---

## Key code paths

| Area | Path |
|------|------|
| Glass primitive | `android/design-ui/src/main/java/.../neumorphic/EosGlassSurface.kt` |
| Neumorphic core | `android/design-ui/src/main/java/.../neumorphic/EosNeumorphic.kt` |
| Design catalog | `android/design-ui/.../catalog/DesignSystemCatalog.kt` — section **Neu-glass (Elite OS 2026)** |
| Kotlin tokens | `android/design/.../EliteSurfaceTokens.kt` (generated) |
| CSS mirror | `apps/web/app/elite-os.css` |

---

## Verification (2026-09-01)

```powershell
cd android
.\gradlew.bat :design-ui:testDebugUnitTest :athlete:testDebugUnitTest :app:assembleDebug
$env:ANDROID_SERIAL='emulator-5554'
.\gradlew.bat :app:connectedDebugAndroidTest "-Pandroid.testInstrumentationRunnerArguments.class=com.fitconnect.android.auth.P1AuthSessionInstrumentationTest"
```

| Check | Result |
|-------|--------|
| design-ui + athlete unit tests | PASS |
| `assembleDebug` | PASS |
| P1 auth instrumentation | 1/1 PASS |
| Visual tour (5 surfaces) | PASS (emulator screenshots) |

**Not verified:** Coach neu-glass, web neu-glass parity, system font scale 130%+ on physical device, `pnpm tokens:kotlin:check` in CI.

---

## Related docs

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) — global token stack
- [FITCONNECT_SURFACE_SYSTEM.md](./FITCONNECT_SURFACE_SYSTEM.md) — surface ladder + neu-glass rules
- [03-ux-m3-expressive.md](../03-ux-m3-expressive.md) — athlete IA checklist
- [ADR-001](../adr/ADR-001-token-unification.md) — token unification
