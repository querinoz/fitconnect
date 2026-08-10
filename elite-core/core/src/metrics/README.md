# `metrics` — power, heart-rate, and pace training stress (spec §1, §2.1, §3)

Implements `docs/sports-metrics.md` §1.1–1.4 (Normalized Power, Intensity
Factor, Training Stress Score, per-activity power curve) directly in this
file, §2.1 (hrTSS) in [`heart_rate.rs`](./heart_rate.rs), and §3 (GAP +
rTSS) in [`pace.rs`](./pace.rs). The spec is normative — if the
implementation ever needs to diverge, the spec changes first (ADR-006
rule). Physiology (§5) is its own top-level module, `crate::physiology`.
HR/power *zones* (§2.2, §4) are a separate concern and already live in
`crate::zones`, not here.

## Why it looks the way it does

**NP returns `Option<f64>`, never a fallback number.** The spec is explicit:
below 30s of data NP is *undefined* — reporting 0 or the raw average would
poison downstream TSS/CTL numbers silently. `None` forces every caller (and
every binding: Kotlin `null`, JS `null`) to handle the case visibly.

**Resampling before the rolling window.** The spec's "sample-and-hold for
gaps" means the 30s window must slide over *wall-clock seconds*, not over
raw samples (a smart recorder that writes one sample per 10s would otherwise
get a 300s window). `resample_1hz_sample_and_hold` expands the recording
onto a 1 Hz grid first; the window then always spans exactly 30 real
seconds. This is also what Golden Cheetah does, which matters for the F1
golden-file gate.

**Validation at the public boundary.** Every public function calls
`streams.validate()` first and returns `None` on structural garbage. After
that, internal helpers are allowed to index freely — the invariant lives in
one place (`streams`), not re-checked at every array access.

## What a reviewer needs to know

- `?` on an `Option` (e.g. `streams.power_w.as_ref()?`) is early-return
  sugar: "if this is `None`, the whole function returns `None` now."
- `windows(30)` yields every consecutive 30-element slice — that *is* the
  rolling window, no index arithmetic to review.
- `f64::from(x)` is the lossless widening conversion (u16/u32 → f64); we
  use it instead of `as f64` so an accidental narrowing cast can't compile.
- The two-cursor loop in `resample_1hz_sample_and_hold` never moves
  backwards, so the resample is O(samples + seconds), not O(samples ×
  seconds) — worth knowing because activities can be 5h+ at 1 Hz.
- The power curve uses **prefix sums**: `prefix[i]` is the sum of the
  first `i` samples, so any window's sum is one subtraction
  (`prefix[i+d] - prefix[i]`). That turns "best mean for every ladder
  duration" into one cheap pass per duration. The curve is per-activity
  only — season/all-time aggregation is the caller's job (spec §1.4).

## What NOT to worry about

- `powi(4)` vs `powf(4.0)` — `powi` is the integer-exponent version,
  faster and exact for this use; standard choice.
- The `1e-9` tolerances in tests — constant-input identities (NP of
  constant 200W = 200) are exact in IEEE 754 up to rounding of the 4th
  root; the epsilon just avoids over-pinning the last bit.

## `heart_rate.rs` — why it looks the way it does

**`Sex` is an enum the caller must supply, not a bool with a default.** The
spec says the male coefficient is the fallback "with a visible estimated
flag" when unset — that flag has to live at the app/profile layer, where
the athlete record is. Baking a silent default into this crate would make
the "visible" part of the spec impossible to honour from here.

**Calibration reuses the same rate function as the per-sample sum.**
`trimp_rate_per_minute` is "TRIMP contribution for one minute at this
HRR%" — the per-activity `trimp()` sums it sample-by-sample, and the
threshold-hour calibration in `hr_tss()` evaluates it once at the
athlete's LTHR and multiplies by 60. Two call sites, one formula, so the
calibration can never drift out of sync with the per-sample math.

**HRR% is intentionally unclamped.** A reading above `hr_max_bpm` or below
`hr_rest_bpm` means the profile's HR bounds are stale, not that the sample
is invalid — clamping here would hide that signal instead of surfacing it
downstream (future work: flag profile HR bounds as due for review, not an
F1-slice-2 concern).

**Gap-crediting matches `zones::time_in_zones`.** Both integrate a
per-sample quantity over wall-clock time and both credit the gap to the
*next* sample (last sample gets 1s) — same convention, same reasoning:
smart/irregular recording must not be penalised relative to dense 1 Hz
recording.

## `pace.rs` — why it looks the way it does

**Speed, not pace, is the internal unit.** The spec writes the GAP formula
both ways — `GAP_pace = actual_pace × (C(0)/C(g))` in §3.1's prose, and
"applied to GAP-adjusted speed" in §3.2. Both are the same relationship
(pace and speed are reciprocals: `GAP_speed = actual_speed × (C(g)/C(0))`
is algebraically the inverse of the pace formula — worked through in the
`grade_adjusted_speed_mps` doc comment). Elite Core stores `speed_mps` as
the stream channel, so speed is the unit that avoids a conversion at every
call site; pace-for-display (e.g. min/km) is a UI-edge concern per the
spec's own "SI units internally... conversion at the UI edge only" rule.

**Grade comes from distance + altitude deltas, not a dedicated channel.**
No device streams "instantaneous grade" directly — it's derived the same
way any analysis tool would, from consecutive points' rise over run. The
`< 0.5m` run-distance guard in `grade_series` exists because GPS/barometer
noise on a near-stationary step would otherwise produce grade values in
the hundreds-of-percent range, which the ±20% clamp alone doesn't protect
against (the clamp only helps once the *run* itself is trustworthy;
garbage in a divisor needs its own guard, not just a clamp on the
quotient).

**The 1 Hz resample is duplicated from the parent module, not shared.**
`resample_1hz_sample_and_hold` (power, `u16`) and
`resample_1hz_sample_and_hold_f64` (pace, `f64`) do the same thing on
different element types. Rust doesn't make a one-line generic version of
this free (the multiply-and-hold logic is trivial but the type conversion
boilerplate isn't), and with exactly two call sites duplication is more
reviewable than an abstraction built for a "maybe" third caller — noted
explicitly in the doc comment so this isn't mistaken for an oversight.

## Golden-file status

Unit tests here pin the *identities* (constant power, 1h @ FTP = 100 TSS,
NP > average under variability). The ≥15 real-FIT golden-file comparison
against Golden Cheetah — the actual F1 gate — needs the `fit` parser module
first, and real FIT files (parked in `qa/HUMAN-QUEUE.md` if none are
provided by the owner before the parser lands).
