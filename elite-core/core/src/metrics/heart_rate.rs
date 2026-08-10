//! Heart-rate training stress (no power meter) — implements
//! `docs/sports-metrics.md` §2.1: hrTSS, the Friel TRIMP-based
//! approximation calibrated per-athlete off their own LTHR.
//!
//! Heart-rate *zones* (§2.2) already live in [`crate::zones`] — this module
//! is the single hrTSS number, not the zone ladder. See this module's
//! `README.md` (folded into `metrics/README.md`) for the reasoning behind
//! the `Sex` enum and the calibration approach.

use crate::streams::ActivityStreams;

/// Sex coefficient for the TRIMP exponential weighting (spec §2.1).
///
/// The spec is explicit that the sex coefficient must never be guessed
/// silently — an athlete profile without one set defaults to `Male` only
/// with a visible "estimated" flag at the call site (app layer, §2.1 /
/// open question in spec §9). Requiring callers to supply this enum keeps
/// that decision at the boundary where the flag actually lives, instead of
/// burying a `default_to_male: bool` inside [`HrProfile`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Sex {
    Male,
    Female,
}

impl Sex {
    /// `(a, b)` in `TRIMP = Σ Δt_min × HRR% × a × e^(b × HRR%)` (spec §2.1).
    fn trimp_coefficients(self) -> (f64, f64) {
        match self {
            Sex::Male => (0.64, 1.92),
            Sex::Female => (0.86, 1.67),
        }
    }
}

/// The athlete inputs hrTSS needs. All fields are required — there is no
/// population-average fallback; a caller with an unset LTHR or resting/max
/// HR should not call this module yet (spec: "never guess silently").
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct HrProfile {
    pub hr_rest_bpm: f64,
    pub hr_max_bpm: f64,
    /// Lactate threshold heart rate — athlete-set or estimated per spec
    /// §2.2 (`0.95 × HR from best 30-min effort in last 90 days`). That
    /// estimation needs a 90-day activity window and belongs to the
    /// caller; this module only consumes the resulting number.
    pub lthr_bpm: f64,
    pub sex: Sex,
}

/// Heart-rate reserve fraction for one HR value. Deliberately unclamped:
/// a reading above the configured `hr_max_bpm` or below `hr_rest_bpm` is a
/// data/profile problem (stale max HR, athlete under-rested), not
/// something this function should silently paper over by clamping to
/// `[0, 1]` before the caller ever sees it.
fn hrr_fraction(hr_bpm: f64, profile: &HrProfile) -> f64 {
    (hr_bpm - profile.hr_rest_bpm) / (profile.hr_max_bpm - profile.hr_rest_bpm)
}

/// TRIMP contribution rate for one minute held constant at `hrr`. Shared by
/// the per-sample sum below and the threshold-hour calibration — both are
/// "integrate this HRR-driven rate over some duration in minutes".
fn trimp_rate_per_minute(hrr: f64, profile: &HrProfile) -> f64 {
    let (a, b) = profile.sex.trimp_coefficients();
    hrr * a * (b * hrr).exp()
}

/// TRIMP per spec §2.1, summed over samples with each one credited the gap
/// to the *next* sample (same "credit the gap, not the tick" convention as
/// `zones::time_in_zones` — smart/irregular recording must not be
/// penalised versus dense 1 Hz recording).
///
/// `None` when there is no HR channel, the streams fail validation, or
/// `profile.hr_max_bpm` does not exceed `hr_rest_bpm` (a non-positive HR
/// reserve makes every HRR% undefined).
pub fn trimp(streams: &ActivityStreams, profile: &HrProfile) -> Option<f64> {
    if streams.validate().is_err() || profile.hr_max_bpm <= profile.hr_rest_bpm {
        return None;
    }
    let hr = streams.heart_rate_bpm.as_ref()?;

    let mut total = 0.0_f64;
    for (i, &bpm) in hr.iter().enumerate() {
        let span_s = if i + 1 < streams.time_s.len() {
            streams.time_s[i + 1].saturating_sub(streams.time_s[i])
        } else {
            1
        };
        let dt_min = f64::from(span_s) / 60.0;
        let hrr = hrr_fraction(f64::from(bpm), profile);
        total += dt_min * trimp_rate_per_minute(hrr, profile);
    }
    Some(total)
}

/// hrTSS per spec §2.1: `TRIMP / TRIMP_at_threshold_for_1_hour × 100`,
/// calibrated to the athlete's own LTHR so an hour held exactly at
/// threshold scores 100 — parity with power-based TSS at IF 1.0
/// (`training_stress_score` in the parent module).
///
/// `None` under the same conditions as [`trimp`], or when `lthr_bpm` is at
/// or below `hr_rest_bpm` (the calibration hour would have zero or
/// negative HRR, making the denominator meaningless).
pub fn hr_tss(streams: &ActivityStreams, profile: &HrProfile) -> Option<f64> {
    let trimp_value = trimp(streams, profile)?;
    if profile.lthr_bpm <= profile.hr_rest_bpm {
        return None;
    }
    let threshold_hrr = hrr_fraction(profile.lthr_bpm, profile);
    let threshold_hour = trimp_rate_per_minute(threshold_hrr, profile) * 60.0;
    if threshold_hour <= 0.0 {
        return None;
    }
    Some(trimp_value / threshold_hour * 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn profile(sex: Sex) -> HrProfile {
        HrProfile {
            hr_rest_bpm: 50.0,
            hr_max_bpm: 190.0,
            lthr_bpm: 170.0,
            sex,
        }
    }

    fn constant_hr(secs: u32, bpm: u16) -> ActivityStreams {
        let mut s = ActivityStreams::with_time((0..secs).collect());
        s.heart_rate_bpm = Some(vec![bpm; secs as usize]);
        s
    }

    #[test]
    fn one_hour_at_lthr_scores_essentially_100_hr_tss() {
        // 3600 samples at 1 Hz: every sample (including the last, per the
        // gap-crediting convention) is credited exactly 1s, so this is a
        // clean 60-minute integral at constant threshold HR. Tolerance is
        // 1e-6, not 1e-9, because this sums 3600 floating-point terms
        // rather than evaluating one closed-form expression.
        let tss = hr_tss(&constant_hr(3600, 170), &profile(Sex::Male)).unwrap();
        assert!((tss - 100.0).abs() < 1e-6, "hrTSS {tss} should be 100");
    }

    #[test]
    fn hr_tss_scales_with_duration_at_constant_intensity() {
        let half = hr_tss(&constant_hr(1800, 170), &profile(Sex::Male)).unwrap();
        assert!(
            (half - 50.0).abs() < 1e-6,
            "30 min at LTHR should be 50 hrTSS, got {half}"
        );
    }

    #[test]
    fn easier_effort_scores_less_than_100_for_the_same_hour() {
        // 150 bpm for an hour is below LTHR (170) — must score under 100.
        let tss = hr_tss(&constant_hr(3600, 150), &profile(Sex::Male)).unwrap();
        assert!(
            tss < 100.0,
            "hrTSS {tss} should be below 100 at sub-threshold HR"
        );
    }

    #[test]
    fn harder_effort_scores_more_than_100_for_the_same_hour() {
        // 185 bpm for an hour is above LTHR — the exponential weighting
        // must push this past 100.
        let tss = hr_tss(&constant_hr(3600, 185), &profile(Sex::Male)).unwrap();
        assert!(
            tss > 100.0,
            "hrTSS {tss} should exceed 100 above threshold"
        );
    }

    #[test]
    fn male_and_female_coefficients_diverge_on_the_same_input() {
        let male = hr_tss(&constant_hr(3600, 185), &profile(Sex::Male)).unwrap();
        let female = hr_tss(&constant_hr(3600, 185), &profile(Sex::Female)).unwrap();
        assert!(
            (male - female).abs() > 0.5,
            "male {male} vs female {female} should differ meaningfully"
        );
    }

    #[test]
    fn hr_tss_is_none_without_hr_channel() {
        let s = ActivityStreams::with_time((0..120).collect());
        assert_eq!(hr_tss(&s, &profile(Sex::Male)), None);
    }

    #[test]
    fn hr_tss_is_none_with_a_degenerate_profile() {
        let s = constant_hr(60, 150);

        let mut zero_reserve = profile(Sex::Male);
        zero_reserve.hr_max_bpm = zero_reserve.hr_rest_bpm; // hr_max == hr_rest
        assert_eq!(hr_tss(&s, &zero_reserve), None, "zero HR reserve");

        let mut lthr_at_rest = profile(Sex::Male);
        lthr_at_rest.lthr_bpm = lthr_at_rest.hr_rest_bpm; // degenerate calibration
        assert_eq!(hr_tss(&s, &lthr_at_rest), None, "LTHR at resting HR");
    }

    #[test]
    fn irregular_sampling_credits_the_gap_not_the_sample() {
        // Two samples 3600s apart at exactly LTHR: TRIMP must integrate
        // over the full hour gap between them (first sample credited
        // 3600s), not treat this as ~2 instantaneous ticks — same
        // convention as zones::time_in_zones. The trailing 1s (credited to
        // the final sample) pushes the result slightly past 100.
        let mut s = ActivityStreams::with_time(vec![0, 3600]);
        s.heart_rate_bpm = Some(vec![170, 170]);
        let tss = hr_tss(&s, &profile(Sex::Male)).unwrap();
        assert!(
            tss > 100.0 && tss < 100.5,
            "hrTSS {tss} should be just over 100 (3601s credited at threshold)"
        );
    }
}
