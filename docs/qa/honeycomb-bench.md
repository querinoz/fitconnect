# Honeycomb atmosphere — frame budget (FASE 2)

Date: 2026-08-17  
AVD: `fitconnect_phone` only (Pixel 4a **not** created)  
Palette: Floor `#070B14` · Volt `#C8FF00` (canonical, not forked)

## Unit bench (JVM, layout + draw-op budget)

Command: `.\gradlew.bat :design-ui:testDebugUnitTest --tests com.fitconnect.android.designui.atmosphere.HoneycombMeshTest`

| Test | Result | Time |
| --- | --- | --- |
| cellCountStaysUnderBudgetOnPhoneAndTablet | PASS | 0.017s |
| perFrameWorkIsOneStrokePlusPulses | PASS (1 stroke + ≤3 pulses) | 0.000s |
| layoutMedianStaysUnderFrameBudget (≤ 1.5ms) | PASS | 0.037s (41 samples + warmup) |
| hexHasSixVertices | PASS | — |
| emptySizeYieldsNoCells | PASS | 0.013s |

Suite: **5/5 PASS** in 0.078s.

Architecture: **one** cached `Path` at Athlete OS shell (not per screen). Reduce-motion / battery saver → static mesh, no parallax/pulse.

## Device gfxinfo (`dumpsys gfxinfo com.fitconnect.android.debug`)

Emulator WHPX usable. Whole-frame numbers (Home scroll includes feed photos/video, not honeycomb alone).

| Condition | Frames | Janky | p50 | p90 | GPU p50 |
| --- | --- | --- | --- | --- | --- |
| Subtle ON (warmup scroll) | 203 | 9.85% | 29ms | 44ms | 18ms |
| **OFF** (A/B) | 76 | 14.47% | 28ms | 40ms | 17ms |
| **ON** (A/B) | 142 | 12.68% | 27ms | 42ms | 16ms |

**Verdict:** honeycomb ON is not worse than OFF on this AVD. Jank is emulator + dense Home, not the mesh. **Pixel 4a AVD not created.**

Raw dump: `docs/qa/elite-os-v2-gfxinfo.txt`

## Not verified

- TalkBack walkthrough (UI dump only)
- Physical mid-range phone
- Coach / Wear / Auth honeycomb (out of FASE 2 scope)
