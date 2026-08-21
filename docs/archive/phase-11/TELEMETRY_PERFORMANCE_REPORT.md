# Telemetry Performance Report

Paginated store retained. Aggregation uses running min/max/sum + reservoir median.
pruneAthlete enforces PerformanceBudget.TELEMETRY_SAMPLES_PER_ATHLETE.
Stress test: 100k samples → aggregate → prune to 50k.
