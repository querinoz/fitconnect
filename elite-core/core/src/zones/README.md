# `zones` — training zones and time-in-zone

Implements `docs/sports-metrics.md` §4 (7-zone Coggan power ladder) and §2.2
(5-zone HR ladder keyed off LTHR), plus the time-in-zone distribution that
every post-activity summary and coach dashboard renders.

## Why it looks the way it does

**Zones store only a lower bound.** A `Zone` has `lower_fraction` and no
upper bound — the ceiling is implicitly the next zone's floor, and the top
zone is open-ended. Written the obvious way (a `lower`/`upper` pair per
zone) it is possible to typo a ladder that overlaps at 90–91% or leaves a
gap; with floors only, that is unrepresentable. The ladder is a `const`
array, so the spec table and the code are line-for-line comparable during
review.

**Lookup walks the ladder from the top down** and takes the first floor the
value clears. That gives inclusive-lower/exclusive-upper semantics for free
(exactly 91% of FTP is Threshold, not Tempo) without any boundary
arithmetic to get wrong.

**Boundaries resolve to whole watts/bpm, not to percentages.** The obvious
implementation compares `value / reference >= lower_fraction`, and it is
subtly wrong: 0.81 has no exact `f64` representation, so an athlete sitting
*exactly* on the Z2 floor (138 bpm at LTHR 170) landed in Z1. Since that is
precisely where athletes spend their time, the comparison happens in
absolute units instead — `zone_floor` computes `reference × fraction`
rounded to a whole unit. This also matches how devices and coaches state
zones ("Z2: 138–152 bpm"), so our numbers agree with the athlete's watch
instead of differing by one unit. A regression test sweeps several LTHR
values and asserts the floor value is always in its own zone.

**One shared `time_in_zones` for both ladders.** Power and HR differ only in
their ladder and reference value, so the bucketing logic exists once.

**Each sample is credited the gap to the next sample, not one second.**
Smart-recording devices write a sample every 5–10s when nothing changes;
crediting 1 second per sample would report a 3-hour ride as 20 minutes of
training. The final sample gets 1 second because it has no successor to
measure against. There is a test pinning exactly this.

## What a reviewer needs to know

- `.rev()` reverses the iterator so `.find()` returns the *highest* matching
  zone; `.copied()` turns `Option<&Zone>` into `Option<Zone>` (`Zone` is
  `Copy`, so this is free).
- `zone.index` is 1-based to match how athletes speak ("zone 2"), so the
  array index is `index - 1`. That subtraction appears twice and is the one
  place an off-by-one could hide — both are covered by the sum-to-duration
  test.
- `saturating_sub` on the gap cannot underflow; time is validated as
  strictly increasing upstream, and this keeps the function safe if that
  ever changes.

## What NOT to worry about

- `&[Zone]` parameters rather than a generic or trait — deliberately plain;
  there are exactly two ladders and no reason to abstract over them.
- Returning `Vec<ZoneTime>` including zero-second zones — the UI wants a
  full ladder to render, not just the occupied rungs.

## Deliberately absent

- Pace zones — spec §3 defines pace via GAP/threshold pace; that lands with
  the pace metrics slice, and will reuse `zone_for` with its own ladder.
- Athlete-custom ladders (some coaches use 6-zone HR). The `zone_for` /
  `time_in_zones` split already accepts any ladder, so this is a data
  question for F2, not a code change here.
