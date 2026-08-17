# Health data spec

## Heart rate

- Typed `HeartRate.bpm` is null unless `MetricAvailability.AVAILABLE`
- Wear envelope omits BPM unless Health Services probe is AVAILABLE
- Engine sine wave is LOCAL_DEMO for cockpit motion only — never REAL_SENSOR
- Zones Z1–Z5: &lt;120, &lt;140, &lt;160, &lt;175, else Z5 (working bands, not a clinical protocol)

## Recovery / load

`PerformanceIntelligence` outputs carry `EvidenceKind`: OBSERVED, CALCULATED, INFERRED, RECOMMENDED.  
Not a medical diagnosis.

## Sleep

If no SLEEP sample in the telemetry store: DATA SOURCE REQUIRED.  
No fabricated deep/light/REM/SpO2/breathing.

## Health Connect

Probe `HealthConnectClient.getSdkStatus`. SDK_AVAILABLE ≠ permission ≠ records.  
`AndroidHealthDataRepository.latestHeartRate` returns PERMISSION_DENIED when SDK is present but no granted read.  
Do not request every Health Connect permission at startup — Device Center is the contextual surface.

## Auto-detect

`ActivityRecognitionEngine` stays POSSIBLE_* until a tested classifier exists. CONFIRMED is test-only.
