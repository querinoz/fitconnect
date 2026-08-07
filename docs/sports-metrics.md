# Sports Metrics — normative spec for Elite Core

**Status:** Draft — needs professional review at the F10 gate (certified coach / physiologist) before it is treated as final.
**Owner note (ADR-006):** this document is written down *before* it is coded. `elite-core` (Rust) implements exactly what is here; if an implementation needs to diverge, this file changes first, then the code, never the other way round.
**F1 gate:** every formula below is checked against Golden Cheetah exports on ≥15 golden FIT files, tolerance <1%, identical output on JNI/wasm/napi targets.

All formulas assume SI units internally (metres, seconds, watts, bpm) with conversion at the UI edge only.

---

## 1. Power metrics

### 1.1 Normalized Power (NP) — Coggan

1. 30-second rolling average of power, sample-and-hold for gaps.
2. Raise each rolling-average value to the 4th power.
3. Average those values.
4. Take the 4th root.

```
NP = ( mean( rolling_avg_30s(power)^4 ) )^(1/4)
```

Requires ≥ 30s of data; below that, NP is undefined (report `null`, not 0 or raw average).

### 1.2 Intensity Factor (IF)

```
IF = NP / FTP
```

`FTP` (Functional Threshold Power) is athlete-set or estimated (§4). IF undefined if FTP is unset.

### 1.3 Training Stress Score (TSS)

```
TSS = (duration_seconds × NP × IF) / (FTP × 3600) × 100
```

Equivalently `TSS = (duration_hours × IF²) × 100`.

### 1.4 Power curve (best-effort by duration)

For a fixed set of durations (1s, 5s, 15s, 30s, 1m, 2m, 5m, 10m, 20m, 30m, 1h, 2h, 3h, 4h, 5h — clipped to activity length), compute the maximum mean power sustained for that duration via a sliding window. Store per-activity; season/all-time curve = per-duration max across activities in range.

### 1.5 FTP estimation (when not manually set)

Prefer a real FTP test result if present (20-min test × 0.95, or 60-min effort as-is). Fallback: best 20-minute effort from the power curve of the last 90 days × 0.95. Flag estimated vs measured in the UI — never silently treat them the same.

---

## 2. Heart-rate metrics (no power meter)

### 2.1 hrTSS — Friel TRIMP-based approximation

Uses HR reserve (HRR) and a zone-weighted TRIMP, normalized so an hour at threshold HR = 100 hrTSS (parity with power-based TSS at IF 1.0):

```
HRR% = (HR - HR_rest) / (HR_max - HR_rest)
TRIMP = Σ over samples[ Δt_min × HRR% × 0.64 × e^(1.92 × HRR%) ]   (male coefficient)
TRIMP = Σ over samples[ Δt_min × HRR% × 0.86 × e^(1.67 × HRR%) ]   (female coefficient)
hrTSS = (TRIMP / TRIMP_at_threshold_for_1_hour) × 100
```

`TRIMP_at_threshold_for_1_hour` is computed once from the athlete's own LTHR (lactate threshold HR) so hrTSS calibrates per-athlete, not against a population constant. Sex coefficient comes from athlete profile; default to male coefficient with a visible "estimated" flag if unset — never guess silently.

### 2.2 Heart-rate zones (5-zone Coggan-style, keyed off LTHR)

| Zone | % of LTHR | Label |
|---|---|---|
| 1 | <81% | Recovery |
| 2 | 81–89% | Endurance |
| 3 | 90–93% | Tempo |
| 4 | 94–99% | Threshold |
| 5 | 100%+ | VO2max+ |

LTHR is athlete-set or estimated as `0.95 × HR from best 30-min effort in last 90 days`. Same "estimated vs measured" flagging rule as FTP.

---

## 3. Pace metrics (running)

### 3.1 Grade Adjusted Pace (GAP) — Minetti cost-of-running model

Per-sample energy cost adjustment as a function of gradient `g` (as a decimal, e.g. -0.10 to +0.10, clamped beyond that range — the polynomial is only validated in ±30% grade and Elite Core clamps input to ±20% to stay inside validated territory):

```
C(g) = 155.4g⁵ − 30.4g⁴ − 43.3g³ + 46.3g² + 19.5g + 3.6
```

`C(g)` is energy cost relative to flat running (`C(0) ≈ 3.6`). GAP for a sample:

```
GAP_pace = actual_pace × (C(0) / C(g))
```

Sum/average GAP over the activity or a lap the same way plain pace is averaged. Below ±1% grade, skip the adjustment entirely (treat as flat) to avoid noise amplification from GPS-derived elevation on flat terrain.

### 3.2 Running Stress Score (rTSS) — analogous to power TSS, using GAP and threshold pace

```
rTSS = (duration_seconds × NGP × IF_pace) / (threshold_pace_speed × 3600) × 100
IF_pace = NGP / threshold_pace_speed
```

`NGP` (Normalized Graded Pace) = same 30s-rolling / 4th-power / 4th-root treatment as NP, applied to GAP-adjusted speed instead of power. Threshold pace is athlete-set or estimated from best-effort 20–60 min run in the last 90 days.

---

## 4. Zones — power (7-zone Coggan)

| Zone | % FTP | Label |
|---|---|---|
| 1 | <55% | Active Recovery |
| 2 | 55–75% | Endurance |
| 3 | 76–90% | Tempo |
| 4 | 91–105% | Threshold |
| 5 | 106–120% | VO2max |
| 6 | 121–150% | Anaerobic |
| 7 | >150% | Neuromuscular |

---

## 5. Physiology / load

### 5.1 CTL / ATL / TSB — Banister impulse-response model

Exponentially weighted moving average over daily TSS (0 for rest days), computed once per athlete per day:

```
CTL_today = CTL_yesterday + (TSS_today − CTL_yesterday) / 42     (42-day time constant, "Fitness")
ATL_today = ATL_yesterday + (TSS_today − ATL_yesterday) / 7      (7-day time constant,  "Fatigue")
TSB_today = CTL_yesterday − ATL_yesterday                        ("Form", computed from *yesterday's* values, before today's session)
```

Seed CTL/ATL at 0 for an athlete with no history; the ramp-up period (~6 weeks) is expected to under-read and the UI must not present early CTL as reliable — flag "building baseline" below 42 days of data.

### 5.2 ACWR — Acute:Chronic Workload Ratio (Gabbett)

```
Acute  = rolling 7-day sum of TSS (or session RPE-load, if TSS unavailable)
Chronic = rolling 28-day average of the same, expressed as a weekly figure (28-day sum / 4)
ACWR = Acute / Chronic
```

Injury-risk banding (advisory only, never a hard block): `<0.8` undertraining, `0.8–1.3` sweet spot, `1.3–1.5` caution, `>1.5` high risk. Requires ≥28 days of data to be meaningful; below that, report `null` with a "building baseline" flag, same as CTL/ATL.

### 5.3 HRV — rMSSD baseline and readiness input

- rMSSD computed from RR-interval series (successive differences, root-mean-square), per morning reading.
- Baseline = rolling 7-day average of `ln(rMSSD)` (log-transform reduces skew — standard in HRV literature), with a rolling 7-day SD for band width.
- A reading more than 1 SD below the 7-day baseline mean is a readiness flag; this feeds `apps/web/lib/readiness/compute.ts` / the future shared `@fitconnect/utils` readiness module — Elite Core owns the rMSSD/baseline math, the readiness *scoring* rules (how HRV, sleep, soreness combine) stay in the app layer per today's split, revisited when that shared package lands.

---

## 6. Lap detection

- **Manual laps:** explicit lap-marker records in the FIT stream — always respected as-is.
- **Auto-lap (distance):** split every N metres/miles (athlete setting, default off unless the device wrote auto-lap records already — Elite Core does not invent laps a device didn't record, it only *re-derives* splits for display, e.g. "show me 1km splits" as a view-level operation over raw stream data, not a mutation of the stored lap set).

## 7. GPS filtering

- Drop samples with reported horizontal accuracy worse than a threshold (default 20m, configurable) rather than smoothing them in — a bad fix should disappear from distance/pace calculation, not get averaged into it.
- Distance accumulates from consecutive *accepted* fixes only (Haversine between points, elevation-corrected distance = `sqrt(flat_distance² + elevation_delta²)` per segment for grade-sensitive sports).
- Elevation: prefer barometric altimeter stream when present (device-reported `enhanced_altitude`); fall back to GPS altitude only if no barometric channel exists, and flag which source was used — the two are not accuracy-equivalent and must not be silently blended.
- Stationary/pause detection: a run of consecutive accepted fixes with speed below a small threshold (default 0.5 m/s) for longer than a short window (default 10s) is treated as a pause for auto-pause purposes — configurable, never applied retroactively to override a device's own recorded pause events.

---

## 8. Sources

- Coggan, A. & Allen, H. — *Training and Racing with a Power Meter* (NP, IF, TSS, power zones).
- Banister, E.W. — impulse-response training model (CTL/ATL/TSB origin; TrainingPeaks popularized the 42/7 constants used here).
- Friel, J. — TRIMP-based hrTSS approximation.
- Gabbett, T.J. (2016) — "The training—injury prevention paradox" (ACWR).
- Minetti, A.E. et al. (2002) — energy cost of running on gradients (GAP polynomial).
- Task Force of ESC/NASPE (1996) and subsequent HRV literature — rMSSD, log-transform convention.
- Golden Cheetah source (`GoldenCheetah/src/Metrics`) — reference implementation used for the F1 golden-file comparison; this doc is the spec, Golden Cheetah is the empirical check.

## 9. Open questions (resolve before F7, not blocking F0/F1 scaffolding)

- Sex coefficient for TRIMP: stored on athlete profile or asked at onboarding? Not yet decided — F3 scope.
- Whether ACWR banding should ever surface as a nudge to the coach vs. athlete-only — product decision, not engineering, park in `qa/HUMAN-QUEUE.md` if it comes up before F10.
