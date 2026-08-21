# PHASE_16_BRAND_PARITY_AUDIT.md

**Date:** 2026-08-10  
**Mode:** Audit-first (pre-implementation)  
**STITCH_REFERENCE:** UNAVAILABLE (not authenticated / not inspected — no fabricated Stitch details)

## 1. Landing-page visual language

| Element | Source of truth | Value |
|---------|-----------------|--------|
| Floor | `apps/web/app/elite-os.css` `--eos-floor` | `#070b14` |
| Voltline | `--eos-voltline` | `#c8ff00` |
| Connect | `--eos-connect` | `#00ddb4` |
| Telemetry / Iris / Performance / Recovery / Alert | elite-os.css | `#3cd7ff` / `#6c63ff` / `#00e090` / `#ffb020` / `#ff3a5c` |
| Display | Syne 600–800 | `layout.tsx` next/font |
| Body | Plus Jakarta Sans 400–700 | |
| Mono | JetBrains Mono 400–700 | |
| Logo | `/brand/fitconnect-logo.png` + SVG marks | circular volt ring + F |
| Motion | GSAP cinematic + reduced-motion | boot gate ~1.4–1.8s when needed |
| Radius | EOS nested/control/card/pill | 12 / 18 / 24 / 9999 |

Package mirror: `packages/design-tokens` (`COLOR_TOKENS`).

## 2. Current Android visual language

| Element | Value | Alignment |
|---------|--------|-----------|
| FLOOR | `#070B14` (`EliteSurfaceTokens`) | **MATCH** landing |
| VOLTLINE / CONNECT | `#C8FF00` / `#00DDB4` | **MATCH** |
| Fonts | 3× Regular TTF in `:design-ui` | **PARTIAL** (no weight files) |
| Launcher | `@drawable/ic_fitconnect_logo` vector only | **GAP** — no adaptive/mipmap |
| Splash (system) | Theme.SplashScreen + vector icon | **PARTIAL** |
| Splash (Compose) | Text title + tagline, 300ms | **GAP** vs landing boot gate |
| Install HTML floor | `#090402` | **CONFLICT** vs landing `#070B14` |
| Floating pill nav | EliteFloatingNavBar | **KEEP** — brand language |
| Athlete/Coach hardcodes | none (`Color(0x`) | **GOOD** |

## 3. Differences (priority)

| ID | Gap | Severity |
|----|-----|----------|
| P16-ICON | No adaptive launcher / mipmap densitites | P0 |
| P16-SPLASH | Compose splash is text-only; not landing-like brand lockup | P0 |
| P16-FLOOR | Install page `#090402` vs app/landing `#070B14` | P1 |
| P16-FONT | Regular-only TTFs; synthetic bold | P1 |
| P16-LOGO | Vector approx mark ≠ official PNG/SVG ring+F | P0 |
| P16-FLICKER | Risk of unbranded handoff if theme/splash weak | P1 |
| P16-EMU | Emulator accel=6 / firmware VT-x off | BLOCKED infra |

## 4. Missing assets

- Adaptive icon foreground/background + mipmap-*  
- Official brand mark derived from `apps/web/public/brand/*`  
- Optional bold font files (defer if conversion heavy — synthetic OK short-term)

## 5–8. Conflicting tokens / typography / color / logo

- **Floor conflict:** install `#090402` → align to `#070B14` (landing wins).  
- **Typography:** families match; weights incomplete on Android.  
- **Colors:** Compose tokens match landing; XML missing `eos_connect`.  
- **Logo:** Android vector is geometric placeholder vs web ring+F PNG.

## 9–12. Icon / splash / nav / motion

- Icons: Compose Elite icons + Material icons mixed — REVIEW, don’t mass-replace.  
- Splash: need brand mark + Voltline glow + reduced-motion path.  
- Nav: floating pill KEEP; polish selected Volt only if needed.  
- Motion: EliteEnter exists; splash needs short branded sequence, no fake %.

## 13. Components requiring correction

SplashRoute, launcher resources, colors.xml, install-page.template.html, ic_fitconnect_logo / adaptive assets.  
EliteButton/Nav already token-led — verify only.

## 14–15. Delete / keep

| KEEP | DELETE | REVIEW |
|------|--------|--------|
| EliteSurfaceTokens, Elite* components, floating nav | — | EXPERIMENT_NEW_SPLASH flag |
| Web brand PNGs/SVGs as source | — | Wear default icon |
| Phase docs | nothing without proof | |

**No DELETE-safe brand assets identified.**

## 16. Implementation order

1. Align install floor → `#070B14`  
2. Import/adapt official logo → drawable + adaptive icon mipmaps  
3. Branded Compose splash + system splash sync  
4. colors.xml CONNECT  
5. Startup flicker check (theme floor)  
6. Tests + assembleDebug  
7. Emulator attempt (expect BLOCKED)  
8. Final report / exit gate  

## Emulator / Stitch

| Item | Status |
|------|--------|
| STITCH_REFERENCE | UNAVAILABLE |
| EMULATOR | BLOCKED (AEHD / firmware VT-x) |
| VISUAL_PARITY screenshots | UNVERIFIED until emulator/device |
