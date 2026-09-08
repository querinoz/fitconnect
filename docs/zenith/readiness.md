# Zenith Core — Readiness

**Source of truth (score math):** `@fitconnect/utils` `computeReadiness`  
**Orchestration:** `@fitconnect/zenith-core` `evaluateReadiness`

## Weights

| Component | Weight |
|---|---|
| HRV vs baseline | 0.4 |
| Sleep (hours × efficiency) | 0.3 |
| Strain (100 − strainScore) | 0.3 |

Optional `historyDays` 1|7 applies a small multiplier (0.96 / 1.04).

## States

| Score | State |
|---|---|
| ≥ 85 | OPTIMAL |
| ≥ 70 | GOOD |
| ≥ 50 | MODERATE |
| ≥ 40 | LOW |
| < 40 | CRITICAL |
| missing core inputs | UNKNOWN |

## Limitations

- Equal-weight personal baseline (7+ samples preferred).
- Not a medical diagnosis.
- Strain units must be consistent upstream (0–100).
