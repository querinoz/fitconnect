# FitConnect Zenith — Mobile Polish Audit

**Scope:** Android Compose Path A (`android/`).  
**Not in scope:** archived Expo `apps/mobile` (ADR-005).  
**Date:** 2026-09-09  
**Baseline runtime:** Redmi Note 9S · `0.1.0-rc.1-logo` · vc14  
**Evidence:** `docs/qa/evidence/mobile-runtime/`

## Architecture lock (do not change)

```
ONE USER → ONE ACCOUNT → ONE SESSION → ENTITLEMENTS → CAPABILITIES → AVAILABLE MODES → ACTIVE MODE
```

Auth = identity only. Mode switch = Profile `ActiveExperienceSwitcher` only.

## Design system (preserve)

| Token | Value | Role |
|-------|-------|------|
| Floor | `#070B14` | Base |
| Voltline | `#C8FF00` | CTA / athlete |
| Telemetry | `#3CD7FF` | Live metrics |
| Iris | `#6C63FF` | Secondary accent |
| Connect | `#00DDB4` | Trust / telemetry secondary |

Typography: Syne · Plus Jakarta Sans · JetBrains Mono (`EliteTypography`).  
Spacing: `EliteSpace` (generated from `packages/design-tokens`).  
Brand mark: circular reticle + F + ECG (`EosFitConnectLockup` / `EosMarkGeometry`).

---

## Inventory summary

| Bucket | Count |
|--------|------:|
| Shell destinations | 7 |
| Athlete destinations | ~22 |
| Coach destinations | ~18 |
| Screen composables | ~39 |

Modules: `app`, `athlete`, `coach`, `design-ui`, `design`, `foundation`, + domain modules.

---

## Screen audit table

| Screen | Current State | Visual Issues | UX Issues | Interaction Issues | Consistency Issues | Priority | Fix | Status |
|--------|---------------|---------------|-----------|--------------------|--------------------|----------|-----|--------|
| Splash | Cinematic hero + lockup | Scrim polish residual | — | Long-press debug OK | EliteSpace CTA | P2 | Micro | Cycle 1 |
| Auth | ONE LOGIN | Minor `.dp` | OK | Keyboard TBD | Logo OK | P2 | Micro-spacing | Intact |
| Feed | Lockup + stories | Sidebar magic dp | Empty polished | Discovery sheet | — | P2 | Sidebar tokens | Cycle 1 |
| Ascend (Vault) | Cinematic header | Possible double header | — | — | Icons aligned TripOrigin | P2 | Header discipline | Cycle 3 icons |
| Dashboard (Home) | Hierarchy pass | — | Readiness insight | — | TelemetryInsight | P1 | Done | Cycle 2 |
| Profile (A) | CURRENT EXPERIENCE | Dual headers residual | Delete weak | Mode OK | — | P2 | EliteDialog wire | Cycle 1+ |
| Telemetry | Insight stack | — | — | — | DEMO badge | P1 | Done | Cycle 2 |
| Sports / Community | Lists | Mixed cards | — | CreatePost Elite sheet | — | P2 | Card family | Cycle 4 |
| Coach Feed | Inbox | — | — | — | Chrome = athlete dock | P1 | Done | Cycle 3 |
| Coach Overview | WHAT NOW | — | Priority CTA | — | CURRENT EXPERIENCE | P1 | Done | Cycle 2–3 |
| Map (Activity) | MapLibre | — | — | Spot sheet ready | Token colors | P2 | Done colors | Cycle 4 |
| Spot sheet | EliteBottomSheet | Unwired callers | — | — | DS aligned | P2 | Wire from map | Cycle 4 |

---

## Polish scores (critical screens, pre-cycle baseline)

Scale 0–10. Target ≥9 for critical.

| Screen | Visual | Type | Space | Color | Nav | Interact | Motion | A11y | Perf | Overall |
|--------|-------:|-----:|------:|------:|----:|---------:|-------:|-----:|-----:|--------:|
| Splash | 7.5 | 7 | 6.5 | 8 | — | 7 | 8 | 7 | 8 | **7.3** |
| Auth | 8 | 8 | 7.5 | 8.5 | — | 8 | 7 | 8 | 8 | **8.0** |
| Feed | 7 | 7 | 6.5 | 8 | 8 | 7 | 7 | 7 | 7 | **7.2** |
| Dashboard | 7 | 7 | 6 | 7.5 | 8 | 7 | 7 | 7 | 7 | **7.1** |
| Profile | 7 | 7.5 | 7 | 8 | 8 | 7.5 | 7 | 8 | 8 | **7.5** |
| Coach Overview | 7 | 7 | 7 | 7.5 | 7 | 7 | 7 | 7 | 7 | **7.1** |
| Mode switcher | 7.5 | 8 | 7.5 | 8 | — | 8 | 7 | 8.5 | 9 | **8.0** |

---

## Top systemic inconsistencies (remaining)

1. ~~Athlete vs Coach nav chrome~~ → **Cycle 3: shared EosPremium dock + rail**
2. Stacked headers residual on some secondary screens
3. Magic `.dp` — Feed sidebar 304/48; charts
4. Card dual system — `EliteCard` vs `EosPremiumCard` (intentional roles; keep documenting)
5. ~~Unused EliteBottomSheet / CreatePost raw M3~~ → **Cycle 4**
6. ~~Orphan SpotBottomSheet~~ → **EliteBottomSheet ready; map wire still open**
7. Error swallowing — Activity/Profile `Err → Unit`
8. ~~MapLibre hex~~ → **Cycle 4 tokens**
9. Physical visual matrix screenshots pending MIUI manual install

---

## Cycle plan (execution status)

| Cycle | Focus | Status |
|-------|-------|--------|
| **1** | Splash · Feed empty · Mode switcher | **DONE** vc15 |
| **2** | Headers · Dashboard hierarchy · Telemetry insight | **DONE** |
| **3** | Coach What Now · Nav chrome parity · mode clarity | **DONE** |
| **4** | Sheets/dialogs · Map tokens · cards | **DONE** |
| **5** | A11y · perf posture · evidence index · POLISH5 APK | **DONE** eng / visuals pending |

---

## Validated already (do not regress)

- ONE LOGIN (no Athlete/Coach at auth)
- Circular logo on Feed + Auth (vc14+)
- Cold launch → Feed
- No FATAL in sampled logcat (prior)
- TRAIN FAB overlap PASS (prior)
- Coach/Athlete dock parity (vc16)

## Explicit non-goals this phase

- Auth architecture changes
- Backend / Firebase / Supabase replacement
- New palette / new brand
- Expo revival
