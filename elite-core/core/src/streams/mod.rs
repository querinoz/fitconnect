//! Activity stream model — the typed time-series every other module
//! consumes (metrics, physiology, lap detection, FIT parse/write).
//!
//! See this module's `README.md` for the *why* behind the shape choices;
//! see `docs/sports-metrics.md` for the normative definitions the
//! consumers of this model implement.

use std::fmt;

/// A GPS coordinate in decimal degrees (WGS84).
///
/// Kept as a plain struct with public fields — there is no invariant a
/// constructor could protect that `validate_range` doesn't already check
/// explicitly where it matters.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct LatLng {
    pub lat_deg: f64,
    pub lon_deg: f64,
}

impl LatLng {
    /// True when the coordinate is inside the valid WGS84 envelope.
    pub fn is_in_range(&self) -> bool {
        self.lat_deg.is_finite()
            && self.lon_deg.is_finite()
            && (-90.0..=90.0).contains(&self.lat_deg)
            && (-180.0..=180.0).contains(&self.lon_deg)
    }
}

/// Errors a stream set can carry. Closed enum on purpose (see README):
/// callers match exhaustively, and a new variant is a compile-time signal
/// to every consumer rather than a silently-ignored case.
#[derive(Debug, Clone, PartialEq)]
pub enum StreamsError {
    /// The mandatory time channel is empty.
    EmptyTime,
    /// A channel is present but its length differs from `time_s`.
    LengthMismatch {
        channel: &'static str,
        expected: usize,
        actual: usize,
    },
    /// Time must be strictly increasing; `index` is the first offender.
    NonMonotonicTime { index: usize },
    /// A coordinate sample is outside the WGS84 envelope; `index` is the
    /// first offender.
    CoordinateOutOfRange { index: usize },
}

impl fmt::Display for StreamsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            StreamsError::EmptyTime => write!(f, "time channel is empty"),
            StreamsError::LengthMismatch {
                channel,
                expected,
                actual,
            } => write!(
                f,
                "channel `{channel}` has {actual} samples, expected {expected} (length of time_s)"
            ),
            StreamsError::NonMonotonicTime { index } => {
                write!(f, "time_s is not strictly increasing at index {index}")
            }
            StreamsError::CoordinateOutOfRange { index } => {
                write!(f, "lat_lng sample at index {index} is outside WGS84 range")
            }
        }
    }
}

impl std::error::Error for StreamsError {}

/// The full set of recorded channels for one activity.
///
/// Shape: struct-of-vectors ("column-oriented"), not a vector of sample
/// structs. `time_s` is the mandatory spine; every optional channel, when
/// present, must have exactly the same length. That invariant is checked
/// by [`ActivityStreams::validate`], which every consumer is expected to
/// call once at its boundary.
///
/// Units are in the field names (`_s`, `_m`, `_bpm`, `_w`, `_rpm`,
/// `_mps`) — a deliberate, boring convention so unit bugs are visible at
/// every call site.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct ActivityStreams {
    /// Seconds since activity start. Strictly increasing. Mandatory.
    pub time_s: Vec<u32>,
    pub lat_lng: Option<Vec<LatLng>>,
    /// Barometric or GPS altitude, metres.
    pub altitude_m: Option<Vec<f64>>,
    /// Cumulative distance, metres.
    pub distance_m: Option<Vec<f64>>,
    /// Instantaneous speed, metres per second.
    pub speed_mps: Option<Vec<f64>>,
    pub heart_rate_bpm: Option<Vec<u16>>,
    pub power_w: Option<Vec<u16>>,
    /// Crank or stride cadence, revolutions (or strides) per minute.
    pub cadence_rpm: Option<Vec<u8>>,
    /// Ambient temperature, degrees Celsius.
    pub temperature_c: Option<Vec<i8>>,
}

impl ActivityStreams {
    /// A stream set with only the time spine; channels are attached by
    /// the parser (F1: `fit`) or the capture pipeline (F4).
    pub fn with_time(time_s: Vec<u32>) -> Self {
        ActivityStreams {
            time_s,
            ..ActivityStreams::default()
        }
    }

    /// Number of samples (length of the time spine).
    pub fn len(&self) -> usize {
        self.time_s.len()
    }

    pub fn is_empty(&self) -> bool {
        self.time_s.is_empty()
    }

    /// Elapsed time from first to last sample, in seconds.
    ///
    /// Returns 0 for an empty or single-sample stream; callers that need
    /// to reject those cases should call [`validate`](Self::validate)
    /// first, which rejects the empty case.
    pub fn elapsed_s(&self) -> u32 {
        match (self.time_s.first(), self.time_s.last()) {
            (Some(first), Some(last)) => last.saturating_sub(*first),
            _ => 0,
        }
    }

    /// Checks every structural invariant. Consumers call this once at
    /// their boundary and can then index freely without re-checking.
    ///
    /// Deliberately written as a sequence of plain checks rather than
    /// something clever — this function *is* the specification of what a
    /// well-formed stream set means.
    pub fn validate(&self) -> Result<(), StreamsError> {
        if self.time_s.is_empty() {
            return Err(StreamsError::EmptyTime);
        }

        let expected = self.time_s.len();

        // Length checks, one channel at a time. A macro could shrink
        // this, but the explicit version is greppable and reviewable.
        self.check_len("lat_lng", self.lat_lng.as_ref().map(Vec::len), expected)?;
        self.check_len(
            "altitude_m",
            self.altitude_m.as_ref().map(Vec::len),
            expected,
        )?;
        self.check_len(
            "distance_m",
            self.distance_m.as_ref().map(Vec::len),
            expected,
        )?;
        self.check_len("speed_mps", self.speed_mps.as_ref().map(Vec::len), expected)?;
        self.check_len(
            "heart_rate_bpm",
            self.heart_rate_bpm.as_ref().map(Vec::len),
            expected,
        )?;
        self.check_len("power_w", self.power_w.as_ref().map(Vec::len), expected)?;
        self.check_len(
            "cadence_rpm",
            self.cadence_rpm.as_ref().map(Vec::len),
            expected,
        )?;
        self.check_len(
            "temperature_c",
            self.temperature_c.as_ref().map(Vec::len),
            expected,
        )?;

        for (index, pair) in self.time_s.windows(2).enumerate() {
            if pair[1] <= pair[0] {
                return Err(StreamsError::NonMonotonicTime { index: index + 1 });
            }
        }

        if let Some(coords) = &self.lat_lng {
            for (index, coord) in coords.iter().enumerate() {
                if !coord.is_in_range() {
                    return Err(StreamsError::CoordinateOutOfRange { index });
                }
            }
        }

        Ok(())
    }

    fn check_len(
        &self,
        channel: &'static str,
        actual: Option<usize>,
        expected: usize,
    ) -> Result<(), StreamsError> {
        match actual {
            Some(actual) if actual != expected => Err(StreamsError::LengthMismatch {
                channel,
                expected,
                actual,
            }),
            _ => Ok(()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_streams() -> ActivityStreams {
        let mut s = ActivityStreams::with_time(vec![0, 1, 2, 3]);
        s.heart_rate_bpm = Some(vec![120, 125, 130, 128]);
        s.lat_lng = Some(vec![
            LatLng {
                lat_deg: 41.15,
                lon_deg: -8.61,
            };
            4
        ]);
        s
    }

    #[test]
    fn valid_streams_pass_validation() {
        assert_eq!(valid_streams().validate(), Ok(()));
    }

    #[test]
    fn empty_time_is_rejected() {
        let s = ActivityStreams::default();
        assert_eq!(s.validate(), Err(StreamsError::EmptyTime));
    }

    #[test]
    fn length_mismatch_names_the_channel() {
        let mut s = valid_streams();
        s.power_w = Some(vec![200, 210]); // 2 samples vs 4
        assert_eq!(
            s.validate(),
            Err(StreamsError::LengthMismatch {
                channel: "power_w",
                expected: 4,
                actual: 2,
            })
        );
    }

    #[test]
    fn non_monotonic_time_reports_first_offender() {
        let s = ActivityStreams::with_time(vec![0, 1, 1, 2]);
        assert_eq!(
            s.validate(),
            Err(StreamsError::NonMonotonicTime { index: 2 })
        );
    }

    #[test]
    fn out_of_range_coordinate_is_rejected() {
        let mut s = ActivityStreams::with_time(vec![0, 1]);
        s.lat_lng = Some(vec![
            LatLng {
                lat_deg: 41.15,
                lon_deg: -8.61,
            },
            LatLng {
                lat_deg: 91.0,
                lon_deg: 0.0,
            },
        ]);
        assert_eq!(
            s.validate(),
            Err(StreamsError::CoordinateOutOfRange { index: 1 })
        );
    }

    #[test]
    fn elapsed_is_last_minus_first() {
        let s = ActivityStreams::with_time(vec![10, 11, 40]);
        assert_eq!(s.elapsed_s(), 30);
        assert_eq!(ActivityStreams::default().elapsed_s(), 0);
    }
}
