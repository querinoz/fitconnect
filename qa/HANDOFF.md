# HANDOFF — 2026-08-07 (Phase 00 complete — AWAITING APPROVAL)

## STOP condition

**Phase 00 architecture reset is documented under `docs/phase-00/`.** No product code was changed for it. **Do not start Phase 01 until Eduardo approves** (or requests amendments). Elite Core F1 code already in progress from earlier instructions may continue only if explicitly re-confirmed; default under the Phase 00 prompt is STOP.

## Where things stand

**Gate F0 is closed** (`qa/reports/gate-F0.md`). Everything compiles and is verified locally:

- `elite-core/` (Rust): 16 tests, clippy/fmt clean, wasm32 builds. First two real F1 modules are in — `streams` and `metrics` (NP/IF/TSS), each with the D1 reviewer-README.
- `android/`: 4 modules build green (`gradlew build`, lint + unit + assemble). Wrapper 9.5.0 committed; AGP 9 built-in Kotlin (do NOT re-add the `kotlin.android` plugin — it now conflicts).
- Tokens: `pnpm tokens:kotlin` / `tokens:kotlin:check` (drift-gated in CI). `apps/mobile` frozen and out of the CI graph.
- Web: 236/236 unit tests after the CI edits.

## What's next (F1, in order)

1. `fit` module in elite-core — parser to `ActivityStreams` (serde, fuzz the boundary). This unblocks golden files.
2. Remaining metrics slices: power curve, GAP/pace, HR/hrTSS, zones → then physiology (CTL/ATL/TSB, ACWR, rMSSD).
3. Golden set: ≥15 real FIT files + Golden Cheetah reference values. **Owner: real files from your devices beat public samples** — drop them in `elite-core/testdata/` if you have them.
4. Real bindings (UniFFI AAR, wasm-pack, napi) + the cross-target parity test — that test IS the F1 gate.

## What needs the owner (unchanged unless noted)

- D3 hardware, D4 legal — see HUMAN-QUEUE (unchanged).
- MCP visual-verification tooling before F3 (unchanged).
- NEW: veto window on `applicationId com.fitconnect.android` (named assumption, cheap to change until first Play upload).
- NEW: after push, confirm the two new GitHub workflows (elite-core-rust, android) run green — the "CI verde" item is conditional on that.

## Honest notes

- This session ran in Cursor, not Claude Code/Cowork (D6): docs came from official sources via web search; Android verification was CLI (gradle) only — no emulator screen. Fine for F0/F1, not fine from F3 on.
- `qa/reports/android-build-f0.log` is the raw build evidence.
