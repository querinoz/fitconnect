# FitConnect Android — Visual Fidelity Audit

**Date:** 2026-08-17  
**Stitch project:** https://stitch.withgoogle.com/projects/14054299058988485854  
**Stitch access:** PARTIAL — canvas loaded in browser (`qa/reports/visual-fidelity/stitch/stitch-elite-os-canvas.png`). Individual Stitch frames are not isolated (canvas zoom, not per-screen export).  
**In-repo Stitch implementation:** `apps/web/components/mobile/stitch-native-primitives.tsx` (`athlete_cockpit_mobile_native`) + `stitch-screens.tsx`  
**Landing SoT:** `apps/web/app/elite-os.css` (`--eos-floor #070B14`, `--eos-voltline #C8FF00`, `--eos-connect #00DDB4`)  
**Android SoT:** generated `EliteSurfaceColors` + Compose screens  
**Baseline screenshots:** `qa/reports/screenshots/2026-08-17/`, `qa/reports/ascend/`, `qa/reports/wear/`  
**Fresh emulator pass:** pending at audit time (AVD `fitconnect_phone` starting; no device attached yet)

---

## Source-of-truth conflicts (resolved)

| Claim | Source | Decision |
| --- | --- | --- |
| Floor `#090402` | This rebuild prompt | **Do not fork.** Landing + generated tokens use `#070B14`. Landing↔mobile sameness is a hard success criterion. |
| Floor `#070B14` | `elite-os.css`, `EliteSurfaceColors.FLOOR` | **KEEP** as Obsidian page background. |
| Card `#111827` | Stitch `StitchBentoCard` | **KEEP** as `CARBON` for bento cells. |
| Volt `#c0f500` | Legacy Stitch primitives (hardcoded) | **Map to** `#C8FF00` (`VOLTLINE`). Do not reintroduce `#c0f500`. |
| Android dark page `#111827` | `EliteColorRoles.backgroundArgb` uses `CARBON` | **P0.** Page must be FLOOR; carbon is for instruments, not the OS chassis. |

Stitch canvas philosophy (from hosted project sidebar): **Obsidian base + Volt energy + F1-telemetry precision**. Athlete Cockpit vs Trainer Command Center. Floating-pill navigation. Prime Recovery as the home visual anchor.

---

## Repeatable fidelity checklist (used for scores)

Each screen scores 1 point per item (10 = 100%):

1. Obsidian floor (not lifted carbon / Material gray)
2. Volt used only for CTA / active / critical metrics
3. Syne display / Jakarta body / Mono metrics
4. Hairline carbon surfaces (not generic Material cards)
5. Instrument hierarchy (one visual anchor, not equal cards)
6. Floating pill nav + Volt selected glow
7. Technical labels (`SYS.*` / caps tracking)
8. LOCAL_DEMO labeled; no fake live GPS/HR
9. Landing wordmark / Volt CTA kinship
10. Motion fast + reduced-motion safe

**STITCH_VISUAL_MATCH** and **LANDING_MOBILE_VISUAL_MATCH** are averages of applicable screens. Audit baseline is estimated from screenshots + code — not claimed as a device PASS.

**Baseline estimate:** STITCH_VISUAL_MATCH ≈ **42%**. LANDING_MOBILE_VISUAL_MATCH ≈ **55%** (tokens exist; hierarchy and surfaces diverge).

---

## Inventory

| SCREEN | CURRENT STATE | STITCH REFERENCE | DIFFERENCES | SEVERITY | ACTION |
| --- | --- | --- | --- | --- | --- |
| BOOT / SPLASH | Brand mark + FitConnect + `SYS.MARK → INIT → TELEMETRY` on theme background. Short delay. | Elite OS initialization: FITCONNECT / ELITE OS / system cores | Background is Carbon not Floor. Init copy is one line, not a short core sequence. | P1 | Floor chassis + short core labels. Keep delay short. |
| LOADING / INIT | `EliteLoading` = Material circular indicator. Auth has a 3-beat intro. | Cinematic but short OS boot | Material spinner; no Volt ring. | P2 | Token spinner / skeleton already exist — use them. |
| AUTH / SIGN IN | Form-first: appearance picker, then LOCAL_DEMO personas. Logo is text. Screenshots: `auth/05-auth-dark-default.png`. | High-impact identity + photography overlay + wordmark | Looks like a settings sheet. Appearance is too high. No monumental wordmark. | P0 | Wordmark hero, Volt primary, appearance demoted. Keep personas. |
| SIGN UP | Same AuthScreen mode switch. | Same identity family | Inherits auth P0. | P0 | Same chrome as sign-in. |
| ROLE SELECTION | Two buttons, sys label. Functional. | Athlete OS vs Coach OS cinematic split | No visual OS identity; Material-ish buttons. | P1 | Wordmark + two OS cards (Athlete Volt / Coach Connect). |
| ATHLETE ONBOARDING | Multi-step exists (`onboarding/*.png`). | Stitch onboarding intelligence | Steps are card stacks; not cinematic. | P1 | Apply bento + wordmark; do not drop steps. |
| COACH ONBOARDING | Parallel flow. | Trainer command onboarding | Same as athlete. | P1 | Same primitives. |
| **ATHLETE HOME** | Greeting + LOCAL_DEMO + **ASCEND XP first** + Prime Recovery **inside a glass card** (148dp ring) + stacked ScoreBlocks. Screenshots: `athlete/04-home.png`, `ascend/02-home.png`. | Stitch Today: **256dp Prime ring as page hero**, `%` suffix, PRIMED in Volt, Peak Readiness, 2-col HRV + Day Strain bento, full-width Sleep, AI directive with Volt CTA, sparkles FAB, header `avatar \| FITCONNECT \| radio`. No XP as first instrument. | Hierarchy inverted. Ring too small, nested in a card, metrics listed vertically. Header is editorial greeting not wordmark. XP bar steals the first glance. | **P0** | Rebuild as Prime instrument cockpit. XP/missions remain, **below** recovery. |
| ATHLETE READINESS | Recovery screen exists; home duplicates a weaker ring. | Prime Recovery is the home instrument | Split across Home + Recovery without a single hero. | P1 | Home owns the hero; Recovery is the deep instrument. |
| PRIME RECOVERY | `EliteRecoveryRing` 148dp, no `%`, no Volt glow, label in muted gray. Arc color by score (green/volt/amber/alert). | Huge glass ring, Volt stroke + glow, mono score + `%`, Volt status label | Size, glow, typography, containment. | **P0** | Rebuild `ElitePrimeInstrument`. |
| ACTIVITY | Stacked metric cards; map only after route points exist; idle shows 00:00 + sensor copy. `sessions/01-activity.png`. | Performance cockpit: map + glowing route + live metrics overlay | Looks like a form of metrics. Map is secondary. | **P0** | Map-first cockpit; 3-col telemetry grid; LOCAL MAP always visible. |
| RUN | Sport chips on Activity. | Sport-specific cockpit | Same as Activity. | P1 | Keep sport chips; visual is Activity. |
| MAP | `EliteRouteMap` is a dark polyline canvas (good direction) but 220dp, buried. Discover shows a separate local map card. | Dark tactical map, glowing route, start/end, grid | Not page-defining. No always-on idle demo route. | P1 | Idle LOCAL_DEMO coastal route; taller map; grid + markers. |
| TELEMETRY | Device center screen exists. | F1 strip | Functional, not cinematic. | P2 | Apply bento metrics. |
| WORKOUT / SESSION | Training + session detail cards. | Stitch sessions: live badge, 3 metrics, load bars, Volt start | Card list, not live instrument. | P1 | Session live uses Activity cockpit. |
| SESSION LIVE | Activity RUNNING phase. | Overlay telemetry on map | Metrics still stacked cards. | P0 | Overlay grid. |
| SESSION COMPLETE | `PerformanceCompleteOverlay` (ASCEND). | Cinematic +250 XP | Exists; visual can be tighter. | P2 | Keep; Volt burst already. |
| DISCOVER | Filters + text `ElitePersonCard`. `discover/01-list.png`. | Performance marketplace: photo, verified, sport, rating, price, availability | Generic list rows. No cinematic coach card. | **P0** | `EliteMarketplaceCard`. |
| COACH PROFILE | Sheet/card in Discover. | Cinematic profile | Text-heavy. | P1 | Marketplace card + booking keep. |
| BOOKING | Booking sheet exists. | Confirmation as premium receipt | Functional. | P2 | Receipt chrome. |
| PROGRAMS | List/cards. | Editorial program tiles | Generic. | P2 | Bento tiles. |
| COMMUNITY | Feed. `community/01-feed.png`. | Squads as teams | Social feed, not Squad OS. Squad OS engine not built (prompt-only). | P1 | Squad identity card on Home + Community header. Do **not** invent a second XP universe. |
| SQUADS / SQUAD DETAIL / LIVE | Not a first-class athlete tab. Coach has LIVE SQUAD card (honest pairing). | Team score, live dot, weekly distance | Missing athlete Squad OS. | P1 | Visual stub from existing community/coach live card. Full Squad OS is a later phase. |
| GAMIFICATION / BADGES / LEVELS | Vault + ASCEND XP bar on Home first. `ascend/03-vault.png`. | Elite progression, not a game; recovery remains the home anchor | XP is visually louder than recovery. | P0 (hierarchy) / P2 (vault craft) | Compact XP **under** Prime. Vault stays. |
| PROFILE | Standard settings-ish profile. | Identity + progression | Acceptable structure. | P2 | Wordmark kinship. |
| SETTINGS | Functional. | Quiet OS settings | OK. | P3 | Token pass only. |
| NOTIFICATIONS | List. | Signal feed | Generic. | P2 | Sys labels. |
| OFFLINE | Banner + OFFLINE badge. | Honest offline | Good. | P3 | Keep. |
| ERROR / EMPTY / LOADING | `EliteErrorView` / `EliteEmptyState` / `EliteLoading`. | Branded empty | Copy is fine; spinner is Material. | P2 | Volt track. |
| **COACH HOME / COMMAND** | Greeting + live squad + ascend + AI brief + KPI cards + heatmap list. | Trainer Command Center: WHO IS READY / AT RISK / TRAINING / NEEDS ATTENTION as F1 board | Stacked dashboard, not a command strip. | **P0** | Readiness command strip + live/risk columns. |
| ATHLETE ROSTER / DETAIL | Person cards. | Telemetry roster | Text rows. | P1 | Recovery pip + status. |
| ANALYTICS / LOAD / BOOKINGS / PROGRAM BUILDER | Exist as lists. | Command tools | Functional. | P2 | Bento. |
| COACH PROFILE | Settings-adjacent. | — | OK. | P3 | — |
| WATCH HOME / READINESS / LIVE / TELEMETRY | Wear instrument panes; FLOOR already. `qa/reports/wear/`. | Watch OS in same family | Closer than phone home. Pairing UNVERIFIED. | P2 | Keep honesty labels. |
| BOTTOM NAV | Floating pill exists. Selected = Volt **fill behind whole tab**. Material filled icons. | Pill + Volt **glow on icon**, minimal technical icons | Too much fill; Material icon set. | P1 | Glow selected; quieter idle. |
| BUTTONS | Material3 Button / Tonal / Text. Loading = `…`. No success/error/pressed craft. | Volt CTA, glass secondary, explicit states | Default Material. | P1 | State machine on `EliteButton`. |
| MOTION | `EliteMotion` durations + `EliteEnter`. Recovery ring animates. | Page, ring, route, unlock, nav | Incomplete coverage; Material defaults remain. | P1 | Centralize; respect reduced motion. |
| LOGO | Launcher + `ic_fitconnect_brand` on splash. Auth often text-only. | Same mark everywhere | Auth/onboarding underuse the mark. | P1 | Wordmark + mark on identity surfaces. |
| TYPOGRAPHY | Families bundled (Syne / Jakarta / Mono) **regular only** — bold is faux-bold. | Monumental display + mono metrics | Weight files missing. Prime number is 28sp not ~56sp. | P1 | Larger prime metric; do not swap families. |
| COLORS | Tokens match landing hues. **Page background is CARBON** in default dark. | Obsidian floor | Chassis is the wrong black. | **P0** | `background = FLOOR`. |

---

## Highest-leverage rebuild order

1. Floor chassis (`EliteColorRoles`)
2. Athlete Home Prime instrument + Stitch bento + wordmark header
3. Activity map-first cockpit
4. Discover marketplace cards
5. Coach command strip
6. Nav glow + button states
7. Auth / splash / role identity
8. Motion + catalog

**Do not remove:** LOCAL_DEMO, fail-closed production auth, ASCEND engine, wear honesty labels, booking, community, programs.

---

## Evidence index (before)

| Flow | Path |
| --- | --- |
| Landing hero | `qa/reports/screenshots/2026-08-17/landing/01-hero.png` |
| Auth | `qa/reports/screenshots/2026-08-17/auth/` |
| Home | `qa/reports/screenshots/2026-08-17/athlete/04-home.png`, `qa/reports/ascend/02-home.png` |
| Discover | `qa/reports/screenshots/2026-08-17/discover/01-list.png` |
| Activity | `qa/reports/screenshots/2026-08-17/sessions/01-activity.png` |
| Stitch canvas | `qa/reports/visual-fidelity/stitch/stitch-elite-os-canvas.png` |
