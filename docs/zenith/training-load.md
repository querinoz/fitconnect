# Training load

`evaluateTrainingLoad` uses acute:chronic (ACWR-style) when both present.

| Ratio | Band |
|---|---|
| < 0.8 | LOW |
| 0.8–1.3 | MODERATE |
| 1.3–1.5 | HIGH |
| > 1.5 | EXTREME |

Fallback: `strainScore` 0–100 bands when ACWR unavailable. Missing both → UNKNOWN.

Limitations documented on every result (`limitations[]`).
