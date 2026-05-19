/** 10 palette variants — all keep cyan→lime DNA, tuned for different brand moods. */
export type BrandPalette = {
  id: string;
  name: string;
  mood: string;
  brand: string;
  accent: string;
  signal: string;
  plasma: string;
  ink950: string;
  ink50: string;
  gradient: string;
};

export const BRAND_PALETTES: BrandPalette[] = [
  {
    id: "01-original",
    name: "Original Voltline",
    mood: "Current production — cyan authority, lime achievement",
    brand: "#22d3ee",
    accent: "#84cc16",
    signal: "#f43f5e",
    plasma: "#a855f7",
    ink950: "#020617",
    ink50: "#f8fafc",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #84cc16 100%)"
  },
  {
    id: "02-arctic",
    name: "Deep Arctic",
    mood: "Cooler, instrument-grade — Swiss timing device",
    brand: "#06b6d4",
    accent: "#a3e635",
    signal: "#fb7185",
    plasma: "#9333ea",
    ink950: "#010409",
    ink50: "#f1f5f9",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #a3e635 100%)"
  },
  {
    id: "03-braun",
    name: "Braun Scientific",
    mood: "Desaturated Rams — calm, precise, no hype",
    brand: "#2dd4bf",
    accent: "#9ca3af",
    signal: "#e879f9",
    plasma: "#818cf8",
    ink950: "#0a0a0a",
    ink50: "#fafaf9",
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #6ee7b7 100%)"
  },
  {
    id: "04-neon",
    name: "Neon Peak",
    mood: "Higher energy — competition day, still dark-first",
    brand: "#38bdf8",
    accent: "#bef264",
    signal: "#f472b6",
    plasma: "#c084fc",
    ink950: "#000000",
    ink50: "#ffffff",
    gradient: "linear-gradient(135deg, #38bdf8 0%, #bef264 100%)"
  },
  {
    id: "05-warm",
    name: "Warm Human",
    mood: "Softer cyan — yoga, trust, human coaches",
    brand: "#2dd4bf",
    accent: "#84cc16",
    signal: "#fb923c",
    plasma: "#a78bfa",
    ink950: "#0c0a09",
    ink50: "#fafaf9",
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #84cc16 100%)"
  },
  {
    id: "06-platinum",
    name: "Platinum Elite",
    mood: "Silver-cyan — premium specialist, understated",
    brand: "#67e8f9",
    accent: "#d9f99d",
    signal: "#fda4af",
    plasma: "#d8b4fe",
    ink950: "#09090b",
    ink50: "#fafafa",
    gradient: "linear-gradient(135deg, #67e8f9 0%, #d9f99d 100%)"
  },
  {
    id: "07-forest",
    name: "Forest Recovery",
    mood: "Jade accent — recovery, nature, endurance",
    brand: "#22d3ee",
    accent: "#4ade80",
    signal: "#f43f5e",
    plasma: "#8b5cf6",
    ink950: "#022c22",
    ink50: "#ecfdf5",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #4ade80 100%)"
  },
  {
    id: "08-signal",
    name: "Signal Forward",
    mood: "Biometric rose emphasis — HRV-forward product",
    brand: "#22d3ee",
    accent: "#84cc16",
    signal: "#e11d48",
    plasma: "#a855f7",
    ink950: "#020617",
    ink50: "#fff1f2",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #f43f5e 55%, #84cc16 100%)"
  },
  {
    id: "09-midnight",
    name: "Midnight Pro",
    mood: "Deeper ink, restrained brand — editorial SaaS",
    brand: "#0891b2",
    accent: "#65a30d",
    signal: "#be123c",
    plasma: "#7e22ce",
    ink950: "#000000",
    ink50: "#e2e8f0",
    gradient: "linear-gradient(135deg, #0891b2 0%, #65a30d 100%)"
  },
  {
    id: "10-olympic",
    name: "Olympic Precision",
    mood: "International sport — neutral, authoritative",
    brand: "#0ea5e9",
    accent: "#ca8a04",
    signal: "#dc2626",
    plasma: "#6366f1",
    ink950: "#171717",
    ink50: "#f5f5f5",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #eab308 100%)"
  }
];
