//! elite-core — shared domain engine for FitConnect v1.
//!
//! F0 status: skeleton. The real modules land at F1, implementing exactly
//! what is written in `docs/sports-metrics.md` (the normative spec — see
//! that file and the `sports-metrics` / `elite-core-rust` skills before
//! adding anything here):
//!
//! - `fit`        — FIT file parse/write (serde-based, fuzzed at the parser boundary)
//! - `metrics`     — NP/IF/TSS/hrTSS/GAP, power & pace curves, zones
//! - `physiology`  — rMSSD baseline, CTL/ATL/TSB, ACWR
//! - `sync`        — outbox/conflict logic for offline-first sync
//! - `guard`       — the `dataSource`/`dataRights` permission guard
//!
//! Until then, this crate exposes only a version probe so the workspace
//! and every binding target (JNI, wasm-bindgen, napi-rs) can be proven to
//! compile end-to-end.

pub mod metrics;
pub mod streams;

/// Returns the crate version, as a trivial cross-target build probe.
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_is_not_empty() {
        assert!(!version().is_empty());
    }
}
