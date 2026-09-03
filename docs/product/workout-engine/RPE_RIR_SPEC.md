# RPE / RIR — Specification

## Scales

| Scale | Range | Storage |
|-------|-------|---------|
| RPE | 1.0 – 10.0 (0.5 steps) | `effort_scale = rpe` |
| RIR | 0 – 5 | `effort_scale = rir` |

## Rules

1. Optional per working set
2. Record which scale was used — **never mix** in one field
3. **Informational only** in v1 — does not change `ProgressionEngine` output
4. Coach view: only with athlete consent flag

## Privacy

RPE/RIR = private health-adjacent data — not in social feed payloads.
