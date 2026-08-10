//! Running pace metrics — implements `docs/sports-metrics.md` §3: Grade
//! Adjusted Pace (§3.1, Minetti cost-of-running model) and Running Stress
//! Score (§3.2). See the "pace.rs" section of `metrics/README.md` for the
//! reasoning behind the implementation choices.

use crate::streams::ActivityStreams;

/// Minetti's flat-running cost constant, `C(0)` — spec §3.1 ("≈3.6").
/// Kept as an explicit constant, rather than always calling
/// `minetti_cost(0.0)`, because it's the calibration denominator used at
/// every call site; `minetti_cost_of_flat_matches_the_constant` pins that
/// the polynomial and this constant agree.
const MINETTI_FLAT_COST: f64 = 3.6;

/// Below this absolute grade, GPS-derived elevation noise dominates the
/// signal — spec §3.1: "below ±1% grade, skip the adjustment entirely".
const GAP_FLAT_THRESHOLD: f64 = 0.01;

/// Grade is clamped to this bound before feeding the polynomial. Minetti's
/// data is validated to ±30%; Elite Core is more conservative and clamps
/// to ±20% to stay inside safely-validated territory (spec §3.1).
const GAP_GRADE_CLAMP: f64 = 0.20;

/// A distance step below this (metres) is too small to trust for a grade
/// calculation — GPS/barometer noise, not real elevation change per
/// distance. Below this, the step is treated as flat rather than dividing
/// by a near-zero run.
const MIN_TRUSTED_RUN_M: f64 = 0.5;

/// Seconds in the NGP rolling window — same value and reasoning as the NP
/// rolling window in the parent module (Coggan's 30s window, applied here
/// to GAP-adjusted speed instead of power, per spec §3.2).
const NGP_WINDOW_S: usize = 30;

/// Minetti's polynomial cost of running at gradient `g` (decimal, e.g.
/// `0.05` = 5% uphill), relative to flat running — spec §3.1:
/// `C(g) = 155.4g⁵ − 30.4g⁴ − 43.3g³ + 46.3g² + 19.5g + 3.6`.
fn minetti_cost(g: f64) -> f64 {
    155.4 * g.powi(5) - 30.4 * g.powi(4) - 43.3 * g.powi(3) + 46.3 * g.powi(2) + 19.5 * g + 3.6
}

/// Grade-adjusted equivalent flat speed for one sample, per spec §3.1:
/// `GAP_speed = actual_speed × (C(g) / C(0))` — the speed-domain form of
/// the spec's pace-domain `GAP_pace = actual_pace × (C(0) / C(g))`. The
/// two are reciprocals of each other (pace = 1/speed up to a unit
/// conversion); Elite Core works in speed because that's the stream
/// channel's unit — see `metrics/README.md`.
///
/// Grades inside `±1%` are treated as flat (input returned unchanged, spec
/// §3.1); grades beyond `±20%` are clamped before the polynomial runs.
pub fn grade_adjusted_speed_mps(actual_speed_mps: f64, grade: f64) -> f64 {
    if grade.abs() < GAP_FLAT_THRESHOLD {
        return actual_speed_mps;
    }
    let clamped = grade.clamp(-GAP_GRADE_CLAMP, GAP_GRADE_CLAMP);
    actual_speed_mps * (minetti_cost(clamped) / MINETTI_FLAT_COST)
}

/// Per-sample gradient (rise/run, decimal) from cumulative distance and
/// altitude channels of equal length. Index 0 has no previous sample to
/// measure a run against and is reported as flat (`0.0`); any step whose
/// distance delta is below [`MIN_TRUSTED_RUN_M`] is also reported as flat
/// rather than dividing by a near-zero run.
fn grade_series(distance_m: &[f64], altitude_m: &[f64]) -> Vec<f64> {
    let mut grades = vec![0.0_f64; distance_m.len()];
    for i in 1..distance_m.len() {
        let run = distance_m[i] - distance_m[i - 1];
        if run.abs() >= MIN_TRUSTED_RUN_M {
            let rise = altitude_m[i] - altitude_m[i - 1];
            grades[i] = rise / run;
        }
    }
    grades
}

/// Per-sample GAP-adjusted speed for a full activity. Requires
/// `speed_mps`, `distance_m`, and `altitude_m` channels (all three — grade
/// needs distance+altitude, the adjustment needs actual speed); `None` if
/// any is absent or the streams fail validation.
pub fn grade_adjusted_speed_series(streams: &ActivityStreams) -> Option<Vec<f64>> {
    if streams.validate().is_err() {
        return None;
    }
    let speed = streams.speed_mps.as_ref()?;
    let distance = streams.distance_m.as_ref()?;
    let altitude = streams.altitude_m.as_ref()?;

    let grades = grade_series(distance, altitude);
    Some(
        speed
            .iter()
            .zip(grades.iter())
            .map(|(&s, &g)| grade_adjusted_speed_mps(s, g))
            .collect(),
    )
}

/// Expands an irregularly-sampled `f64` series onto a 1 Hz grid, holding
/// the previous value across gaps. This is the parent module's
/// `resample_1hz_sample_and_hold` generalised from `u16` to `f64`
/// (GAP-adjusted speed is already floating point, unlike the raw power
/// channel) — duplicated rather than shared to keep each module's
/// dependency surface obvious; a third caller needing this is the signal
/// to factor it out into `streams` instead.
fn resample_1hz_sample_and_hold_f64(time_s: &[u32], values: &[f64]) -> Vec<f64> {
    let (first, last) = match (time_s.first(), time_s.last()) {
        (Some(f), Some(l)) => (*f, *l),
        _ => return Vec::new(),
    };

    let mut out = Vec::with_capacity((last - first + 1) as usize);
    let mut source_index = 0_usize;
    for second in first..=last {
        while source_index + 1 < time_s.len() && time_s[source_index + 1] <= second {
            source_index += 1;
        }
        out.push(values[source_index]);
    }
    out
}

/// Normalized Graded Pace (NGP) per spec §3.2: the same 30s-rolling /
/// 4th-power / 4th-root treatment as Normalized Power, applied to
/// GAP-adjusted speed instead of raw power. `None` below 30s of data
/// (same "undefined, not 0" posture as NP) or when a required channel is
/// missing.
pub fn normalized_graded_pace(streams: &ActivityStreams) -> Option<f64> {
    let gap_speed = grade_adjusted_speed_series(streams)?;
    let per_second = resample_1hz_sample_and_hold_f64(&streams.time_s, &gap_speed);
    if per_second.len() < NGP_WINDOW_S {
        return None;
    }

    let mut sum_pow4 = 0.0_f64;
    let mut window_count = 0_usize;
    for window in per_second.windows(NGP_WINDOW_S) {
        let mean: f64 = window.iter().sum::<f64>() / NGP_WINDOW_S as f64;
        sum_pow4 += mean.powi(4);
        window_count += 1;
    }

    Some((sum_pow4 / window_count as f64).powf(0.25))
}

/// Intensity Factor for pace, per spec §3.2:
/// `IF_pace = NGP / threshold_pace_speed`. `threshold_pace_speed_mps` is
/// the athlete's threshold running speed in m/s (the reciprocal of a
/// threshold pace like min/km — that conversion is a UI concern). `None`
/// when the threshold speed is unset/non-positive.
pub fn intensity_factor_pace(ngp: f64, threshold_pace_speed_mps: f64) -> Option<f64> {
    if threshold_pace_speed_mps > 0.0 {
        Some(ngp / threshold_pace_speed_mps)
    } else {
        None
    }
}

/// Running Stress Score per spec §3.2:
/// `rTSS = (duration_s × NGP × IF_pace) / (threshold_pace_speed × 3600) × 100`.
/// Structurally identical to power-based TSS with NGP/threshold-speed in
/// place of NP/FTP — an hour run exactly at threshold speed scores 100 by
/// construction, same as power TSS at FTP. `None` when the threshold speed
/// is unset/non-positive.
pub fn running_stress_score(
    duration_s: u32,
    ngp: f64,
    threshold_pace_speed_mps: f64,
) -> Option<f64> {
    let if_pace = intensity_factor_pace(ngp, threshold_pace_speed_mps)?;
    Some((f64::from(duration_s) * ngp * if_pace) / (threshold_pace_speed_mps * 3600.0) * 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn minetti_cost_of_flat_matches_the_constant() {
        assert_eq!(minetti_cost(0.0), MINETTI_FLAT_COST);
    }

    #[test]
    fn grade_adjusted_speed_is_unchanged_below_flat_threshold() {
        assert_eq!(grade_adjusted_speed_mps(3.0, 0.005), 3.0);
        assert_eq!(grade_adjusted_speed_mps(3.0, -0.005), 3.0);
        assert_eq!(grade_adjusted_speed_mps(3.0, 0.0), 3.0);
    }

    #[test]
    fn uphill_grade_increases_equivalent_flat_speed() {
        let adjusted = grade_adjusted_speed_mps(3.0, 0.05);
        assert!(
            adjusted > 3.0,
            "uphill GAP speed {adjusted} should exceed actual speed 3.0"
        );
    }

    #[test]
    fn moderate_downhill_grade_decreases_equivalent_flat_speed() {
        // Minetti's cost curve dips below flat cost at moderate downhill
        // grades (running downhill is metabolically cheaper) before
        // rising again at steep grades — -5% is well inside the "cheaper"
        // range.
        let adjusted = grade_adjusted_speed_mps(3.0, -0.05);
        assert!(
            adjusted < 3.0,
            "moderate downhill GAP speed {adjusted} should be below actual speed 3.0"
        );
    }

    #[test]
    fn grade_is_clamped_beyond_twenty_percent() {
        let extreme = grade_adjusted_speed_mps(3.0, 0.50);
        let at_clamp_boundary = grade_adjusted_speed_mps(3.0, 0.20);
        assert_eq!(extreme, at_clamp_boundary);

        let extreme_down = grade_adjusted_speed_mps(3.0, -0.50);
        let at_clamp_boundary_down = grade_adjusted_speed_mps(3.0, -0.20);
        assert_eq!(extreme_down, at_clamp_boundary_down);
    }

    fn flat_run(secs: u32, speed_mps: f64) -> ActivityStreams {
        let mut s = ActivityStreams::with_time((0..secs).collect());
        s.speed_mps = Some(vec![speed_mps; secs as usize]);
        s.distance_m = Some((0..secs).map(|t| f64::from(t) * speed_mps).collect());
        s.altitude_m = Some(vec![100.0; secs as usize]);
        s
    }

    /// A run at constant actual speed and constant grade throughout.
    fn graded_run(secs: u32, speed_mps: f64, grade: f64) -> ActivityStreams {
        let mut s = ActivityStreams::with_time((0..secs).collect());
        s.speed_mps = Some(vec![speed_mps; secs as usize]);
        let distances: Vec<f64> = (0..secs).map(|t| f64::from(t) * speed_mps).collect();
        let altitudes: Vec<f64> = distances.iter().map(|d| d * grade).collect();
        s.distance_m = Some(distances);
        s.altitude_m = Some(altitudes);
        s
    }

    #[test]
    fn ngp_of_flat_constant_pace_equals_that_speed() {
        let ngp = normalized_graded_pace(&flat_run(120, 3.0)).unwrap();
        assert!((ngp - 3.0).abs() < 1e-9, "NGP {ngp} should equal 3.0");
    }

    #[test]
    fn ngp_is_undefined_below_30_seconds() {
        assert_eq!(normalized_graded_pace(&flat_run(29, 3.0)), None);
        assert!(normalized_graded_pace(&flat_run(30, 3.0)).is_some());
    }

    #[test]
    fn ngp_is_none_without_required_channels() {
        let mut s = ActivityStreams::with_time((0..60).collect());
        s.speed_mps = Some(vec![3.0; 60]); // distance_m / altitude_m missing
        assert_eq!(normalized_graded_pace(&s), None);
    }

    #[test]
    fn uphill_run_produces_higher_ngp_than_actual_speed() {
        let ngp = normalized_graded_pace(&graded_run(120, 3.0, 0.05)).unwrap();
        assert!(ngp > 3.0, "NGP {ngp} should exceed actual speed 3.0 uphill");
    }

    #[test]
    fn downhill_run_produces_lower_ngp_than_actual_speed() {
        let ngp = normalized_graded_pace(&graded_run(120, 3.0, -0.05)).unwrap();
        assert!(
            ngp < 3.0,
            "NGP {ngp} should be below actual speed 3.0 downhill"
        );
    }

    #[test]
    fn near_zero_distance_step_does_not_explode_the_grade() {
        let mut s = ActivityStreams::with_time(vec![0, 1, 2]);
        s.speed_mps = Some(vec![3.0, 3.0, 3.0]);
        // Sub-half-metre steps: GPS noise, not real movement.
        s.distance_m = Some(vec![0.0, 0.05, 0.10]);
        // An implausible 10m jump over 0.05m of travel — if this were
        // treated as a real grade it would be a ~20000% slope.
        s.altitude_m = Some(vec![100.0, 110.0, 100.0]);

        let gap = grade_adjusted_speed_series(&s).unwrap();
        assert!(
            gap.iter().all(|v| (v - 3.0).abs() < 1e-9),
            "untrustworthy sub-0.5m steps must be treated as flat: {gap:?}"
        );
    }

    #[test]
    fn intensity_factor_pace_matches_spec() {
        assert_eq!(intensity_factor_pace(3.0, 3.0), Some(1.0));
        assert_eq!(intensity_factor_pace(2.4, 3.0), Some(0.8));
        assert_eq!(intensity_factor_pace(3.0, 0.0), None);
        assert_eq!(intensity_factor_pace(3.0, -1.0), None);
    }

    #[test]
    fn one_hour_at_threshold_pace_scores_exactly_100_rtss() {
        let rtss = running_stress_score(3600, 3.0, 3.0).unwrap();
        assert!((rtss - 100.0).abs() < 1e-9, "rTSS {rtss} should be 100");
    }

    #[test]
    fn rtss_scales_with_duration_and_intensity() {
        let half = running_stress_score(1800, 3.0, 3.0).unwrap();
        assert!((half - 50.0).abs() < 1e-9);
        // IF = 0.8 for an hour: duration_h × IF² × 100 = 64.
        let easy = running_stress_score(3600, 2.4, 3.0).unwrap();
        assert!((easy - 64.0).abs() < 1e-9);
        assert_eq!(running_stress_score(3600, 2.4, 0.0), None);
    }
}
