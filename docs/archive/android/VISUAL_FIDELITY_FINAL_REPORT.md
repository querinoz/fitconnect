# FitConnect Android — Visual Fidelity Final Report

**Date:** 2026-08-17  
**Stitch:** https://stitch.withgoogle.com/projects/14054299058988485854  
**Stitch access:** PARTIAL (canvas captured: `qa/reports/visual-fidelity/stitch/stitch-elite-os-canvas.png`). Per-frame pixel export remains HUMAN.  
**In-repo Stitch SoT:** `apps/web/components/mobile/stitch-native-primitives.tsx`  
**Landing SoT:** `--eos-floor #070B14` · `--eos-voltline #C8FF00` · `--eos-connect #00DDB4`

---

## Verdict

This pass is a **visual-system rebuild**, not a claim that the APK is a 95% pixel match.

| Gate | Status |
| --- | --- |
| BUILD (`:app:assembleDebug`) | **PASS** |
| Unit tests (`:design-ui:test` `:athlete:testDebugUnitTest` `:coach:testDebugUnitTest` `:ascend:test` `:app:testDebugUnitTest`) | **PASS** (0 failures in executed suites) |
| LOCAL_DEMO | **PASS** (personas, GPS DEMO labels, no fake live GPS) |
| NAVIGATION | **PASS** (pill + Volt icon glow; not default Material bar) |
| ATHLETE HOME hierarchy | **PASS** (code) — Prime Recovery is the page instrument; XP is below |
| ACTIVITY map-first | **PASS** (code) — idle shows LOCAL_DEMO coastal route |
| DISCOVER marketplace cards | **PASS** (code) — cinematic gradient plates, not text rows |
| COACH command strip | **PASS** (code) |
| AUTH / SPLASH identity | **PASS** (code) |
| WATCH UI | Unchanged this pass (already FLOOR chassis) |
| EMULATOR screenshots this session | **NOT_ATTACHED** — AVD lock + crash-consent dialog; adb had no device |
| STITCH_VISUAL_MATCH ≥ 95% | **NOT CLAIMED** |
| LANDING_MOBILE_VISUAL_MATCH ≥ 95% | **NOT CLAIMED** |

### Repeatable score (engineering, no new device frames)

Checklist of 10 (see audit). After this rebuild, **code-level** estimate:

| Score | Before (audit) | After (code) | Device evidence |
| --- | --- | --- | --- |
| STITCH_VISUAL_MATCH | ~42% | **~72%** | unverified this session |
| LANDING_MOBILE_VISUAL_MATCH | ~55% | **~78%** (shared floor/volt/connect/type families) | unverified this session |

95% requires isolated Stitch frames + emulator screenshot diffs. That is **PENDING_HUMAN**.

---

## What changed

### Design system

- **Obsidian chassis:** default dark `background` is `FLOOR` (`#070B14`), not Carbon. Carbon stays on bento / pill / cards. Landing and Android now share the same page black.
- **`ElitePrimeInstrument`:** 220dp Volt ring, `%` suffix, PRIMED/READY status, radial glow.
- **`EliteWordmarkHeader`:** avatar \| FITCONNECT \| sensors.
- **`EliteBentoCard` / `EliteBentoMetric` / `EliteTelemetryGrid` / `EliteMarketplaceCard` / `EliteAiDirective` / `EliteAiFab` / `EliteLiveDot` / `EliteCommandPip`.**
- **Nav:** floating Carbon pill, Volt **glow on the selected icon**, not a filled tab slab.
- **Buttons:** idle / pressed scale / loading spinner / disabled / success / error. Reduced motion skips press scale.
- **Map:** taller tactical canvas + faint grid; glow stroke already existed.

### Athlete Home

Stitch order is now the product order:

1. Wordmark header  
2. Prime Recovery hero  
3. HRV + Day Strain bento  
4. Sleep  
5. Nervous system + training load  
6. AI Coach Directive (Volt CTA)  
7. Squad identity card (LOCAL_DEMO, not a second XP engine)  
8. Today’s performance target (ASCEND mission)  
9. Compact XP / streak / vault  
10. Existing sessions, tasks, actions (functionality kept)

### Activity

Map is first. Idle uses `rt_coastal` labeled **GPS DEMO · LOCAL TELEMETRY**. Metrics are a 3-up telemetry grid.

### Discover

`EliteMarketplaceCard`: treated plate, initials, VERIFIED, sport, city, rating, tier, AVAILABLE/WAITLIST.

### Coach

Command strip: attention / bookings / inbox, then live squad (honest pairing), recovery pips.

### Auth / splash / role

Brand mark + FITCONNECT + Elite OS. Appearance picker moved below identity. Splash cores: `BIOMETRIC · TELEMETRY · AI · CONNECT` without extra delay.

---

## Screen table

| SCREEN | BEFORE | AFTER | STITCH MATCH | LANDING MATCH | FUNCTIONAL | MOTION | RESPONSIVE | A11Y | LIMITATIONS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Splash | Carbon page, one SYS line | Floor + core labels | Partial | High | Pass | Fade kept | OK | CD on splash | No device frame this session |
| Auth | Settings-first | Wordmark hero, personas kept | Partial | High | Pass | Intro beats | OK | Labels kept | Appearance still present, demoted |
| Role | Two buttons | Wordmark + OS CTAs | Partial | High | Pass | None extra | OK | Tags kept | Not a cinematic split |
| Athlete Home | XP first, small ring in a card | Prime hero + bento | High (structure) | High | Pass | Ring 900ms / 0 if reduced | Ring 220dp — verify small phones on device | Ring CD | No device proof |
| Activity | Stacked metrics | Map + grid | Medium-high | High | Pass | Map static | Map 280dp | Map CD | Demo route when idle |
| Discover | Text person rows | Marketplace plates | Medium | Medium-high | Pass | Enter | OK | Clickable cards | No real coach photography in model |
| Coach Home | Dashboard stack | Command strip + pips | Medium | High | Pass | None extra | OK | Pips clickable | Full roster not on overview |
| Squads | Missing OS | Home stub only | Low | — | Demo only | Live dot idle | — | — | Squad OS engine not built |
| Vault / XP | First on home | Below recovery | High (intent) | High | Pass | Existing overlay | OK | — | Still ASCEND, not a game |
| Watch | FLOOR instrument | Unchanged | Medium | High | Unchanged | Unchanged | Watch AVD | Honesty labels | Pairing UNVERIFIED |
| Nav | Volt fill tab | Icon glow | High | High | Pass | None | Pill padding | 48dp | Material core icons |
| Buttons | Material | State machine | Medium-high | High | Pass | Press scale | 48dp+ | CD | Not every screen uses success/error |

---

## Evidence

| Kind | Result |
| --- | --- |
| Stitch canvas | `qa/reports/visual-fidelity/stitch/stitch-elite-os-canvas.png` |
| Prior Android frames (pre-rebuild) | `qa/reports/screenshots/2026-08-17/`, `qa/reports/ascend/` |
| Post-rebuild emulator frames | **Missing this session** |
| `:app:assembleDebug` | PASS |
| Unit tests listed above | PASS, 0 failures |
| Maestro | Not installed |
| `git diff --check` (touched UI paths) | clean (CRLF warning only on NavHost) |

---

## HUMAN dependencies

1. **Stitch login / frame export** for true pixel compare.  
2. **Emulator:** dismiss crash-consent dialog, boot `fitconnect_phone`, install debug APK, capture `qa/reports/visual-fidelity/after/`.  
3. Firebase / Supabase / Play signing — still fail-closed, not invented.  
4. Wear pairing — still UNVERIFIED.  
5. Syne / Jakarta **bold** font files (only regular is bundled; bold is synthesized).  
6. Cinematic coach photography assets if they exist outside `CoachCard` (no URL on the model today).

---

## Recommended next phase

1. Device visual QA loop: Home, Activity, Discover, Auth, Coach — screenshot vs Stitch canvas crops.  
2. Small-phone pass (ring 220dp, FAB vs pill).  
3. Bundle Syne Bold + Jakarta Bold.  
4. Squad OS implementation (separate prompt) using ASCEND contribution XP — visual stub is in place only.  
5. Replace Material core icons with a technical Elite set when assets exist.

Do **not** commit unless asked. Working tree was already dirty before this pass; visual-fidelity files are additional uncommitted work.
