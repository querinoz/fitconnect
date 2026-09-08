/**
 * Training load engine — acute:chronic ratio when both present.
 *
 * Documented formulas:
 *   strainRatio = acute / chronic   (when chronic > 0)
 *   Band thresholds (Banister-style ACWR guidance, approximate):
 *     LOW      < 0.8
 *     MODERATE 0.8–1.3
 *     HIGH     1.3–1.5
 *     EXTREME  > 1.5
 *
 * Limitations: requires consistent load units from upstream;
 * does not invent acute/chronic from incomplete sessions;
 * sport-specific models are future SportProfile hooks.
 */

import type { ConfidenceResult, LoadBand } from "../schemas";
import { ZENITH_CORE_VERSION } from "../schemas";
import { computeConfidence, assessDataQuality } from "../confidence";

export type TrainingLoadInput = {
  acute?: number | null;
  chronic?: number | null;
  /** Optional 0–100 strain already computed upstream. */
  strainScore?: number | null;
};

export type TrainingLoadResult = {
  acute: number | null;
  chronic: number | null;
  strainRatio: number | null;
  band: LoadBand;
  confidence: ConfidenceResult;
  limitations: string[];
  engineVersion: typeof ZENITH_CORE_VERSION;
};

function bandFromRatio(ratio: number | null, strainScore?: number | null): LoadBand {
  if (ratio != null && Number.isFinite(ratio)) {
    if (ratio < 0.8) return "LOW";
    if (ratio <= 1.3) return "MODERATE";
    if (ratio <= 1.5) return "HIGH";
    return "EXTREME";
  }
  if (strainScore != null && Number.isFinite(strainScore)) {
    if (strainScore < 35) return "LOW";
    if (strainScore < 60) return "MODERATE";
    if (strainScore < 80) return "HIGH";
    return "EXTREME";
  }
  return "UNKNOWN";
}

export function evaluateTrainingLoad(
  input: TrainingLoadInput
): TrainingLoadResult {
  const acute =
    input.acute != null && Number.isFinite(input.acute) ? input.acute : null;
  const chronic =
    input.chronic != null && Number.isFinite(input.chronic) ? input.chronic : null;

  let strainRatio: number | null = null;
  const limitations: string[] = [
    "ACWR bands are approximate guidance, not injury diagnosis.",
  ];

  if (acute != null && chronic != null && chronic > 0) {
    strainRatio = Math.round((acute / chronic) * 100) / 100;
  } else {
    limitations.push("Acute and/or chronic load missing — band may use strainScore fallback.");
  }

  const band = bandFromRatio(strainRatio, input.strainScore);
  const quality = assessDataQuality({
    load: acute != null || chronic != null || input.strainScore != null,
    hrv: true,
    sleep: true,
  });

  return {
    acute,
    chronic,
    strainRatio,
    band,
    confidence: computeConfidence({
      quality: band === "UNKNOWN" ? "MISSING" : quality.quality,
      baselineSufficient: chronic != null,
      factorCount: [acute, chronic, input.strainScore].filter((x) => x != null).length,
    }),
    limitations,
    engineVersion: ZENITH_CORE_VERSION,
  };
}
