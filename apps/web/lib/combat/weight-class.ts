export type WeightClassInfo = {
  disciplineId: string;
  label: string;
  limitKg: number | null;
  notes: string;
};

/** Neutral class lists — education only. No cut protocol. */
export const BOXING_PRO_CLASSES: WeightClassInfo[] = [
  { disciplineId: "boxing", label: "Flyweight", limitKg: 50.8, notes: "Class label only." },
  { disciplineId: "boxing", label: "Bantamweight", limitKg: 53.52, notes: "Class label only." },
  { disciplineId: "boxing", label: "Featherweight", limitKg: 57.15, notes: "Class label only." },
  { disciplineId: "boxing", label: "Lightweight", limitKg: 61.23, notes: "Class label only." },
  { disciplineId: "boxing", label: "Welterweight", limitKg: 66.68, notes: "Class label only." },
  { disciplineId: "boxing", label: "Middleweight", limitKg: 72.57, notes: "Class label only." },
  { disciplineId: "boxing", label: "Light heavyweight", limitKg: 79.38, notes: "Class label only." },
  { disciplineId: "boxing", label: "Heavyweight", limitKg: null, notes: "Upper class. Limit depends on the commission." }
];

export const MMA_UNIFIED_CLASSES: WeightClassInfo[] = [
  { disciplineId: "mma", label: "Flyweight", limitKg: 56.7, notes: "Unified Rules — label only." },
  { disciplineId: "mma", label: "Bantamweight", limitKg: 61.2, notes: "Unified Rules — label only." },
  { disciplineId: "mma", label: "Featherweight", limitKg: 65.8, notes: "Unified Rules — label only." },
  { disciplineId: "mma", label: "Lightweight", limitKg: 70.3, notes: "Unified Rules — label only." },
  { disciplineId: "mma", label: "Welterweight", limitKg: 77.1, notes: "Unified Rules — label only." },
  { disciplineId: "mma", label: "Middleweight", limitKg: 83.9, notes: "Unified Rules — label only." },
  { disciplineId: "mma", label: "Light heavyweight", limitKg: 93.0, notes: "Unified Rules — label only." },
  { disciplineId: "mma", label: "Heavyweight", limitKg: 120.2, notes: "Unified Rules — label only." }
];

export const WEIGHT_SAFETY_COPY =
  "Weight classes are informational. FitConnect does not prescribe dehydration, sauna cuts, or rapid weight cutting. Speak with a qualified professional if you compete.";

export function weightClassesFor(disciplineId: string): WeightClassInfo[] {
  if (disciplineId === "boxing") return BOXING_PRO_CLASSES;
  if (disciplineId === "mma" || disciplineId === "kickboxing") return MMA_UNIFIED_CLASSES;
  return [];
}
