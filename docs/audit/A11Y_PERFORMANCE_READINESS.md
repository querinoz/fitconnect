# FitConnect — Accessibility & Performance Readiness (P8)

**Date:** 2026-09-04 · AUDIT ONLY · NO IMPLEMENTATION

---

## P8-A11Y

**Verdict: NOT_READY (certification) · READY TO START as focused phase (2nd choice)**
**Confidence: MEDIUM** (static Compose evidence; TalkBack NOT_VERIFIED)

### Existing quality (static)

| Item | State |
|------|-------|
| Compose `testTag` | Present on guided workout (`athlete_guided_workout`, `workout_*`) and outdoor E2E tags |
| `contentDescription` / semantics | Present on primary CTAs (start/log/finish/timers) |
| Touch targets | Design system / HoldToConfirm / Elite patterns (≥48–56dp intent) |
| Reduced motion | `reduceMotionEnabled()` referenced in product docs / design system |
| TalkBack device walkthrough | **NOT_VERIFIED** (explicit Wave 2 gap; archive reports agree) |
| Font scale 200% | **NOT_VERIFIED** |
| Contrast measurement | **NOT_VERIFIED** (no Lighthouse/device contrast pass this audit) |
| Keyboard (web) | Partial historical; not re-certified |

### Obvious defects / risks

- Semantics exist ≠ TalkBack certified.
- MapLibre / outdoor map a11y historically deferred.
- Emulator TalkBack is disruptive; prior cowork runs skipped it.

### Scope for a focused cert phase (not a giant refactor)

1. Athlete: Today / Train outdoor / Guided workout / Finish paths — TalkBack script.
2. Font scale smoke on same surfaces.
3. Fix only blocking defects (missing labels, focus traps, unlabeled icons).
4. Record evidence under `docs/qa/` — do not redesign neu-glass.

### Verdict table

| P8-A11Y | Value |
|---------|-------|
| Certification ready? | **NOT_READY** |
| Phase startable? | **Yes (focused)** |
| Blocked? | Device/emulator TalkBack availability |
| Overall | **DEFER behind Physical GPS** unless no device |

---

## P8-PERF

**Verdict: NOT_READY · DEFER (measure later; do not optimize now)**
**Confidence: LOW–MEDIUM** (static risk; no dumpsys/LCP this audit)

### Android sensitive areas

| Area | Assessment | Status |
|------|------------|--------|
| Startup | Not profiled this audit | **UNVERIFIED** |
| Compose recomposition | Not instrumented | **UNVERIFIED** |
| Room writes (GPS points) | Per-fix / batch risk in outdoor path | **RISK** |
| GPS callbacks | Fused location → store; main-looper concern | **RISK** |
| MapLibre updates | E2E uses canvas fallback; production GL path unmeasured | **RISK / UNVERIFIED** |
| Workout timers | MonotonicTimer engineered; jank unmeasured | **UNVERIFIED** |
| Background / foreground service | CaptureLocationService exists; battery unmeasured | **UNVERIFIED** |
| Finish → HTTP | Enqueue-oriented; not proven free of UI-thread network | **UNVERIFIED** (prefer RISK until proven) |

### Web sensitive areas

| Area | Status |
|------|--------|
| LCP / bundle | **UNVERIFIED** this audit |
| Hydration | Historical fixes; not re-run | **UNVERIFIED** |
| Realtime overhead | BroadcastChannel same-tab = low; cloud N/A | N/A default |

### Verdict table

| P8-PERF | Value |
|---------|-------|
| Ready to optimize? | **NOT_READY** (no baseline) |
| Ready to measure? | Yes, after GPS device or in parallel thin pass |
| Overall | **DEFER** — do not start optimization phase |

---

## Combined recommendation

- Prefer **Physical GPS verification** first (closes largest outdoor evidence gap with low code risk).
- If physical phone unavailable: authorize **P8-A11Y focused cert** next.
- Do **not** authorize a broad P8-PERF rewrite without measurements.
