# `physiology` — training load & HRV (spec §5)

Implements `docs/sports-metrics.md` §5.1 (CTL/ATL/TSB), §5.2 (ACWR), and
§5.3 (rMSSD baseline + readiness flag). The spec is normative — if the
implementation ever needs to diverge, the spec changes first (ADR-006
rule).

## Why it looks the way it does

**CTL/ATL/TSB take a plain `&[f64]`, not `ActivityStreams`.** Unlike
`metrics` (which operates on one activity's sample stream), this module
operates on one *daily aggregate* per calendar day across an athlete's
whole history. Building a calendar-aware type here would duplicate
whatever the app/server layer already owns for turning "activities on
disk" into "one TSS number per day, 0 for rest days" — that assembly step
(including how multiple activities on the same day combine) is a caller
concern, not a domain-math concern. This module is deliberately the
*narrowest* thing that can be tested in isolation: feed it a contiguous
daily series, get back one point per day.

**`baseline_established` / `acwr: Option<f64>` instead of hiding the
ramp-up.** Both CTL/ATL and ACWR are mathematically well-defined from day
one (an EWMA seeded at 0, a rolling sum over however many days exist), but
the spec is explicit that early readings are not *reliable* — under 42
days CTL underreads by construction, under 28 days ACWR is being compared
against a still-forming chronic baseline. Two different shapes for the
same idea, matched to how each value degrades: CTL/ATL are still numbers
worth plotting (a trend line curving up is informative even if not fully
settled) with a flag alongside them; ACWR below 28 days is not a
meaningful *ratio* at all, so it's `None` rather than a flagged-but-wrong
number.

**TSB reads yesterday's CTL/ATL, not today's.** This is easy to get wrong
by computing `tsb` after updating `ctl_yesterday`/`atl_yesterday` for the
day — the loop computes `tsb` first, from the values still holding
yesterday's state, before those variables are overwritten. The spec's
wording ("computed from *yesterday's* values, before today's session") is
quoted verbatim in the doc comment so this doesn't quietly drift later.

**ACWR uses `saturating_sub` for partial windows, not a fixed-size
requirement.** Early days naturally get a shorter window (day 3's "7-day
acute" is really a 3-day sum) rather than needing special-cased branches —
the slice bounds do the clipping. The `acwr: None` gate for <28 days
means those partial-window numbers are never surfaced as a ratio anyway;
`acute`/`chronic` are returned regardless because a future caller (e.g. a
"days until ACWR available" progress indicator) may want them.

**rMSSD baseline and "today's reading" are separate function calls.** The
spec computes a 7-day baseline and then compares a *new* reading against
it. `hrv_baseline` takes the trailing window and `is_readiness_flag` takes
today's value plus that baseline as two arguments, rather than one
function taking 8 readings and inferring which is "today" — this keeps
the module honest about not knowing anything about calendars or which
reading is most recent; the caller decides that by what it passes in.

## What a reviewer needs to know

- `training_load_series` and `acwr_series` both take "one contiguous,
  chronologically-ordered value per day" and have **no gap-filling or
  calendar logic** — a missing rest day must already be a `0.0` in the
  input slice, not an absent index. This mirrors `streams::validate`'s
  philosophy (the invariant lives in one place) but here the invariant is
  the caller's responsibility, not something this module can check
  (there's no timestamp on a bare `f64`).
- The ACWR "spike" test (`acwr_flags_a_spike_in_recent_load`) is the
  closest thing to an end-to-end sanity check for this module: 21 days at
  30 TSS/day then 7 days at 80 TSS/day should read as "High risk" — that's
  the entire point of the metric (Gabbett's "training-injury prevention
  paradox"), and pinning the exact numbers (`560.0`, `297.5`) makes a
  future refactor that silently changes the window math fail loudly.
- The HRV functions use natural log (`f64::ln`), matching the spec's
  "log-transform reduces skew" convention from the HRV literature — not a
  base-10 log, and not a normalization trick invented locally.

## What NOT to worry about

- `variance` in `hrv_baseline` is the **population** variance (divide by
  `n`, not `n - 1`). The spec doesn't ask for an unbiased *sample*
  estimator — it asks for "rolling 7-day SD", and with a fixed small
  window (≤7) the population/sample distinction is not worth the extra
  parameter; if this becomes wrong later it's a spec change first (ADR-006
  rule), not a silent code fix.
- `acwr_band`'s boundaries are inclusive on the upper edge of each band
  (`<= 1.3` is "Sweet spot", `1.31` is "Caution") — this matches how the
  spec table reads (each row's upper bound belongs to that row) and is
  pinned by `band_labels_match_spec_thresholds`.

## Verification status

Unit tests here pin the formula identities (day-one exact fractions,
EWMA convergence, exact ACWR arithmetic on hand-computable inputs, rMSSD
hand-computed example). There is no golden-file comparison for this module
specifically — CTL/ATL/TSB/ACWR are athlete-history aggregates, not
per-FIT-file outputs, so they sit outside the F1 golden-file gate
(`docs/sports-metrics.md` §"F1 gate") which is about `metrics`/`fit`
parity across JNI/wasm/napi on a single activity.
