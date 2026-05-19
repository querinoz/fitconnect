export type LevelDef = {
  level: number;
  element: string;
  symbol: string;
  xpRequired: number;
};

/** XP to reach level N: 50×(N-1)² + 50×(N-1) */
export function xpForLevel(level: number): number {
  const n = Math.max(1, level);
  return 50 * (n - 1) ** 2 + 50 * (n - 1);
}

const ELEMENTS: { element: string; symbol: string }[] = [
  { element: "Hydrogen", symbol: "H" },
  { element: "Helium", symbol: "He" },
  { element: "Lithium", symbol: "Li" },
  { element: "Beryllium", symbol: "Be" },
  { element: "Boron", symbol: "B" },
  { element: "Carbon", symbol: "C" },
  { element: "Nitrogen", symbol: "N" },
  { element: "Oxygen", symbol: "O" },
  { element: "Fluorine", symbol: "F" },
  { element: "Neon", symbol: "Ne" },
  { element: "Sodium", symbol: "Na" },
  { element: "Magnesium", symbol: "Mg" },
  { element: "Aluminium", symbol: "Al" },
  { element: "Silicon", symbol: "Si" },
  { element: "Phosphorus", symbol: "P" },
  { element: "Sulfur", symbol: "S" },
  { element: "Chlorine", symbol: "Cl" },
  { element: "Argon", symbol: "Ar" },
  { element: "Potassium", symbol: "K" },
  { element: "Calcium", symbol: "Ca" },
  { element: "Scandium", symbol: "Sc" },
  { element: "Titanium", symbol: "Ti" },
  { element: "Vanadium", symbol: "V" },
  { element: "Chromium", symbol: "Cr" },
  { element: "Manganese", symbol: "Mn" },
  { element: "Iron", symbol: "Fe" },
  { element: "Cobalt", symbol: "Co" },
  { element: "Nickel", symbol: "Ni" },
  { element: "Copper", symbol: "Cu" },
  { element: "Zinc", symbol: "Zn" },
  { element: "Gallium", symbol: "Ga" },
  { element: "Germanium", symbol: "Ge" },
  { element: "Arsenic", symbol: "As" },
  { element: "Selenium", symbol: "Se" },
  { element: "Bromine", symbol: "Br" },
  { element: "Krypton", symbol: "Kr" },
  { element: "Rubidium", symbol: "Rb" },
  { element: "Strontium", symbol: "Sr" },
  { element: "Yttrium", symbol: "Y" },
  { element: "Zirconium", symbol: "Zr" },
  { element: "Niobium", symbol: "Nb" },
  { element: "Molybdenum", symbol: "Mo" },
  { element: "Technetium", symbol: "Tc" },
  { element: "Ruthenium", symbol: "Ru" },
  { element: "Rhodium", symbol: "Rh" },
  { element: "Palladium", symbol: "Pd" },
  { element: "Silver", symbol: "Ag" },
  { element: "Cadmium", symbol: "Cd" },
  { element: "Indium", symbol: "In" },
  { element: "Tin", symbol: "Sn" }
];

export const LEVELS: LevelDef[] = ELEMENTS.map((el, i) => ({
  level: i + 1,
  element: el.element,
  symbol: el.symbol,
  xpRequired: xpForLevel(i + 1)
}));

export function levelFromXp(xp: number): LevelDef {
  let current = LEVELS[0]!;
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}

export function nextLevelFromXp(xp: number): LevelDef | null {
  const current = levelFromXp(xp);
  return LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function progressToNextLevel(xp: number): number {
  const current = levelFromXp(xp);
  const next = nextLevelFromXp(xp);
  if (!next) return 100;
  const span = next.xpRequired - current.xpRequired;
  if (span <= 0) return 100;
  return Math.min(100, Math.round(((xp - current.xpRequired) / span) * 100));
}
