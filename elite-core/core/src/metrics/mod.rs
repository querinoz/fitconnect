//! Power metrics — implements `docs/sports-metrics.md` §1 exactly.
//!
//! F1 slice 1: Normalized Power (§1.1), Intensity Factor (§1.2), and
//! Training Stress Score (§1.3). Power curves, pace/GAP, HR metrics and
//! physiology land in later slices of F1. See this module's `README.md`
//! for the reasoning behind the implementation choices.

use crate::streams::ActivityStreams;

/// Seconds in the NP rolling window (Coggan's constant, spec §1.1).
const NP_WINDOW_S: usize = 30;

/// Normalized Power per spec §1.1 (Coggan):
///
/// 1. Resample power to 1 Hz, sample-and-hold across recording gaps.
/// 2. 30-second rolling average of that series.
/// 3. Mean of each rolling value raised to the 4th power.
/// 4. 4th root of that mean.
///
/// Returns `None` (never 0 or the raw average — spec is explicit) when the
/// activity has no power channel, is shorter than 30 seconds, or the
/// streams fail validation.
pub fn normalized_power(streams: &ActivityStreams) -> Option<f64> {
    if streams.validate().is_err() {
        return None;
    }
    let power = streams.power_w.as_ref()?;

    let per_second = resample_1hz_sample_and_hold(&streams.time_s, power);
    if per_second.len() < NP_WINDOW_S {
        return None; // spec: NP undefined below 30s of data
    }

    let mut sum_pow4 = 0.0_f64;
    let mut window_count = 0_usize;
    for window in per_second.windows(NP_WINDOW_S) {
        let mean: f64 = window.iter().sum::<f64>() / NP_WINDOW_S as f64;
        sum_pow4 += mean.powi(4);
        window_count += 1;
    }

    Some((sum_pow4 / window_count as f64).powf(0.25))
}

/// Intensity Factor per spec §1.2: `IF = NP / FTP`.
///
/// `None` when FTP is unset or non-positive (an FTP of 0 would make IF
/// infinite, which is a data problem, not a training intensity).
pub fn intensity_factor(np: f64, ftp: f64) -> Option<f64> {
    if ftp > 0.0 {
        Some(np / ftp)
    } else {
        None
    }
}

/// Training Stress Score per spec §1.3:
/// `TSS = (duration_s × NP × IF) / (FTP × 3600) × 100`.
///
/// `None` when FTP is unset/non-positive. One hour ridden exactly at FTP
/// scores 100 by construction — the unit tests pin that identity.
pub fn training_stress_score(duration_s: u32, np: f64, ftp: f64) -> Option<f64> {
    let if_ = intensity_factor(np, ftp)?;
    Some((f64::from(duration_s) * np * if_) / (ftp * 3600.0) * 100.0)
}

/// Expands an irregularly-sampled series onto a 1 Hz grid from the first
/// to the last timestamp, holding the previous value across gaps
/// ("sample-and-hold", spec §1.1 step 1).
///
/// Assumes `time_s` is strictly increasing and the two slices are the
/// same length — both guaranteed by `ActivityStreams::validate`, which
/// every public function in this module calls first.
fn resample_1hz_sample_and_hold(time_s: &[u32], values: &[u16]) -> Vec<f64> {
    let (first, last) = match (time_s.first(), time_s.last()) {
        (Some(f), Some(l)) => (*f, *l),
        _ => return Vec::new(),
    };

    let mut out = Vec::with_capacity((last - first + 1) as usize);
    let mut source_index = 0_usize;
    for second in first..=last {
        // Advance to the newest sample at or before `second`. The outer
        // loop and this cursor each move forward only, so the whole
        // resample is a single O(n + duration) pass.
        while source_index + 1 < time_s.len() && time_s[source_index + 1] <= second {
            source_index += 1;
        }
        out.push(f64::from(values[source_index]));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Streams with 1 Hz power for `secs` seconds at constant `watts`.
    fn constant_power(secs: u32, watts: u16) -> ActivityStreams {
        let mut s = ActivityStreams::with_time((0..secs).collect());
        s.power_w = Some(vec![watts; secs as usize]);
        s
    }

    #[test]
    fn np_of_constant_power_is_that_power() {
        let np = normalized_power(&constant_power(120, 200)).unwrap();
        assert!((np - 200.0).abs() < 1e-9, "NP {np} should equal 200");
    }

    #[test]
    fn np_is_undefined_below_30_seconds() {
        assert_eq!(normalized_power(&constant_power(29, 200)), None);
        // Exactly 30s of samples (0..30) is the defined boundary.
        assert!(normalized_power(&constant_power(30, 200)).is_some());
    }

    #[test]
    fn np_is_undefined_without_power_channel() {
        let s = ActivityStreams::with_time((0..120).collect());
        assert_eq!(normalized_power(&s), None);
    }

    #[test]
    fn np_of_variable_power_exceeds_average_power() {
        // 60s at 100W then 60s at 300W: average 200W, NP must be higher —
        // the 4th-power weighting penalises variability (Coggan's point).
        let mut s = ActivityStreams::with_time((0..120).collect());
        let mut watts = vec![100_u16; 60];
        watts.extend(vec![300_u16; 60]);
        s.power_w = Some(watts);

        let np = normalized_power(&s).unwrap();
        assert!(np > 200.0, "NP {np} should exceed the 200W average");
        assert!(np < 300.0, "NP {np} cannot exceed the max effort");
    }

    #[test]
    fn gaps_are_sample_and_held() {
        // Samples at t=0 and t=60 only; the held value makes the series
        // constant 250W, so NP is exactly 250.
        let mut s = ActivityStreams::with_time(vec![0, 60]);
        s.power_w = Some(vec![250, 250]);
        let np = normalized_power(&s).unwrap();
        assert!((np - 250.0).abs() < 1e-9, "NP {np} should equal 250");
    }

    #[test]
    fn intensity_factor_matches_spec() {
        assert_eq!(intensity_factor(250.0, 250.0), Some(1.0));
        assert_eq!(intensity_factor(200.0, 250.0), Some(0.8));
        assert_eq!(intensity_factor(200.0, 0.0), None);
        assert_eq!(intensity_factor(200.0, -5.0), None);
    }

    #[test]
    fn one_hour_at_ftp_scores_exactly_100_tss() {
        let tss = training_stress_score(3600, 250.0, 250.0).unwrap();
        assert!((tss - 100.0).abs() < 1e-9, "TSS {tss} should be 100");
    }

    #[test]
    fn tss_scales_with_duration_and_intensity() {
        // 30 min at FTP = 50 TSS.
        let half = training_stress_score(1800, 250.0, 250.0).unwrap();
        assert!((half - 50.0).abs() < 1e-9);
        // 1h at IF 0.8 = 64 TSS (duration_h × IF² × 100).
        let easy = training_stress_score(3600, 200.0, 250.0).unwrap();
        assert!((easy - 64.0).abs() < 1e-9);
        // No FTP, no TSS.
        assert_eq!(training_stress_score(3600, 200.0, 0.0), None);
    }
}
