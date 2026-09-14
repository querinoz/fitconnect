/**
 * Canonical fitness providers + metric provenance.
 * Aligns with Android `com.fitconnect.shared.fitness.ProviderId`.
 * Paid aggregators (Terra / Spike / ROOK) exist only as disabled adapter flags.
 */

export type ProviderId =
  | "HEALTH_CONNECT"
  | "HEALTHKIT"
  | "GARMIN"
  | "WHOOP"
  | "OURA"
  | "POLAR"
  | "FITBIT"
  | "SAMSUNG_HEALTH"
  | "STRAVA"
  | "INTERVALS_ICU"
  | "TRAININGPEAKS"
  | "MANUAL"
  | "LOCAL_DEMO"
  | "TERRA"
  | "SPIKE"
  | "ROOK";

/** How a numeric field was obtained. LLM output is never REAL. */
export type MetricProvenance =
  | "REAL"
  | "CALCULATED"
  | "ESTIMATED"
  | "MODEL_INFERRED"
  | "MISSING";

export type ProviderTier = "core" | "optional" | "experimental" | "disabled_aggregator";

export type ProviderConstraints = {
  providerId: ProviderId;
  tier: ProviderTier;
  enabled: boolean;
  shareable: boolean;
  mayTrainMl: boolean;
  visibleToThirdParties: boolean;
};

export const DISABLED_AGGREGATORS = ["TERRA", "SPIKE", "ROOK"] as const;

export function constraintsFor(providerId: ProviderId): ProviderConstraints {
  if (providerId === "STRAVA") {
    return {
      providerId,
      tier: "optional",
      enabled: true,
      shareable: false,
      mayTrainMl: false,
      visibleToThirdParties: false
    };
  }
  if (providerId === "TERRA" || providerId === "SPIKE" || providerId === "ROOK") {
    return {
      providerId,
      tier: "disabled_aggregator",
      enabled: false,
      shareable: false,
      mayTrainMl: false,
      visibleToThirdParties: false
    };
  }
  if (providerId === "TRAININGPEAKS") {
    return {
      providerId,
      tier: "experimental",
      enabled: false,
      shareable: true,
      mayTrainMl: true,
      visibleToThirdParties: false
    };
  }
  if (providerId === "INTERVALS_ICU") {
    return {
      providerId,
      tier: "optional",
      enabled: false,
      shareable: true,
      mayTrainMl: true,
      visibleToThirdParties: false
    };
  }
  const core = providerId === "HEALTH_CONNECT" || providerId === "HEALTHKIT" || providerId === "MANUAL";
  return {
    providerId,
    tier: core ? "core" : "optional",
    enabled: true,
    shareable: providerId !== "LOCAL_DEMO",
    mayTrainMl: true,
    visibleToThirdParties: providerId !== "LOCAL_DEMO"
  };
}

export type Provenanced<T> = {
  value: T | null;
  provenance: MetricProvenance;
  source: ProviderId | null;
  capturedAt: string | null;
  confidence: number;
};

export function missingMetric<T>(): Provenanced<T> {
  return {
    value: null,
    provenance: "MISSING",
    source: null,
    capturedAt: null,
    confidence: 0
  };
}

export type NormalizedSample = {
  athleteId: string;
  metric: string;
  value: number;
  unit: string;
  capturedAt: string;
  providerId: ProviderId;
  externalId: string;
  provenance: MetricProvenance;
  confidence: number;
};

export type FitnessProvider = {
  id: ProviderId;
  displayName: string;
  constraints: ProviderConstraints;
  ingest?(input: {
    athleteId: string;
    samples: NormalizedSample[];
  }): Promise<{ accepted: number; rejected: number }>;
};

export function reconcileSamples(samples: NormalizedSample[]): NormalizedSample[] {
  const byKey = new Map<string, NormalizedSample>();
  for (const sample of samples) {
    if (constraintsFor(sample.providerId).enabled === false) continue;
    const key = `${sample.athleteId}:${sample.metric}:${sample.capturedAt}`;
    const prev = byKey.get(key);
    if (!prev || sample.confidence > prev.confidence) {
      byKey.set(key, sample);
    }
  }
  return [...byKey.values()];
}
