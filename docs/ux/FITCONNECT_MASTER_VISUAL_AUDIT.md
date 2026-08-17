# FitConnect — Master visual / UX / motion audit

**Date:** 2026-08-17  
**Sources used (only these):**

| Source | Status |
| ------ | ------ |
| AI Studio https://ai.studio/apps/b4c9f89a-81e6-42dd-b268-1727d8a9e9c2 | **NOT ACCESSIBLE** — redirected to Google Account sign-in. Appearance **not invented**. |
| Live landing `http://localhost:3001` | Inspected + screenshot |
| Android emulator Home (earlier this session) | Inspected + screenshot |
| Repository: `android/design-ui`, athlete/coach OS, tokens | Inspected |
| In-repo Stitch primitives `apps/web/components/mobile/stitch-native-primitives.tsx` | Inspected previously |
| Prompt floor `#090402` vs Elite Surface `#070B14` | **Keep `#070B14`** (ADR-007 / `elite-surface` skill). Do not fork a third floor. |

Screenshots:

- `qa/reports/screenshots/2026-08-17/emulator-app.png` — Athlete Home LOCAL_DEMO
- `qa/reports/screenshots/2026-08-17/emulator-launch.png` — splash F-mark
- Browser landing hero captured as `web-landing-hero.png` (Cursor screenshot store)

---

## 1. What the product already is

Android Athlete OS is **not** a blank Material template:

- Floor `#070B14`, Volt `#C8FF00`, Connect `#00DDB4` from generated `EliteSurfaceColors`
- Floating Carbon pill nav (`EliteFloatingNavBar`)
- Home hero is Prime recovery ring + HRV / strain / sleep + AI directive
- Activity has map + telemetry grid + ASCEND overlay
- Coach overview labeled “COMMAND”
- Motion tokens exist (`EliteMotion`, `EliteEnter`, `MOTION_TOKENS`)
- Buttons have press scale, loading, success, error
- Landing is cinematic Elite OS, same Volt/Connect language

## 2. Verified gaps (high)

### P0 visual / UX (user-facing)

1. **Home density below the hero** — emulator Home already communicates readiness. Below the fold, code still stacks duplicate recommendation (`EliteAiDirective` **and** “Training state” card), a 7-button “Quick actions” row that looks like a web toolbar, and raw `Text` lines for recent activity. That fights the cockpit hierarchy.

2. **Navigation icon language** — Athlete tabs use Material **Filled** `Favorite` for Community (heart = social-network, not squad/community). Activity uses `PlayArrow` (video). Inconsistent optical weight vs landing’s instrument icons.

3. **Secondary button is Material tonal**, not glass — `EliteButtonVariant.Secondary` → `FilledTonalButton`. Landing secondary is outlined/dark. Cross-platform language break.

4. **Loading is a generic spinner** — `EliteLoading` is only `CircularProgressIndicator`. Spec asked for SYS.INIT language. `EliteOnboardingProgress` already has SYS.INIT rail; loading does not.

5. **Glass cards are opaque-ish** — `EliteCardVariant.Glass` is `surface.copy(alpha = 0.92)` with no highlight edge. Reads as a solid card, not a layer.

6. **Squad is a labeled stub** — Home shows `SQUAD · LOCAL_DEMO` / “Velocity” with no members/points visual. Honest label is correct; the card still looks empty/dead.

### P1

7. Coach tabs also use filled Material icons (`Email`, `DateRange`).
8. Community feed is functional (posts/reactions) but chrome is generic cards + chips.
9. Discover already has `EliteMarketplaceCard` + filters — closer to marketplace than Home is to cockpit.
10. Motion: `EliteMotion` is tween-only; no spring for micro press (buttons already scale 0.97 without spring).
11. Landing mock “Dashboard Preview” is richer glass than Android Home below-fold.

### Not bugs

- `LOCAL_DEMO` pills are **correct** development honesty, not placeholders to hide.
- Empty tRPC roster is backend, not a visual-system bug.
- Watch is a separate small instrument — must not clone phone Home.

## 3. Reference (AI Studio)

**Blocked on Google login.** Quality bar for implementation is therefore:

1. Live landing (verified)
2. Stitch / Elite Surface tokens (verified)
3. Apple-quality *principles* (clarity, hierarchy, restraint) — **not** Apple assets

## 5. Implementation queue (this pass)

Completed in-repo (see sibling docs). Not a claim that the product is 5/5 cinematic OS.

## 6. Floor color decision

Prompt listed `#090402`. Canonical tokens and landing use **`#070B14`**. Changing floor would split landing ↔ mobile. **No change.**
