//! UniFFI façade for elite-core — minimal Path A foundation.
//! Full XCFramework generation on Windows = BLOCKED_EXTERNAL (needs macOS).

uniffi::setup_scaffolding!();

use elite_core::zones::{zone_for, HEART_RATE_ZONES};

/// Crate / binding version probe.
#[uniffi::export]
pub fn version() -> String {
    elite_core::version().to_string()
}

/// LTHR 5-zone index (1–5) for a heart-rate sample, or 0 if unknown.
#[uniffi::export]
pub fn heart_rate_zone(bpm: f64, lthr_bpm: f64) -> u8 {
    if lthr_bpm <= 0.0 {
        return 0;
    }
    zone_for(bpm, lthr_bpm, &HEART_RATE_ZONES)
        .map(|z| z.index as u8)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_nonempty() {
        assert!(!version().is_empty());
    }

    #[test]
    fn lthr_boundaries_170() {
        let lthr = 170.0;
        assert_eq!(heart_rate_zone(100.0, lthr), 1);
        assert_eq!(heart_rate_zone(138.0, lthr), 2);
        assert_eq!(heart_rate_zone(153.0, lthr), 3);
        assert_eq!(heart_rate_zone(160.0, lthr), 4);
        assert_eq!(heart_rate_zone(170.0, lthr), 5);
        assert_eq!(heart_rate_zone(150.0, 0.0), 0);
    }
}
