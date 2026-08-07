---
name: sports-metrics
description: Use when implementing, changing, or verifying any training/physiology metric (NP, IF, TSS, hrTSS, GAP, zones, CTL/ATL/TSB, ACWR, HRV, lap detection, GPS filtering) in Elite Core or anywhere that consumes its output. Load before writing formula code or a golden-file test.
---

# Sports metrics skill

## The one rule

`docs/sports-metrics.md` is the **normative spec**. Elite Core (Rust) implements exactly what's written there — nothing is coded from memory of "how TSS usually works." If an implementation needs to diverge from the doc (edge case the doc didn't cover, a formula that turns out wrong against Golden Cheetah), **the doc changes first, in the same PR, with the reason written down** — then the code follows. Never let doc and code drift apart silently.

This mirrors ADR-006's consequence: "physiology is written down before it is coded (F10 gate: professional review)." The doc is currently a draft pending that professional review — treat its formulas as the working spec, not as unquestionable truth; flag anything that looks physiologically off rather than encoding it silently.

## Where the numbers must match

Same FIT file → same output on **four targets**: Android (JNI), Wear OS (same JNI path), browser (wasm-bindgen), server (napi-rs). This is the literal F1 gate — it's not a nice-to-have, it's the thing that blocks every phase after F1.

- ≥15 golden FIT files, each with an expected-output fixture derived from a real Golden Cheetah export.
- Tolerance <1% on every metric in `docs/sports-metrics.md` §1–5, checked in CI on all four targets, not just the one you happened to build on.
- If a metric can be bit-for-bit deterministic (integer/fixed-point math, no target-specific float rounding), make it so — don't accept 1% tolerance where exact equality is achievable; reserve the tolerance budget for genuinely float-sensitive stages (e.g., the NP 4th-root, GAP polynomial).

## Working style for this domain

- **Units are SI internally, always.** Convert at the UI edge only (web component, Compose screen). A Rust function that takes miles or a Kotlin call site that passes km/h into a function expecting m/s is exactly the kind of bug golden-file tests exist to catch — write the test before the temptation to "just check it looks right."
- **Undefined is a valid, required output.** NP under 30s of data, TSS with no FTP set, CTL/ATL before 42 days of history — these must surface as `null`/"building baseline", not as 0 or a silently wrong number. A dashboard rendering a false-precise number is worse than rendering nothing.
- **Estimated vs measured is a field, not a footnote.** FTP/LTHR/threshold-pace can be user-set or estimated from recent bests (§1.5, §2.2, §3.2 of the spec). Every consumer of these values must be able to tell which — carry the flag through the API, don't collapse it before it reaches the UI.
- **Don't invent new formulas under deadline pressure.** If a phase needs a metric not yet in `docs/sports-metrics.md`, add it to the spec (with a source, §8 style) before implementing — even under a tight gate. This is the discipline the whole document exists to enforce.

## Golden Cheetah as ground truth

Golden Cheetah (`GoldenCheetah/src/Metrics` on GitHub) is the empirical check referenced throughout `docs/sports-metrics.md`. When a formula's exact constants are ambiguous between sources (e.g., minor TRIMP coefficient variants), prefer whatever produces the closer Golden Cheetah match on the golden-file set, and note the choice in the spec doc's source list — don't silently pick one.
