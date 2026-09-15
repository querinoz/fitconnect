export type ObservationConfidence = "measured" | "derived" | "missing";

export type FitnessObservation<T = number> = {
  value: T | null;
  unit: string | null;
  source: string;
  provider: string;
  measuredAt: string | null;
  ingestedAt: string;
  confidence: ObservationConfidence;
};

export function missingObservation(
  source: string,
  provider = "none",
  unit: string | null = null
): FitnessObservation {
  return {
    value: null,
    unit,
    source,
    provider,
    measuredAt: null,
    ingestedAt: new Date().toISOString(),
    confidence: "missing"
  };
}

export function measuredObservation<T>(input: {
  value: T;
  unit: string;
  source: string;
  provider: string;
  measuredAt?: string | null;
}): FitnessObservation<T> {
  return {
    value: input.value,
    unit: input.unit,
    source: input.source,
    provider: input.provider,
    measuredAt: input.measuredAt ?? null,
    ingestedAt: new Date().toISOString(),
    confidence: "measured"
  };
}
