# Archived — Operation ZERO-DEFEITOS (Cycle 01)

**Archived:** 2026-08-07, when `qa/` was repurposed for the FitConnect v1 native-Android/Elite-Core execution protocol.

This is **not abandoned** — it's paused. It is a separate initiative from the v1 rewrite: a static + dynamic QA audit of the *current* web/mobile product (i18n across 6 locales, hero, parity matrix, hex-token grep, etc.), unrelated to the Elite Core / native Android decisions in `docs/adr/ADR-005` onward.

**State at archive time:** Phase 1 (static audit) complete. Phase 2 (dynamic testing) not started. See `STATE.json` and `HANDOFF.md` in this folder for the exact resume point — nothing here has changed since the last commit on `qa/cycle-01`.

**To resume this cycle:** read `HANDOFF.md` and `STATE.json` in this folder, pick up from `pendingSteps` in `STATE.json`. It can run on its own branch or interleave with the v1 work — the two don't touch the same code paths yet (this cycle is web/mobile UI + i18n; v1 is a new `android/` Gradle project + `elite-core` Rust crate).
