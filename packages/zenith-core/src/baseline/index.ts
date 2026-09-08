/**
 * Baseline engine — personal norms, never absolute population cutoffs alone.
 *
 * Formula (documented):
 *   baseline = mean(samples in window) when n >= minSamples
 *   deviationPct = ((today - baseline) / baseline) * 100
 *
 * Limitations: equal-weight mean; no seasonal adjustment; no outlier censoring yet.
 */

export type BaselineSeries = {
  /** Chronological samples (oldest → newest). Nulls ignored. */
  values: Array<number | null | undefined>;
  minSamples?: number;
};

export type BaselineResult = {
  baseline: number | null;
  sampleCount: number;
  sufficient: boolean;
  today: number | null;
  deviationPct: number | null;
};

function finite(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export function computeBaseline(
  series: BaselineSeries,
  today?: number | null
): BaselineResult {
  const minSamples = series.minSamples ?? 7;
  const samples = series.values.filter(finite);
  const sampleCount = samples.length;
  const sufficient = sampleCount >= minSamples;
  const baseline =
    sampleCount > 0
      ? samples.reduce((a, b) => a + b, 0) / sampleCount
      : null;

  const todayValue = finite(today) ? today : samples.at(-1) ?? null;
  let deviationPct: number | null = null;
  if (baseline != null && baseline !== 0 && todayValue != null) {
    deviationPct = ((todayValue - baseline) / baseline) * 100;
  }

  return {
    baseline: baseline != null ? Math.round(baseline * 100) / 100 : null,
    sampleCount,
    sufficient,
    today: todayValue,
    deviationPct:
      deviationPct != null ? Math.round(deviationPct * 10) / 10 : null,
  };
}

export function rollingMean(
  values: Array<number | null | undefined>,
  window: number
): number | null {
  const samples = values.filter(finite).slice(-window);
  if (!samples.length) return null;
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}
