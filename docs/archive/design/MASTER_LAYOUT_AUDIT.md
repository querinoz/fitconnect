# FitConnect Elite OS — Master Layout Audit (Phase D0)

**Date:** 2026-08-17  
**Status:** D0 COMPLETE — **no layout reconstruction implemented in this phase**  
**Rule:** Named files ≠ shipped experience. Screenshots + hierarchy dumps beat code comments.

This document is the gate for D1+. Do not start a visual rewrite until the decisions in §2 are accepted.

---

## 0. Evidence pack

| Source | Status | Artifact |
| ------ | ------ | -------- |
| Android emulator `emulator-5554` (`sdk_gphone16k_x86_64`, 1080×2400) | **CAPTURED** after `adb install -r` of current `app-debug.apk` (27,928,843 bytes) | `qa/reports/screenshots/2026-08-17/d0/` |
| Athlete Home | CAPTURED | `d0-home.png`, `d0-after-install.png`, `d0-ui.xml` |
| Discover | CAPTURED | `d0-discover.png` |
| Activity | CAPTURED | `d0-activity.png` |
| Community | CAPTURED (latest APK) | `d0-community-v2.png` |
| Profile | CAPTURED (latest APK) | `d0-profile-v2.png`, `d0-profile-v2.xml` |
| Landing `http://localhost:3001/` | **CAPTURED** live | Browser screenshot this session; also `qa/reports/screenshots/2026-08-17/web-landing-hero.png` |
| Wear OS | **ARCHIVED** (not re-launched this session) | `qa/reports/wear/watch-home.png` |
| Coach OS | **NOT recaptured this session** | Code inspected; older `qa/reports/screenshots/2026-08-17/` coach shots exist |
| Web athlete/coach dashboards | **NOT recaptured this session** | Landing only |
| Google Stitch canvas | In-repo PNG only | `qa/reports/visual-fidelity/stitch/stitch-elite-os-canvas.png` |
| Google AI Studio `https://ai.studio/apps/b4c9f89a-81e6-42dd-b268-1727d8a9e9c2` | **REFERENCE_ACCESS = BLOCKED** | Redirects to Google Account sign-in. Appearance **not invented**. |
| Dribbble fitness / glass / neu tags | **REFERENCE_ACCESS = BLOCKED** | JS/captcha wall. Principles extracted from public search snippets only — **not** pixel copies. |
| `qa/HUMAN-QUEUE.md` emulator BIOS block | **STALE** | Emulator **is running** on this machine today. |

Install note: the first Community/Profile captures (`d0-community.png`, `d0-profile.png`) were a **stale APK**. After `assembleDebug` + `adb install -r`, v2 shots match current source (composer kinds + player card). Audit below uses **v2** for those two screens.

---

## 1. What the product already is (do not erase)

FitConnect is already **Elite OS**, not a blank Material template.

Verified on device:

- Floor is obsidian `#070B14`, Volt `#C8FF00`, Connect `#00DDB4` (generated `EliteSurfaceColors`).
- Athlete Home is an **instrument**: Prime ring 59% MODERATE + HRV / strain / sleep bento + “Train Smart”.
- Floating carbon pill nav, 5 destinations, selected tab outlined in Volt.
- `LOCAL_DEMO` pills are honest — keep them.
- Landing is cinematic Elite OS with glass telemetry mock (Readiness ~87% on landing vs Prime 59% on Android — both labeled LOCAL_DEMO, **unsynced on purpose until a real identity exists**).
- Tokens exist: `packages/design-tokens` → `scripts/generate-kotlin-tokens.mjs` → `android/design/EliteSurfaceTokens.kt` → Compose wrappers in `:design-ui`.
- Motion tokens exist (`MOTION_TOKENS` / `EliteMotion` / `EliteEnter`). Reduce-motion path exists (`LocalReduceMotion`).
- Buttons: Primary Volt, Secondary glass outline, Ghost, Destructive; press scale 0.97; loading spinner.
- Latest Profile shows player-card identity: title **CLUTCH PERFORMER**, LV 6, 2395 XP, 18 DAY STREAK, featured titles.
- Latest Community composer: “What happened today?” + TEXT / WORKOUT / PROGRESS / ACHIEVEMENT.

This is the product to reconstruct **from**, not replace.

---

## 2. Canonical decisions (D0 locks)

These override prompt defaults when they would fork the brand.

| Topic | Prompt | Decision | Why |
| ----- | ------ | -------- | --- |
| Floor | `#090402` | **Keep `#070B14`** | Landing, tokens, Android, Wear all use Elite Surface floor. A third floor splits the OS. |
| Nav | HOME / DISCOVER / **CREATE** / **SQUADS** / PROFILE | **Keep HOME / DISCOVER / ACTIVITY / COMMUNITY / PROFILE** | Tabs are navigation (Apple HIG). CREATE is an **action** (sheet). ACTIVITY is capture — destroying it for a Create tab would break the performance OS. Squads nest **inside Community**, not a new tab. |
| Accent | User hue wheel in Volt-green spectrum | **D17 later** — spectrum only, never purple/red/blue themes | Identity is Voltline. Personalization = “my FitConnect”, not another brand. |
| Glass | Core language + blur | **Ladder + localized blur only** | Full-screen blur is a performance and a11y fail. Current “glass” is alpha 0.72 **without** backdrop blur. |
| Neumorphism | Tactile controls | **Instruments + watch + circular metrics only** | No full-screen soft-UI. |
| Reactions | Animated explosions | **Chips, not casino** | Already shipped as typed chips. Motion may highlight; never slot-machine. |
| Brand | Rare / high-signal | **Remove wordmark from routine Home** (D2) | Home currently shows FITCONNECT on every Today view. |

---

## 3. Reference principles extracted (not copies)

From public fitness/glass writing (Dribbble itself blocked):

- One primary instrument, supporting metrics secondary.
- Dark floor + translucent layers for depth; **text stays high contrast**.
- Thumb-zone persistent nav; Create is not a destination.
- Glass is hierarchy, not wallpaper.
- Motion follows gesture direction; reduced motion keeps state, drops travel.

AI Studio: **BLOCKED**. Quality bar remains: live landing + Elite Surface tokens + in-repo Stitch PNG + this emulator pack.

---

## 4. Token inventory vs reconstruction prompt

### Color

| Role | Token | Hex | Personalizable? |
| ---- | ----- | --- | --------------- |
| Background | `FLOOR` | `#070B14` | **No** |
| Carbon | `CARBON` | `#111827` | **No** |
| Primary | `VOLTLINE` | `#C8FF00` | **Yes (D17 spectrum)** |
| Connect | `CONNECT` | `#00DDB4` | **No** |
| Success | `PERFORMANCE` | `#00E090` | **No** |
| Warning | `RECOVERY` | `#FFB020` | **No** |
| Danger | `ALERT` | `#FF3A5C` | **No** |
| Live data | `TELEMETRY` | `#3CD7FF` | **No** |

No accent picker. Appearance is Dark / Light / System only (`EliteAppearancePicker`).

### Spacing (4px grid)

Current: 0, **2**, 4, 8, 12, 16, 24, 32, 48, 64.  
Prompt also wants **20** and **40**. Missing those two steps. Phone margins are `EliteSpace.Lg` = **16dp** (prompt 16–20: in range).

### Radius

4 / 8 / 12 / 16 / 24 / 999. Cards: Glass/Bento 24, others 16.

### Glass / elevation

`OPACITY.GLASS = 0.72`. Elevation 0 / 1 / 3 / 6 / 12. **No blur token. No neumorphic token. No glass L1–L5 ladder in code.**

### Typography

Canonical families exist. **Only Regular TTF files are bundled** (`syne_regular`, `plus_jakarta_sans_regular`, `jetbrains_mono_regular`) while tokens request weights 500–700. Android synthesizes bold. This is a **P1 craft gap**.

### Motion

150 / 220 / 400 / 1200 ms. Spring only on MICRO/SPRING presets. **No SharedTransitionLayout / sharedElement** anywhere in the repo.

---

## 5. Surface system — current vs target

| Level | Target | Current |
| ----- | ------ | ------- |
| 0 Atmosphere | Floor + restrained glow | Solid floor. Landing has cinematic atmosphere; Android Home does not. |
| 1 Carbon | Nav / chrome | Floating pill uses Carbon 0.94 — **good**. |
| 2 Elite Surface | Solid cards | Material `surface` / `surfaceVariant`. |
| 3 Glass | Translucent + hairline + **localized** blur | Alpha 0.72, hairline, **no blur**, no inner highlight. Reads as tinted solid. |
| 4 Floating glass | FAB / overlays | AI FAB is Volt disc; overlaps lower Home content (`AI Coach` bounds `[870,1885]–[1038,2053]` vs sleep/load cards). |
| 5 Modal | Glass sheet | `EliteBottomSheet` = stock `ModalBottomSheet`. `EliteDialog` = stock `AlertDialog`. |
| 6 Critical telemetry | High contrast, no glass noise | Activity IDLE card is closer; not immersive live map overlay. |

Neumorphism: **absent**.

---

## 6. Screen matrix

Severity: **P0** blocks premium perception or hierarchy · **P1** craft · **P2** later surface · **OK** keep.

| SCREEN | CURRENT (evidence) | REFERENCE | GAP | SEVERITY | ACTION | STATUS |
| ------ | ------------------ | --------- | --- | -------- | ------ | ------ |
| Splash | System splash + F-mark (archive `emulator-launch.png`) | Rare brand moment | Not recaptured this session | P2 | Confirm brand mark only here + auth | OPEN |
| Auth / role | Code: FITCONNECT wordmark on role select | High-signal brand | Not recaptured this session | P1 | Visual QA next pass | OPEN |
| Athlete Home | Prime 59% ring, bento HRV/strain/sleep, FITCONNECT header, AI FAB, 5-tab pill | Instrument panel; brand rare | Wordmark on routine dashboard; below-fold still dense (missions/XP/squad stub after scroll — not in first frame); FAB collides | P0 | D2 brand restraint, D9 density, D4 FAB layer | OPEN |
| Discover | Market header, GPS demo instrument, filters, VERIFIED coach card | Marketplace, not Instagram | Demo map occupies hero; filters are form-like | P1 | D12/D9: keep instrument, tighten query chrome | OPEN |
| Activity | LIVE/ROUTE chips, grid plot, IDLE 00:00, GPS DEMO | Immersive map + timer + thumb controls | Idle cockpit is a chart + card, not map-under-metrics. Play icon for Activity tab | P0 | D11 live composition; consider capture glyph vs PlayCircle | OPEN |
| Community | Composer kinds + 6 reaction chips + comments | Performance story feed | Cards are stacked forms; reactions are raw enum labels; no media, no shared-element, no vertical pager (correct — feed is not Reels) | P1 | D12 chrome; CREATE sheet later; **do not** Instagram-paginate this screen | OPEN |
| Profile | Player card + titles + medical + appearance | Player + identity + social | Avatar teal not Volt; medical still in first viewport; no banner, pin, accent picker, hover/sheet preview | P0 | D8 identity header; push medical below fold | OPEN |
| Settings | Reached via Home gear | Low-signal | Not recaptured | P2 | D2 brand section only | OPEN |
| Recovery / Sleep / Vault | Routes exist | Whitespace + instrument | Not recaptured this session | P1 | D9 supporting instruments | OPEN |
| Coach Overview | Code: COMMAND + LIVE SQUAD honest Wear | Command center | Not recaptured; filled Material icons (Email, DateRange) | P1 | D10 | OPEN |
| Wear home | FITCONNECT + READINESS 88 + START/MORE; LINK UNVERIFIED | Clarity > glass | Brand on every watch face; large empty lower half | P1 | D18: contrast first; **no full glass** | OPEN |
| Landing hero | Cinematic glass mock, Volt CTA, LOCAL DEMO | Marketing high-signal | Journey 01–06 not sold; Android mock ≠ current Home density | P1 | D20: mockups must match **current** app | OPEN |
| Web dashboards | Placeholder profile historically | Desktop hover + columns | Not recaptured | P1 | D19 | OPEN |
| Stories / Reels | **Do not exist** | Immersive vertical **only** for Motion | Missing product, not a layout bug | — | After social engine persist | BLOCKED on product |
| Squad OS | `SQUAD · LOCAL_DEMO` badge | Collective instrument | Stub | P0 product / P1 visual | D13 after graph persist | OPEN |
| Maps | `EliteRouteMap` dark + Volt route | Telemetry map | Discover/Activity use demo plot, not live GPS (honest) | P1 | D11 | OPEN |
| Notifications | Engine exists | Why-should-I-care | UI not recaptured | P2 | D16/K | OPEN |
| Messaging | Coach inbox, not Messenger | Minimal | Do not build iMessage | P2 | Scope freeze | OPEN |

---

## 7. Navigation & gestures

**Athlete tabs (keep):** Home · Discover · Activity · Community · Profile  
Selected: Volt fill 16% + hairline ring + label. Unselected: outlined Material icons.  
State preservation: `saveState` / `restoreState` already on tab navigate — **keep**.

**CREATE:** must stay an action (composer already on Community; Activity share overlay exists). A sixth tab or a fake center destination is **rejected**.

**Gestures today:**

| Gesture | Where | Fallback |
| ------- | ----- | -------- |
| Vertical scroll | All LazyColumns | Native |
| Bottom sheet drag | Material sheet only | Close button missing on custom glass |
| Long-press haptic | Activity start/stop only | No global haptic toggle |
| Pull-to-refresh | **Missing** | Refresh chip on Community |
| Shared element | **Missing** | Instant NavHost swap |
| Vertical feed pager | **Missing — correctly** | Conventional feed |
| Edge back | System | OK |

Critical actions are not gesture-only. Good.

---

## 8. Brand placement (current)

| Location | Now | Spec |
| -------- | --- | ---- |
| Home header | FITCONNECT wordmark **every visit** | Should be **low-signal** |
| Athlete overline | `ATHLETE OS` on almost every screen | Acceptable micro-label |
| Watch | FITCONNECT always | Reduce after first pair |
| Auth / splash | Wordmark | Keep |
| Share card | `FITCONNECT · PERFORMANCE COMPLETE` | Keep |
| Cards | No logo spam | Keep |

---

## 9. Interaction / motion / a11y / perf (summary)

- Press: button scale 0.97; **no spring on press** except MICRO preset unused by buttons.
- Loading: `EliteLoading` = `SYS.SYNC` label + `CircularProgressIndicator` (spinner remains).
- Empty/error: `EliteEmptyState` / `EliteErrorView` exist; Community empty copy is generic.
- Haptics: Activity only; **no HAPTICS ON/OFF**.
- Touch targets: buttons ≥ 48dp (`Accessibility.MIN_TOUCH_TARGET_DP`).
- Safe areas: Scaffold uses `safeDrawing` horizontal+top; nav has `navigationBarsPadding`. Home content `[0,136]–[1080,2095]` — status bar respected.
- Contrast: Volt on floor is high; glass 0.72 on near-black is readable; **do not add blur under body text**.
- Perf risk: introducing fullscreen blur would violate D22 before D4 is designed.
- Recomposition: not profiled this session — **UNVERIFIED**.

---

## 10. Cross-platform coherence

| Axis | Android | Web landing | Wear |
| ---- | ------- | ----------- | ---- |
| Floor / Volt / Connect | Yes | Yes | Yes |
| Glass craft | Tint only | Stronger glass mock | Flat, correct for watch |
| Typography files | Regular only | Full web fonts | Default/system-ish sizes |
| Nav | 5-tab pill | Marketing links | Two buttons START/MORE |
| Identity | Player card (latest) | Marketing hero | Readiness number |
| Accent personalization | None | None | None |

Same brand, different composition — **correct**. Do not clone phone Home onto the watch.

---

## 11. Implementation order (after D0 PASS)

Do not skip gates. Each phase: implement → build → test → screenshot → fix.

| Phase | Name | First slice |
| ----- | ---- | ----------- |
| D1 | Tokens | Add spacing 20/40 if needed; glass L1–L5 + blur radius tokens; **no new hues** |
| D2 | Brand | Remove routine Home wordmark; keep splash/auth/share |
| D3 | Layout grid | Confirm 16dp phone margins; tablet later |
| D4 | Surfaces | Localized blur on Glass L3+ only; inner highlight; **no fullscreen blur** |
| D5 | Nav | Keep 5 tabs; polish selected indicator; FAB z-order |
| D6 | Type | Bundle Syne/Jakarta/Mono **weights** used by tokens |
| D7 | Controls | Sheet/dialog glass; haptic policy + toggle |
| D8 | Profile | Identity header; medical below; accent preview later |
| D9 | Athlete Home | Instrument first; cut duplicate below-fold |
| D10 | Coach | Command density; outlined icons |
| D11 | Activity/map | Immersive live layout without fake GPS |
| D12 | Social | Post chrome; CREATE sheet; no Reels until media pipeline |
| D13 | Squads | Visual of existing contribution — no fake members |
| D14 | Gamification | Visualize ASCEND, don’t invent XP |
| D15 | Motion | Shared elements for avatar/media where cheap |
| D16 | Gestures | PTR + long-press identity sheet; a11y alternatives |
| D17 | Accent | Volt-spectrum wheel only |
| D18 | Watch | Legibility, not glass |
| D19 | Web | Hover identity; don’t fork tokens |
| D20 | Landing | Journey + **current** device mock |
| D21–D23 | A11y / perf / QA | Contrast, jank, regression pack |

---

## 12. Visual quality gate (asked of captured screens)

| Question | Home | Community v2 | Profile v2 | Landing |
| -------- | ---- | ------------ | ---------- | ------- |
| Premium layout? | Instrument yes; chrome noisy | Form-feed | Identity starting | Yes |
| Hierarchy obvious? | Prime yes | Composer competes with posts | Title yes; medical too high | Yes |
| Primary action obvious? | Weak (Train Smart is text) | Publish yes | None | Enter Elite OS |
| Brand restrained? | **No** (wordmark) | Yes | Yes | Yes (header only) |
| Glass improving hierarchy? | Tint cards | Tint cards | Tint cards | **Yes** on mock |
| Neu tactility? | Ring only | No | No | No |
| Contrast OK? | Yes | Yes | Yes | Yes |
| Feels like FitConnect? | **Yes** | Yes, thin | Yes, emerging | **Yes** |
| One-hand? | FAB vs Community conflict | Composer high | Scroll | Desktop |
| Reduced motion? | Tokens exist | Unverified on device | Unverified | `data-motion` on web |

**None of these screens are a generic SaaS dashboard.** They are an incomplete Elite OS.

---

## 13. Honesty

- D0 is **audit only**. Layout reconstruction has **not** started.
- Do not declare BRAND/LAYOUT/GLASS/MOTION/PERSONALIZATION PASS.
- Coach, Watch relaunch, web dashboards, foldable, tablet, reduced-motion device toggle: **not verified this session**.
- Production Firebase/Supabase/Play: **PENDING_HUMAN**.
- `qa/HUMAN-QUEUE.md` still claims emulator BIOS block — **false on this machine today**.

**D0 GATE: PASS (documentation + evidence).**  
**D1–D9 / D17 (this continuation):** implemented in source — verify with `:design-ui:test` / `:foundation:test` / emulator screenshots before calling visual PASS.

| Phase | Slice |
| ----- | ----- |
| D1 | Spacing inset/section + `GLASS_TOKENS` generated to Kotlin |
| D2 | Home wordmark hidden (`showWordmark = false`) |
| D4 | Glass L2 + inner highlight (no fullscreen blur) |
| D5 | Extra list inset under FAB |
| D7 | Sheet uses Carbon glass L4 |
| D8 | Medical below identity; accent picker on Profile |
| D9 | Removed duplicate nervous/load row and chip toolbar |
| D17 | Volt-spectrum accent persisted locally |

