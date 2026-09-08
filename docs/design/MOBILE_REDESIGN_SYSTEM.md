# FitConnect Mobile Redesign System

**Surface:** Native Android Compose (`android/`) — production Elite OS  
**Expo `apps/mobile`:** Frozen Path A (ADR-005) — out of remake scope  
**Date:** 2026-09-08 (Zenith Path A)  
**iOS:** SwiftUI `iosApp/` (source-complete; Mac build EXTERNAL)  
**Reference:** Gym Mobile App UI Kit (density/hierarchy benchmark only — not brand clone)  
**Companion:** [MOBILE_DESIGN_SYSTEM.md](./MOBILE_DESIGN_SYSTEM.md)  
**Skills applied:** superpowers · interface-design · ui-ux-pro-max · mobile-design · android · impeccable · mobile-security-coder · multi-platform-apps · stitch (conceptual) · elite-surface · ios-developer · swiftui-* · elite-core-rust

---

## Design Principles

1. **Clarity > decoration** — every surface earns its place  
2. **FitConnect brand lock** — logo, Voltline `#C8FF00`, Iris `#6C63FF`, Telemetry `#3CD7FF`, Floor `#070B14`  
3. **Reference = density, not clone** — large rings, hero workout cards, quick access, bento metrics  
4. **Honeycomb = signature texture** — thin lines, low opacity; never wallpaper  
5. **Preserve Wave 3 function** — offline, DM, earnings, LTHR, realtime, bookings  

---

## Brand Rules

| Keep | Never |
|------|-------|
| FitConnect wordmark / hex logo | New logo / generic fitness marks |
| `--eos-*` / `EliteSurfaceColors` | Reference purple as primary, green-only fitness kits |
| Syne / Plus Jakarta / JetBrains Mono usage | Inter/Roboto as display identity |
| Neu-glass + honeycomb | Flat Material-only chrome |

---

## Color Usage

| Token | Hex | Role |
|-------|-----|------|
| Floor | `#070B14` | Layer 0 background |
| Voltline | `#C8FF00` | Primary CTA, active tab, week ring |
| Iris | `#6C63FF` | Secondary depth, quick-access, hero gradient |
| Telemetry | `#3CD7FF` | Live metrics, secondary numbers |
| Carbon | surface cards | Layer 1–2 |

---

## Typography

| Role | Style |
|------|-------|
| display / greeting | `headlineMedium` |
| section title | `titleMedium` / `titleLarge` |
| metric | `EliteMetricTextStyle` |
| label / sys | `EliteMonoTextStyle` / `EliteSysLabel` |
| body | `bodyMedium` / `bodyLarge` |

Metrics read as **numbers first** (`75%` then `WEEK`), not `Readiness: 75`.

---

## Surfaces / Depth

| Layer | Use |
|-------|-----|
| 0 | Floor + honeycomb atmosphere |
| 1 | Carbon / solid cards |
| 2 | Bento / metric |
| 3 | Glass floating nav / FAB |
| 4 | Sheets / overlays |
| 5 | Dialogs |

**Glass:** nav, badges, overlays (max 2 blurred glass layers / screen).  
**Neo:** readiness controls, interactive wells — selective.  
**Bento:** dashboards / command KPIs.

---

## Honeycomb System

| Primitive | Path |
|-----------|------|
| Mesh math | `design-ui/.../atmosphere/HoneycombMesh.kt` |
| Background | `HoneycombBackground.kt` / `HoneycombAtmosphere` |
| Overlay | `atmosphere/HoneycombOverlay.kt` |
| Divider | `components/HoneycombDivider.kt` |
| Hex metric / progress / badge | `components/HexMetric.kt` |
| Empty boost | `LocalHoneycombEmptyBoost` |
| Motion tokens | `motion/EliteMotionTokens.kt` (`fast`/`medium`/`slow` + spring.*) |
| Zenith header | `components/EliteZenithHeader.kt` |
| Empty boost | `LocalHoneycombEmptyBoost` |

---

## New Command Components (Phase B/D)

| Component | File | Purpose |
|-----------|------|---------|
| `EliteWeekProgressHero` | `ElitePerformanceCommand.kt` | Ring + twin metrics |
| `EliteQuickAccessRail` | same | Thumb-zone shortcuts |
| `EliteSessionHeroCard` | same | Workout hero + Voltline CTA |
| `HexMetric` / `HexStatus` | `HexMetric.kt` | Brand hex chip |

---

## Navigation

Athlete tabs (unchanged IA): **Home · Discover · Vault · Profile** + Train FAB.  
Coach tabs: **Overview · Athletes · Calendar · Inbox · More**.  
Active tab: Voltline indicator + soft Voltline wash (remake polish).

---

## Screen Inventory

See agent audit: **19 AthleteDest + 16 CoachDest**. Remake status tracked in `docs/qa/MOBILE_REDESIGN_QA.md`.

---

## Accessibility

- Touch ≥ 48dp (`Accessibility.MIN_TOUCH_TARGET_DP`)  
- Icon-only controls: `contentDescription`  
- `prefers-reduced-motion` / reduceMotion for rings  
- Contrast via on-role colors  

---

## Security

Remake is presentation-only. No token logging, no auth bypass, LOCAL_DEMO gated.

---

## Do / Don't

**Do:** Iris for secondary depth; Voltline for primary actions; honeycomb as hairline geometry.  
**Don't:** Clone reference photography, purple CTAs, nutrition screens that don't exist, Expo rewrite.
