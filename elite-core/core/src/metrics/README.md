# `metrics` — power metrics (spec §1)

Implements `docs/sports-metrics.md` §1.1–1.3: Normalized Power, Intensity
Factor, Training Stress Score. The spec is normative — if the implementation
ever needs to diverge, the spec changes first (ADR-006 rule). Later F1
slices add power curves (§1.4), pace/GAP (§3), HR metrics (§2) and
physiology (§5) alongside this file.

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

## What NOT to worry about

- `powi(4)` vs `powf(4.0)` — `powi` is the integer-exponent version,
  faster and exact for this use; standard choice.
- The `1e-9` tolerances in tests — constant-input identities (NP of
  constant 200W = 200) are exact in IEEE 754 up to rounding of the 4th
  root; the epsilon just avoids over-pinning the last bit.

## Golden-file status

Unit tests here pin the *identities* (constant power, 1h @ FTP = 100 TSS,
NP > average under variability). The ≥15 real-FIT golden-file comparison
against Golden Cheetah — the actual F1 gate — needs the `fit` parser module
first, and real FIT files (parked in `qa/HUMAN-QUEUE.md` if none are
provided by the owner before the parser lands).
