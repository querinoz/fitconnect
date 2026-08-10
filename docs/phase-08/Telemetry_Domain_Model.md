# Phase 08 — Telemetry Domain Model

## Canonical metric taxonomy (`MetricType`)
HEART_RATE, HRV, RESTING_HEART_RATE, SLEEP, STEPS, CALORIES, DISTANCE, ELEVATION, LOCATION, POWER, CADENCE, PACE, SPEED, RESPIRATORY_RATE, SPO2, BODY_TEMPERATURE, WEIGHT, BODY_COMPOSITION, BLOOD_PRESSURE, STRESS, RECOVERY, READINESS, TRAINING_LOAD, VO2_MAX, WORKOUT.

## Core records
- **TelemetrySample** — id, athleteId, metric, value (canonical unit), unit, at, endAt?, provenance, attributes. Covers HeartRateSample, HRVSample, StepSample, CalorieSample, RespiratoryRateSample, OxygenSaturationSample, BodyTemperatureSample, WeightSample, StressSample, RecoverySample, ReadinessSample, TrainingLoadSample, VO2MaxSample as metric-typed instances of one storage shape (single table/index in a future Room schema).
- **SleepSession + SleepStage** — cross-midnight-safe (epoch + zone offset), stages (AWAKE/LIGHT/DEEP/REM/UNKNOWN), efficiency.
- **WorkoutSession** — sportKey, start/end, distance, calories, avg/max HR, avg power, elevation gain, provenance, `mergedFrom` (all duplicate sources retained).
- **LocationSample**, **BloodPressureSample**, **BodyComposition** — dedicated shapes where a scalar doesn't fit.

## Canonical units (`CanonicalUnits`)
| Metric | Stored unit |
|---|---|
| HEART_RATE / RESTING_HEART_RATE | bpm |
| HRV | ms |
| SLEEP | minutes |
| STEPS | steps |
| CALORIES | kcal |
| DISTANCE / ELEVATION | meters |
| POWER | watts |
| CADENCE | rpm |
| PACE | s/km |
| SPEED | m/s |
| SPO2 / BODY_COMPOSITION | % |
| BODY_TEMPERATURE | °C |
| WEIGHT | kg |
| BLOOD_PRESSURE | mmHg |
| STRESS / RECOVERY / READINESS / TRAINING_LOAD | score |
| VO2_MAX | ml/kg/min |

Provider models are mapped at the adapter boundary; the FitConnect model is the source of truth. Original unit survives in `Provenance.originalUnit`.
