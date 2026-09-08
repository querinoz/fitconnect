# FitConnect Mobile — Full Polish QA Report

**Date:** 2026-09-08  
**Protocol:** Figma × Skills × MCP × Full Polish  
**Visual contract:** [`docs/design/ZENITH_VISUAL_CONTRACT_MOBILE.md`](../design/ZENITH_VISUAL_CONTRACT_MOBILE.md) — **APPROVED**  
**Frames:** [`docs/design/visual-contract/`](../design/visual-contract/)

---

## 1. Executive Summary

```text
STATUS:                 CONDITIONAL PASS

BUILD:                  PASS (:app:assembleDebug)
TESTS (nav/deeplink):   PASS (AthleteNav + CoachNav + DeepLinkClassify)
MAESTRO:                FAIL / BLOCKED — INSTALL_FAILED_USER_RESTRICTED on Redmi Note 9S
REAL DEVICE:            PARTIAL — device attached; install canceled by user MIUI restriction
PERFORMANCE:            PARTIAL — code mitigations applied; no gfxinfo FPS measured (no install)
VISUAL CONSISTENCY:     PASS vs approved contract (implementation reconciled)
UX:                     PASS (primary athlete surfaces)
ACCESSIBILITY:          PARTIAL — existing semantics/touch targets retained; no TalkBack dump
REPOSITORY HYGIENE:     PARTIAL — dead EliteTrainFab removed; MD inventory classified (no mass delete)
SECURITY:               PASS — no secret exposure; Strava-never-social IA unchanged
```

**Why not full PASS:** Maestro + real-device install + measured FPS require the user to allow USB install (“Install via USB” / MIUI security). Until that clears, Final Gate cannot claim MAESTRO / FPS / ANDROID = PASS.

---

## 2. Skills / MCP / Plugin Evidence

| Tool / Skill | Purpose | Phase | Outcome |
|--------------|---------|-------|---------|
| GetDynamicTools | Discovery | 0 | Catalog inventoried |
| cursor.GenerateImage | Visual contract frames | 0 | 5× 9:16 PNGs |
| elite-surface | Token / neu-glass lock | 0–2 | Applied |
| ui-ux-pro-max | Hierarchy / touch | 0–2 | Applied to briefs + polish |
| mobile-design | Mobile constraints | 0–3 | Applied |
| android-emulator-skill | Device / gfxinfo | 5–6 | Device present; install blocked |
| Figma MCP | Design intelligence | 0 | **Unavailable** |
| plugin-wonder-wonder | Design MCP | 0 | **needsAuth** — not used |
| Maestro CLI (`.maestro-zenith`) | E2E | 5 | Binary present; install blocked |

---

## 3. Screen QA Matrix

| Screen | Visual | UX | Functional | Performance | Status |
|--------|--------|----|------------|-------------|--------|
| Splash | Brand + Voltline Get Started CTA | Auto-advance + tap complete | Boot restore preserved | Light | PASS* |
| Feed | Story stroke rings, media cards, FitConnect title | Edge drawer + chips + Create | Community embedded | Blur limited on bottom chrome | PASS* |
| Ascend | AscendXPBar primary ring first | Tabs retained | Vault data paths unchanged | Charts secondary | PASS* |
| Train | Start Session CTA | FAB → StrengthWorkout | Existing session machine | — | PASS* |
| Dashboard | Sparse rings (metric strip demoted) | Session hero Start Session | HC cards retained | Less overdraw from strip | PASS* |
| Profile | SoftChrome hero + tier ring | Connections path unchanged | — | — | PASS* |
| Coach | Not redesigned | Consistency only | Nav contract PASS | — | DEFERRED |

\*Visual/UX judged against approved PNG contract + code review; **not** pixel-diff / Maestro-proven on device.

---

## 4. Interaction Matrix (critical)

| Screen | Element | Action | Expected | Loading | Error | Tested |
|--------|---------|--------|----------|---------|-------|--------|
| Splash | Get Started | Tap / auto | Completes boot once | N/A | restore fail → still finishes | Unit path compile PASS; device blocked |
| Feed | Story | Tap | Opens Profile/Discover/Ascend | N/A | N/A | Code wiring PASS |
| Feed | Edge swipe | Open drawer | Discovery sheet | N/A | Back dismisses | Prior Maestro PASS (pre-redesign); **re-run blocked** |
| Feed | Create | Tap | CreatePostSheet | Yes | Invalid/rate-limit copy | Code PASS |
| Ascend | XP ring | Display | Level progress | N/A | Empty vault | Code PASS |
| Train FAB | Tap | Opens WORKOUT | Yes | — | Nav contract PASS |
| Train | Start Session | Tap | Starts guided session | Yes | Failed phase copy | Tag `workout_start` retained |
| Dashboard | Start Session | Tap | Training / session | — | — | Code PASS |
| Profile | Connections | Navigate | Settings path | — | — | Unchanged |
| Nav | Bottom tabs | Switch | Feed/Ascend/Dash/Profile | — | — | Contract tests PASS |

---

## 5. Performance Findings

| Issue | Location | Root cause | Fix | Before | After | Status |
|-------|----------|------------|-----|--------|-------|--------|
| Scroll blur cost | Bottom nav glass | Blur on scroll chrome | `enableBlur = false` on `EosPremiumBottomNav` | Blur on | Soft glass fill, no blur | Applied |
| Duplicate FAB | `EliteTrainFab` | Dead parallel | Deleted | Duplicate | Single `EosTrainActionFab` | Applied |
| Dashboard density | `TodayMetricStrip` | Duplicate HRV/load | Removed strip; week ring + readiness remain | Dense | Sparser | Applied |
| FPS / jank | Device | No install | — | — | — | **Not measured** |

**Limitation:** No fabricated FPS. `dumpsys gfxinfo` requires installed package on device.

---

## 6. Repository Cleanup

| Action | Detail |
|--------|--------|
| DELETE | `android/design-ui/.../EliteTrainFab.kt` (unused) |
| KEEP | Visual contract PNGs + `ZENITH_VISUAL_CONTRACT_MOBILE.md` (CANONICAL) |
| KEEP | `ZENITH_MOBILE_IA.md`, `ELITE_OS_NEU_GLASS.md` |
| MERGE | Ascend XP → single `AscendXPBar` consumer in vault |
| ARCHIVE | Not performed this wave (no mass MD moves) |
| DEPS | No dependency removals (requires separate graph audit) |

### Markdown classification (sample — design)

| Doc | Class |
|-----|-------|
| `ZENITH_VISUAL_CONTRACT_MOBILE.md` | CANONICAL |
| `ZENITH_MOBILE_IA.md` | CANONICAL |
| `ELITE_OS_NEU_GLASS.md` | CANONICAL |
| `docs/archive/**` | ARCHIVE |
| Historical CLAUDE scorecards | KEEP (historical) — do not treat as current PASS |

---

## 7. Remaining Issues

| ID | Sev | Description | Location | Impact | Fix | Blocking Final PASS? |
|----|-----|-------------|----------|--------|-----|----------------------|
| P0-1 | P0 | USB install restricted (MIUI) | Redmi Note 9S | Blocks Maestro + FPS | Enable “Install via USB” / confirm install prompt | **YES** |
| P1-1 | P1 | No TalkBack / font-scale dump this wave | Athlete surfaces | A11y evidence gap | Run a11y skill + dumpsys | No |
| P1-2 | P1 | Coach visual parity deferred | Coach shell | OS consistency gap | Follow-up coach pass | No |
| P2-1 | P2 | Visual regression tooling absent | CI | No screenshot diff | Add screenshot pack later | No |
| P2-2 | P2 | Wonder MCP unauthenticated | Cursor | No Figma-adjacent MCP | User mcp_auth | No |
| P3-1 | P3 | Large MD corpus not fully archived | `docs/` | Noise | KEEP→MERGE→ARCHIVE wave | No |

---

## 8. Final Exit Gate

```text
FIGMA / VISUAL CONTRACT        PASS (approved + frames on disk)
FITCONNECT BRAND LOCK          PASS
ATHLETE UI                     PASS (reconciled)
COMPOSE QUALITY                PASS (assembleDebug)
UX POLISH                      PASS (primary)
FUNCTIONAL QA                  PARTIAL (unit/nav PASS; device E2E blocked)
NAVIGATION                     PASS
MAP / TELEMETRY                NOT RE-AUDITED THIS WAVE
RESPONSIVE LAYOUT              PARTIAL (token SoftChrome; no multi-density device run)
PERFORMANCE AUDIT              PARTIAL (mitigations; no FPS)
ACCESSIBILITY AUDIT            PARTIAL
MAESTRO                        FAIL (install blocked)
BUILD                          PASS
DOCUMENTATION HYGIENE          PARTIAL
DEAD CODE AUDIT                PASS (EliteTrainFab)
FINAL REPORT                   PASS (this file)
```

```text
FINAL STATUS = CONDITIONAL PASS
```

### Unblock for full PASS

1. On device: Settings → Developer options → **Install via USB** / confirm install dialog.  
2. `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`  
3. `$env:USERPROFILE\.maestro-zenith\maestro\bin\maestro.bat test maestro/athlete/full_journey.yaml`  
4. Optional: `adb shell dumpsys gfxinfo com.fitconnect.android reset` → scroll Feed → `framestats`  

---

## 9. Implementation delta (this approved wave)

- SoftChrome default on `EosGlassSurface`; Media cards; solid Voltline FAB; SoftChrome nav without blur  
- Splash Voltline **Get Started** (tap or auto-complete once)  
- Feed Voltline **stroke** story rings; embedded community  
- Ascend: `AscendXPBar` primary, charts secondary  
- Dashboard: demoted metric strip; **Start Session** CTA  
- Profile SoftChrome hero; deleted dead `EliteTrainFab`  
