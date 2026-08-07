# `streams` — activity time-series model

The data structure every other Elite Core module consumes: `fit` produces it,
`metrics`/`physiology`/`laps` read it, F4's capture pipeline appends to it.
Written per the D1 rule: conservative, explicit Rust, reviewable by someone
learning the language while reviewing.

## Why this shape

**Struct-of-vectors, not vector-of-structs.** An activity is stored as one
`Vec` per channel (`time_s`, `heart_rate_bpm`, `power_w`, …) instead of one
`Vec<Sample>` where each sample holds every field. Two reasons:

1. Real recordings are ragged — a run has no power, a pool swim has no GPS.
   Column form makes an absent channel a single `None` instead of a million
   `None`s sprinkled through sample structs.
2. Metrics consume whole channels at a time (NP wants all watts, GAP wants
   all gradients). Column form hands each metric exactly the slice it needs.

**`time_s` is the mandatory spine.** Every optional channel, when present,
must be exactly as long as `time_s` — sample *i* of every channel happened at
`time_s[i]`. `validate()` enforces this and is the single place the invariant
lives. Consumers call it once at their boundary, then index freely.

**Units live in the field names** (`_s`, `_m`, `_bpm`, `_w`, `_mps`). Boring
on purpose: a unit mistake becomes visible at the call site instead of hiding
behind a pretty name.

## What a reviewer needs to know

- `Option<Vec<T>>` = "this channel may be absent entirely"; an empty `Vec`
  inside `Some` is a validation error (length mismatch), not a valid state.
- `windows(2)` yields overlapping pairs — the monotonic-time check compares
  each sample to its predecessor.
- `saturating_sub` in `elapsed_s` cannot underflow; time is validated as
  strictly increasing, but this function is also callable pre-validation, so
  it stays safe on garbage input rather than panicking.
- Integer widths (`u16` for HR/power, `u8` for cadence, `i8` for °C) mirror
  the FIT profile's own field sizes — the parser can move values across
  without lossy casts.

## What NOT to worry about

- `#[derive(Debug, Clone, Default, PartialEq)]` — standard idiom, gives
  test assertions and copies for free.
- The repetitive `check_len` calls in `validate()` — a macro could compress
  them; we deliberately didn't (greppability > brevity, per the
  `elite-core-rust` skill).
- `StreamsError` being a closed enum with no `#[non_exhaustive]` — adding a
  variant later is a *wanted* breaking change: every consumer is forced to
  handle the new case at compile time.

## Deliberately absent (yet)

- Serde derives — arrive with the `fit` module so serialization choices are
  made once, next to the format that needs them.
- Gap/pause handling, smoothing, moving-time — those are *interpretations*
  of the data and belong to `metrics`, not to the raw model.
