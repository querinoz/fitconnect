//! elite-core — shared domain engine for FitConnect v1.
//!
//! F1 in progress: real modules land incrementally, implementing exactly
//! what is written in `docs/sports-metrics.md` (the normative spec — see
//! that file and the `sports-metrics` / `elite-core-rust` skills before
//! adding anything here):
//!
//! - `streams`     — done: the typed `ActivityStreams` time-series model + validation
//! - `metrics`     — done: NP/IF/TSS/power curve (§1), hrTSS (§2.1), GAP/NGP/rTSS (§3)
//! - `zones`       — done: power 7-zone (§4) + HR 5-zone (§2.2), time-in-zone
//! - `physiology`  — done: CTL/ATL/TSB (§5.1), ACWR (§5.2), rMSSD baseline + readiness flag (§5.3)
//! - `fit`         — pending: FIT file parse/write (serde-based, fuzzed at the parser boundary)
//! - `sync`        — pending: outbox/conflict logic for offline-first sync
//! - `guard`       — pending: the `dataSource`/`dataRights` permission guard
//!
//! This crate also exposes a version probe so the workspace and every
//! binding target (JNI, wasm-bindgen, napi-rs) can be proven to compile
//! end-to-end.

pub mod metrics;
pub mod physiology;
pub mod streams;
pub mod zones;

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
