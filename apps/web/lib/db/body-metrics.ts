export type BodyMetricsRow = {
  athleteId: string;
  weightKg: number;
  hydrationLiters: number;
  nutritionKcal: number;
  updatedAt: string;
};

const store = new Map<string, BodyMetricsRow>();

export function resetBodyMetricsForTests() {
  store.clear();
}

export function getBodyMetrics(athleteId: string): BodyMetricsRow | null {
  return store.get(athleteId) ?? null;
}

export function upsertBodyMetrics(input: {
  athleteId: string;
  weightKg?: number;
  hydrationLiters?: number;
  nutritionKcal?: number;
}): BodyMetricsRow {
  const prev = store.get(input.athleteId);
  const row: BodyMetricsRow = {
    athleteId: input.athleteId,
    weightKg: input.weightKg ?? prev?.weightKg ?? 0,
    hydrationLiters: input.hydrationLiters ?? prev?.hydrationLiters ?? 0,
    nutritionKcal: input.nutritionKcal ?? prev?.nutritionKcal ?? 0,
    updatedAt: new Date().toISOString()
  };
  store.set(input.athleteId, row);
  return row;
}
