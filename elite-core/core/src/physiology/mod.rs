//! Physiology / training load — implements `docs/sports-metrics.md` §5:
//! CTL/ATL/TSB (§5.1), ACWR (§5.2), and rMSSD baseline / readiness flag
//! (§5.3). The spec is normative — if the implementation ever needs to
//! diverge, the spec changes first (ADR-006 rule). See this module's
//! `README.md` for the reasoning behind the implementation choices.

/// Time constant for CTL ("Fitness"), in days — spec §5.1.
const CTL_TIME_CONSTANT_DAYS: f64 = 42.0;
/// Time constant for ATL ("Fatigue"), in days — spec §5.1.
const ATL_TIME_CONSTANT_DAYS: f64 = 7.0;
/// Days of history before CTL/ATL are presented as reliable — spec §5.1
/// ("~6 weeks" ramp-up).
const BASELINE_DAYS: usize = 42;

/// One day's CTL/ATL/TSB, per spec §5.1 (Banister impulse-response model).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct LoadPoint {
    pub ctl: f64,
    pub atl: f64,
    /// Form — computed from *yesterday's* CTL/ATL, before today's session
    /// lands (spec is explicit on this ordering).
    pub tsb: f64,
    /// `true` once at least 42 days of history have been folded in. Below
    /// that, CTL/ATL are still computed (the EWMA is well-defined from day
    /// one) but the UI must not present them as reliable — spec calls this
    /// out explicitly rather than leaving early readings silently wrong.
    pub baseline_established: bool,
}

/// CTL/ATL/TSB series per spec §5.1, one [`LoadPoint`] per entry in
/// `daily_tss` (same length and order). `daily_tss` must be one
/// contiguous, chronologically-ordered value per calendar day, 0 for rest
/// days — this module has no calendar logic of its own and does not
/// invent or skip days; that responsibility sits with the caller
/// assembling the series from activity history.
///
/// CTL/ATL seed at 0 for an athlete with no history, per spec.
pub fn training_load_series(daily_tss: &[f64]) -> Vec<LoadPoint> {
    let mut out = Vec::with_capacity(daily_tss.len());
    let mut ctl_yesterday = 0.0_f64;
    let mut atl_yesterday = 0.0_f64;

    for (day_index, &tss_today) in daily_tss.iter().enumerate() {
        // TSB reads yesterday's numbers — the whole point of Form is "how
        // fatigued was I walking into today", not today's own session.
        let tsb = ctl_yesterday - atl_yesterday;

        let ctl_today = ctl_yesterday + (tss_today - ctl_yesterday) / CTL_TIME_CONSTANT_DAYS;
        let atl_today = atl_yesterday + (tss_today - atl_yesterday) / ATL_TIME_CONSTANT_DAYS;

        out.push(LoadPoint {
            ctl: ctl_today,
            atl: atl_today,
            tsb,
            baseline_established: day_index + 1 >= BASELINE_DAYS,
        });

        ctl_yesterday = ctl_today;
        atl_yesterday = atl_today;
    }

    out
}

/// Rolling window length for Acute load, in days — spec §5.2.
const ACUTE_WINDOW_DAYS: usize = 7;
/// Rolling window length for Chronic load, in days — spec §5.2.
const CHRONIC_WINDOW_DAYS: usize = 28;

/// One day's ACWR inputs/output, per spec §5.2 (Gabbett).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct AcwrPoint {
    /// Rolling 7-day sum of TSS, clipped to however much history exists
    /// so far (partial window during ramp-up).
    pub acute: f64,
    /// Rolling 28-day sum of TSS expressed as a weekly figure (sum / 4),
    /// same partial-window clipping as `acute`.
    pub chronic: f64,
    /// `None` below 28 days of history — spec: "requires ≥28 days of data
    /// to be meaningful; below that, report null with a 'building
    /// baseline' flag", same posture as [`LoadPoint::baseline_established`].
    pub acwr: Option<f64>,
}

/// ACWR series per spec §5.2, one [`AcwrPoint`] per entry in `daily_tss`
/// (same contiguous-daily-series contract as [`training_load_series`]).
pub fn acwr_series(daily_tss: &[f64]) -> Vec<AcwrPoint> {
    let mut out = Vec::with_capacity(daily_tss.len());

    for day_index in 0..daily_tss.len() {
        let acute_start = day_index.saturating_sub(ACUTE_WINDOW_DAYS - 1);
        let acute: f64 = daily_tss[acute_start..=day_index].iter().sum();

        let chronic_start = day_index.saturating_sub(CHRONIC_WINDOW_DAYS - 1);
        let chronic_sum: f64 = daily_tss[chronic_start..=day_index].iter().sum();
        let chronic = chronic_sum / 4.0;

        let has_enough_history = day_index + 1 >= CHRONIC_WINDOW_DAYS;
        let acwr = if has_enough_history && chronic > 0.0 {
            Some(acute / chronic)
        } else {
            None
        };

        out.push(AcwrPoint {
            acute,
            chronic,
            acwr,
        });
    }

    out
}

/// Advisory injury-risk band for an ACWR value, per spec §5.2 thresholds.
/// Never a hard block — purely descriptive labelling for the UI. Callers
/// should only invoke this on an `Some(acwr)` from [`AcwrPoint`]; there is
/// no band for "not enough history yet" here, that's the `None` case.
pub fn acwr_band(acwr: f64) -> &'static str {
    if acwr < 0.8 {
        "Undertraining"
    } else if acwr <= 1.3 {
        "Sweet spot"
    } else if acwr <= 1.5 {
        "Caution"
    } else {
        "High risk"
    }
}

/// rMSSD (root mean square of successive differences) from an RR-interval
/// series in milliseconds — the standard time-domain HRV metric, spec
/// §5.3. `None` for fewer than 2 intervals (a single interval has no
/// successive difference to measure).
pub fn rmssd_ms(rr_intervals_ms: &[f64]) -> Option<f64> {
    if rr_intervals_ms.len() < 2 {
        return None;
    }
    let sum_sq_diff: f64 = rr_intervals_ms
        .windows(2)
        .map(|pair| (pair[1] - pair[0]).powi(2))
        .sum();
    let mean_sq_diff = sum_sq_diff / (rr_intervals_ms.len() - 1) as f64;
    Some(mean_sq_diff.sqrt())
}

/// A rolling HRV baseline, per spec §5.3: log-transformed rMSSD (reduces
/// skew — standard in HRV literature) averaged with its spread over a
/// trailing window of morning readings.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct HrvBaseline {
    pub mean_ln_rmssd: f64,
    pub sd_ln_rmssd: f64,
}

/// Baseline per spec §5.3, from `recent_rmssd_ms` — the trailing window of
/// morning rMSSD readings the baseline is built from (spec: 7-day rolling;
/// callers pass up to the last 7, oldest first, *not including* the
/// reading about to be evaluated by [`is_readiness_flag`] — see this
/// module's README for why baseline and today's reading are kept
/// separate). `None` below 2 readings, since a standard deviation over a
/// single point isn't meaningful.
pub fn hrv_baseline(recent_rmssd_ms: &[f64]) -> Option<HrvBaseline> {
    if recent_rmssd_ms.len() < 2 {
        return None;
    }
    let ln_values: Vec<f64> = recent_rmssd_ms.iter().map(|v| v.ln()).collect();
    let n = ln_values.len() as f64;
    let mean = ln_values.iter().sum::<f64>() / n;
    let variance = ln_values.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / n;

    Some(HrvBaseline {
        mean_ln_rmssd: mean,
        sd_ln_rmssd: variance.sqrt(),
    })
}

/// The readiness flag per spec §5.3: `true` when `today_rmssd_ms` is more
/// than 1 SD below the baseline mean (in log space, matching how the
/// baseline itself was built). Advisory only — the actual readiness
/// *scoring* (combining HRV, sleep, soreness) stays in the app layer;
/// Elite Core only owns the rMSSD/baseline math, per spec §5.3.
pub fn is_readiness_flag(today_rmssd_ms: f64, baseline: &HrvBaseline) -> bool {
    today_rmssd_ms.ln() < baseline.mean_ln_rmssd - baseline.sd_ln_rmssd
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn day_one_from_zero_history_matches_the_formula_exactly() {
        let series = training_load_series(&[100.0]);
        assert_eq!(series.len(), 1);
        let day1 = series[0];
        assert!((day1.ctl - 100.0 / 42.0).abs() < 1e-9);
        assert!((day1.atl - 100.0 / 7.0).abs() < 1e-9);
        assert_eq!(day1.tsb, 0.0, "TSB uses yesterday's (zero) CTL/ATL");
        assert!(!day1.baseline_established);
    }

    #[test]
    fn zero_tss_forever_keeps_ctl_atl_at_zero() {
        let series = training_load_series(&[0.0; 10]);
        assert!(series.iter().all(|p| p.ctl == 0.0 && p.atl == 0.0 && p.tsb == 0.0));
    }

    #[test]
    fn constant_load_converges_ctl_and_atl_toward_the_daily_value() {
        // 500 days at a constant 50 TSS/day: both EWMAs converge
        // geometrically toward 50 (ATL, k=7, converges within a few dozen
        // days; CTL, k=42, needs the full run to get inside 0.01).
        let daily = vec![50.0; 500];
        let series = training_load_series(&daily);
        let last = series.last().unwrap();
        assert!(
            (last.ctl - 50.0).abs() < 0.01,
            "CTL should converge near 50, got {}",
            last.ctl
        );
        assert!(
            (last.atl - 50.0).abs() < 1e-6,
            "ATL should converge near 50, got {}",
            last.atl
        );
        assert!(
            last.tsb.abs() < 0.01,
            "TSB should converge near 0 once CTL≈ATL, got {}",
            last.tsb
        );
    }

    #[test]
    fn baseline_established_flips_at_42_days() {
        let series = training_load_series(&vec![30.0; 42]);
        assert!(!series[40].baseline_established, "day 41 is not yet 42");
        assert!(series[41].baseline_established, "day 42 completes the ramp-up");
    }

    #[test]
    fn acwr_is_none_before_28_days_of_history() {
        let series = acwr_series(&vec![50.0; 20]);
        assert!(series.iter().all(|p| p.acwr.is_none()));
    }

    #[test]
    fn acwr_of_constant_load_is_exactly_one_at_28_days() {
        let series = acwr_series(&vec![50.0; 28]);
        let last = series.last().unwrap();
        assert_eq!(last.acute, 350.0, "7 × 50");
        assert_eq!(last.chronic, 350.0, "28 × 50 / 4");
        assert_eq!(last.acwr, Some(1.0));
    }

    #[test]
    fn acwr_flags_a_spike_in_recent_load() {
        let mut daily = vec![30.0; 28];
        for day in daily.iter_mut().skip(21) {
            *day = 80.0; // last 7 days spike from 30 to 80/day
        }
        let series = acwr_series(&daily);
        let last = series.last().unwrap();
        assert_eq!(last.acute, 560.0, "7 × 80");
        assert_eq!(last.chronic, 297.5, "(21×30 + 7×80) / 4");
        let acwr = last.acwr.unwrap();
        assert!((acwr - 560.0 / 297.5).abs() < 1e-9);
        assert!(acwr > 1.5, "acwr {acwr} should be high risk");
        assert_eq!(acwr_band(acwr), "High risk");
    }

    #[test]
    fn band_labels_match_spec_thresholds() {
        assert_eq!(acwr_band(0.5), "Undertraining");
        assert_eq!(acwr_band(0.8), "Sweet spot");
        assert_eq!(acwr_band(1.3), "Sweet spot");
        assert_eq!(acwr_band(1.31), "Caution");
        assert_eq!(acwr_band(1.5), "Caution");
        assert_eq!(acwr_band(1.51), "High risk");
    }

    #[test]
    fn rmssd_of_constant_rr_is_zero() {
        assert_eq!(rmssd_ms(&[800.0; 10]), Some(0.0));
    }

    #[test]
    fn rmssd_needs_at_least_two_intervals() {
        assert_eq!(rmssd_ms(&[800.0]), None);
        assert_eq!(rmssd_ms(&[]), None);
    }

    #[test]
    fn rmssd_matches_hand_computed_value() {
        // Successive diffs: 800→850 (+50), 850→800 (−50). Both squared
        // diffs are 2500, mean 2500, sqrt 50.
        let rmssd = rmssd_ms(&[800.0, 850.0, 800.0]).unwrap();
        assert!((rmssd - 50.0).abs() < 1e-9);
    }

    #[test]
    fn hrv_baseline_needs_at_least_two_readings() {
        assert_eq!(hrv_baseline(&[50.0]), None);
        assert_eq!(hrv_baseline(&[]), None);
    }

    #[test]
    fn readiness_flag_triggers_more_than_one_sd_below_mean() {
        let baseline_readings = vec![50.0, 51.0, 49.0, 50.0, 52.0, 48.0, 50.0];
        let baseline = hrv_baseline(&baseline_readings).unwrap();
        assert!(
            !is_readiness_flag(50.0, &baseline),
            "a normal reading should not flag"
        );
        assert!(
            is_readiness_flag(20.0, &baseline),
            "a large HRV drop should flag"
        );
    }
}
