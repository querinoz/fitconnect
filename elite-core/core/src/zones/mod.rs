//! Training zones — implements `docs/sports-metrics.md` §4 (7-zone Coggan
//! power) and §2.2 (5-zone HR, keyed off LTHR), plus the time-in-zone
//! distribution every summary screen needs.
//!
//! See this module's `README.md` for why zones are modelled as an ordered
//! ladder of boundaries rather than a hand-written if/else chain.

use crate::streams::ActivityStreams;

/// A single zone: its 1-based index, human label, and the inclusive lower
/// bound as a fraction of the reference value (FTP for power, LTHR for HR).
///
/// The upper bound is implicit — it is the next zone's lower bound, and
/// the top zone is open-ended. Storing only lower bounds makes it
/// impossible to write an overlapping or gapped ladder by accident.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Zone {
    pub index: u8,
    pub label: &'static str,
    pub lower_fraction: f64,
}

/// Power zones per spec §4 (Coggan 7-zone, % of FTP).
pub const POWER_ZONES: [Zone; 7] = [
    Zone {
        index: 1,
        label: "Active Recovery",
        lower_fraction: 0.00,
    },
    Zone {
        index: 2,
        label: "Endurance",
        lower_fraction: 0.55,
    },
    Zone {
        index: 3,
        label: "Tempo",
        lower_fraction: 0.76,
    },
    Zone {
        index: 4,
        label: "Threshold",
        lower_fraction: 0.91,
    },
    Zone {
        index: 5,
        label: "VO2max",
        lower_fraction: 1.06,
    },
    Zone {
        index: 6,
        label: "Anaerobic",
        lower_fraction: 1.21,
    },
    Zone {
        index: 7,
        label: "Neuromuscular",
        lower_fraction: 1.51,
    },
];

/// Heart-rate zones per spec §2.2 (5-zone, % of LTHR).
pub const HEART_RATE_ZONES: [Zone; 5] = [
    Zone {
        index: 1,
        label: "Recovery",
        lower_fraction: 0.00,
    },
    Zone {
        index: 2,
        label: "Endurance",
        lower_fraction: 0.81,
    },
    Zone {
        index: 3,
        label: "Tempo",
        lower_fraction: 0.90,
    },
    Zone {
        index: 4,
        label: "Threshold",
        lower_fraction: 0.94,
    },
    Zone {
        index: 5,
        label: "VO2max+",
        lower_fraction: 1.00,
    },
];

/// Seconds spent in one zone.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ZoneTime {
    pub index: u8,
    pub label: &'static str,
    pub seconds: u32,
}

/// The absolute lower bound of a zone, in whole watts or bpm.
///
/// Boundaries are resolved in absolute units and rounded to whole units —
/// see the README. Comparing `value / reference >= lower_fraction` instead
/// would be at the mercy of floating-point representation exactly on a
/// boundary (0.81 has no exact `f64`), which is precisely where athletes
/// spend their time.
pub fn zone_floor(reference: f64, zone: &Zone) -> f64 {
    (reference * zone.lower_fraction).round()
}

/// Which zone a value falls into, given a zone ladder and the athlete's
/// reference value (FTP or LTHR).
///
/// Returns `None` when the reference is non-positive — an FTP of 0 makes
/// every boundary meaningless, which is a data problem, not zone 7.
pub fn zone_for(value: f64, reference: f64, ladder: &[Zone]) -> Option<Zone> {
    if reference <= 0.0 || !value.is_finite() {
        return None;
    }

    // Walk from the top down and take the first zone whose floor we clear.
    // The bottom zone's floor is 0, so any non-negative value matches.
    ladder
        .iter()
        .rev()
        .find(|zone| value >= zone_floor(reference, zone))
        .copied()
}

/// Time-in-zone distribution over a channel, in seconds.
///
/// Each sample is credited with the gap to the *next* sample (the last
/// sample gets 1 second, since a recording's final tick has no successor
/// to measure against). Samples that fall outside any zone — only
/// possible with a bad reference — are dropped rather than bucketed
/// arbitrarily.
fn time_in_zones(time_s: &[u32], values: &[f64], reference: f64, ladder: &[Zone]) -> Vec<ZoneTime> {
    let mut seconds = vec![0_u32; ladder.len()];

    for (i, value) in values.iter().enumerate() {
        let span = if i + 1 < time_s.len() {
            time_s[i + 1].saturating_sub(time_s[i])
        } else {
            1
        };
        if let Some(zone) = zone_for(*value, reference, ladder) {
            seconds[(zone.index - 1) as usize] += span;
        }
    }

    ladder
        .iter()
        .map(|zone| ZoneTime {
            index: zone.index,
            label: zone.label,
            seconds: seconds[(zone.index - 1) as usize],
        })
        .collect()
}

/// Time in each power zone (spec §4). `None` when there is no power
/// channel, FTP is unset, or the streams fail validation.
pub fn power_time_in_zones(streams: &ActivityStreams, ftp: f64) -> Option<Vec<ZoneTime>> {
    if streams.validate().is_err() || ftp <= 0.0 {
        return None;
    }
    let power: Vec<f64> = streams
        .power_w
        .as_ref()?
        .iter()
        .map(|w| f64::from(*w))
        .collect();
    Some(time_in_zones(&streams.time_s, &power, ftp, &POWER_ZONES))
}

/// Time in each heart-rate zone (spec §2.2). `None` when there is no HR
/// channel, LTHR is unset, or the streams fail validation.
pub fn heart_rate_time_in_zones(streams: &ActivityStreams, lthr: f64) -> Option<Vec<ZoneTime>> {
    if streams.validate().is_err() || lthr <= 0.0 {
        return None;
    }
    let hr: Vec<f64> = streams
        .heart_rate_bpm
        .as_ref()?
        .iter()
        .map(|bpm| f64::from(*bpm))
        .collect();
    Some(time_in_zones(&streams.time_s, &hr, lthr, &HEART_RATE_ZONES))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn power_zone_floors_are_whole_watts() {
        let ftp = 250.0;
        let floors: Vec<f64> = POWER_ZONES.iter().map(|z| zone_floor(ftp, z)).collect();
        // 0 / 55% / 76% / 91% / 106% / 121% / 151% of 250W, rounded.
        assert_eq!(floors, vec![0.0, 138.0, 190.0, 228.0, 265.0, 303.0, 378.0]);
    }

    #[test]
    fn power_zone_boundaries_match_spec() {
        let ftp = 250.0;
        // A value exactly on a floor belongs to the higher zone.
        assert_eq!(zone_for(0.0, ftp, &POWER_ZONES).unwrap().index, 1);
        assert_eq!(zone_for(137.0, ftp, &POWER_ZONES).unwrap().index, 1);
        assert_eq!(zone_for(138.0, ftp, &POWER_ZONES).unwrap().index, 2);
        assert_eq!(zone_for(227.0, ftp, &POWER_ZONES).unwrap().index, 3);
        assert_eq!(zone_for(228.0, ftp, &POWER_ZONES).unwrap().index, 4);
        assert_eq!(zone_for(250.0, ftp, &POWER_ZONES).unwrap().index, 4); // 100% = threshold
        assert_eq!(zone_for(265.0, ftp, &POWER_ZONES).unwrap().index, 5);
        assert_eq!(zone_for(400.0, ftp, &POWER_ZONES).unwrap().index, 7);
    }

    #[test]
    fn heart_rate_zone_boundaries_match_spec() {
        let lthr = 170.0;
        // 81% of 170 = 137.7 → the Z2 floor is 138 bpm, the number a
        // device would display. 137 is still Z1.
        assert_eq!(zone_for(100.0, lthr, &HEART_RATE_ZONES).unwrap().index, 1);
        assert_eq!(zone_for(137.0, lthr, &HEART_RATE_ZONES).unwrap().index, 1);
        assert_eq!(zone_for(138.0, lthr, &HEART_RATE_ZONES).unwrap().index, 2);
        assert_eq!(zone_for(153.0, lthr, &HEART_RATE_ZONES).unwrap().index, 3);
        assert_eq!(zone_for(160.0, lthr, &HEART_RATE_ZONES).unwrap().index, 4);
        assert_eq!(zone_for(170.0, lthr, &HEART_RATE_ZONES).unwrap().index, 5);
    }

    #[test]
    fn boundaries_are_stable_where_percentages_are_not_representable() {
        // Regression guard: 0.81 has no exact f64. Dividing (value /
        // reference >= 0.81) put an athlete sitting exactly on the Z2
        // floor into Z1. Resolving the floor in absolute units fixes it
        // for every reference value, not just this one.
        for lthr in [150.0, 165.0, 170.0, 178.0, 190.0] {
            let floor = zone_floor(lthr, &HEART_RATE_ZONES[1]);
            assert_eq!(
                zone_for(floor, lthr, &HEART_RATE_ZONES).unwrap().index,
                2,
                "value exactly on the Z2 floor must be Z2 (LTHR {lthr})"
            );
        }
    }

    #[test]
    fn zone_is_none_without_a_reference() {
        assert_eq!(zone_for(200.0, 0.0, &POWER_ZONES), None);
        assert_eq!(zone_for(200.0, -250.0, &POWER_ZONES), None);
    }

    #[test]
    fn time_in_power_zones_sums_to_activity_duration() {
        // 10s at 100W (Z1), 10s at 200W (Z3 at FTP 250 = 80%).
        let mut s = ActivityStreams::with_time((0..20).collect());
        let mut watts = vec![100_u16; 10];
        watts.extend(vec![200_u16; 10]);
        s.power_w = Some(watts);

        let zones = power_time_in_zones(&s, 250.0).unwrap();
        assert_eq!(zones.len(), 7);
        assert_eq!(zones[0].seconds, 10, "Z1 should hold the 100W block");
        assert_eq!(zones[2].seconds, 10, "Z3 should hold the 200W block");
        let total: u32 = zones.iter().map(|z| z.seconds).sum();
        assert_eq!(total, 20, "every second must be accounted for exactly once");
    }

    #[test]
    fn irregular_sampling_credits_the_gap_not_the_sample() {
        // Samples at t=0 and t=30, both in Z1. The first must be credited
        // 30s (the gap), not 1s — otherwise smart-recording activities
        // would report almost no time in zone.
        let mut s = ActivityStreams::with_time(vec![0, 30]);
        s.power_w = Some(vec![100, 100]);
        let zones = power_time_in_zones(&s, 250.0).unwrap();
        assert_eq!(zones[0].seconds, 31); // 30s gap + 1s for the final sample
    }

    #[test]
    fn time_in_zones_is_none_without_channel_or_reference() {
        let mut s = ActivityStreams::with_time((0..10).collect());
        s.power_w = Some(vec![200; 10]);
        assert_eq!(power_time_in_zones(&s, 0.0), None, "no FTP");
        assert_eq!(heart_rate_time_in_zones(&s, 170.0), None, "no HR channel");
    }

    #[test]
    fn heart_rate_time_in_zones_buckets_correctly() {
        // 5s at 120bpm (70% of 170 → Z1), 5s at 165bpm (97% → Z4).
        let mut s = ActivityStreams::with_time((0..10).collect());
        let mut hr = vec![120_u16; 5];
        hr.extend(vec![165_u16; 5]);
        s.heart_rate_bpm = Some(hr);

        let zones = heart_rate_time_in_zones(&s, 170.0).unwrap();
        assert_eq!(zones.len(), 5);
        assert_eq!(zones[0].seconds, 5);
        assert_eq!(zones[3].seconds, 5);
    }
}
