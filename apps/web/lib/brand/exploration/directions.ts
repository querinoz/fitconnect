/** Phase 1 — 10 conceptual mark directions (analysis only, not production). */
export type MarkDirection = {
  id: string;
  letter: string;
  name: string;
  concept: string;
  geometry: string;
  feeling: string;
  risk: string;
  scores: {
    timeless: number;
    scale: number;
    brandFit: number;
    diff: number;
    mono: number;
    concept: number;
    purity: number;
    versatile: number;
  };
};

export const MARK_DIRECTIONS: MarkDirection[] = [
  {
    id: "meridian",
    letter: "A",
    name: "The Meridian",
    concept: "Two arcs intersect — athlete progress × coach expertise (vesica piscis).",
    geometry: "Golden-ratio circles, φ radii, intersection = coaching relationship.",
    feeling: "Navigation instrument. Astronomical precision.",
    risk: "Generic 'connection' without tight angles.",
    scores: { timeless: 5, scale: 4, brandFit: 5, diff: 4, mono: 5, concept: 5, purity: 5, versatile: 4 }
  },
  {
    id: "vertex",
    letter: "B",
    name: "The Vertex",
    concept: "Peak convergence — chevron from negative space between two forms.",
    geometry: "60° equilateral derivation. No fill gradients.",
    feeling: "Directional. Measurement pointer.",
    risk: "Reads as generic up-arrow.",
    scores: { timeless: 4, scale: 5, brandFit: 4, diff: 3, mono: 5, concept: 4, purity: 5, versatile: 5 }
  },
  {
    id: "seal",
    letter: "C",
    name: "The Specialist Seal",
    concept: "Hallmark badge — verification earned, not downloaded.",
    geometry: "Pentagon shield, root-5 rectangle proportions.",
    feeling: "Certified. Federation emblem.",
    risk: "Shield = insurance/healthcare.",
    scores: { timeless: 4, scale: 4, brandFit: 5, diff: 3, mono: 5, concept: 5, purity: 4, versatile: 4 }
  },
  {
    id: "readiness-ring",
    letter: "D",
    name: "The Readiness Ring",
    concept: "Product-native — readiness arc abstracted to pure geometry.",
    geometry: "Circle + 137.5° golden-angle gap. Stroke tuned optically.",
    feeling: "Swiss instrument. Scientific calm.",
    risk: "Loading spinner association.",
    scores: { timeless: 4, scale: 5, brandFit: 5, diff: 5, mono: 5, concept: 5, purity: 5, versatile: 4 }
  },
  {
    id: "asymmetric-f",
    letter: "E",
    name: "The Asymmetric F",
    concept: "Athletic F — crossbar extends into forward motion / connection.",
    geometry: "Rectilinear 90°/45°. Olympic 5:2 ratio stem.",
    feeling: "International Style. Editorial Swiss.",
    risk: "Generic lettermark.",
    scores: { timeless: 5, scale: 4, brandFit: 4, diff: 4, mono: 5, concept: 4, purity: 5, versatile: 5 }
  },
  {
    id: "link-node",
    letter: "F",
    name: "The Link Node",
    concept: "Coach + athlete as two circles — overlap zone = relationship.",
    geometry: "Equal circles, tangent overlap, centre line implied.",
    feeling: "Human connection. Partnership.",
    risk: "Venn diagram / dating app.",
    scores: { timeless: 4, scale: 4, brandFit: 5, diff: 3, mono: 5, concept: 4, purity: 4, versatile: 4 }
  },
  {
    id: "crosshair",
    letter: "G",
    name: "The Crosshair",
    concept: "Measurement precision — targeting readiness, not aggression.",
    geometry: "Circle + cross hairs + centre point. 1U grid.",
    feeling: "Lab instrument. Data-first.",
    risk: "Military / shooter games.",
    scores: { timeless: 3, scale: 4, brandFit: 4, diff: 4, mono: 5, concept: 3, purity: 5, versatile: 3 }
  },
  {
    id: "apex",
    letter: "H",
    name: "The Apex",
    concept: "Summit moment — mastery peak, single upward form.",
    geometry: "Isosceles triangle, base cut at 1/3 height (optical stability).",
    feeling: "Mountain finish. PR moment.",
    risk: "Delta / play button.",
    scores: { timeless: 4, scale: 5, brandFit: 3, diff: 2, mono: 5, concept: 3, purity: 5, versatile: 4 }
  },
  {
    id: "tension",
    letter: "I",
    name: "Tension Stroke",
    concept: "Current direction evolved — F upright + single tension arc (no pill).",
    geometry: "Stem + 2 horizontals + one crossing Bézier. Monochrome-first.",
    feeling: "Motion + measurement. Product-adjacent.",
    risk: "Still reads as letter + line.",
    scores: { timeless: 4, scale: 4, brandFit: 5, diff: 4, mono: 5, concept: 4, purity: 4, versatile: 5 }
  },
  {
    id: "fc-overlap",
    letter: "J",
    name: "FC Overlap",
    concept: "Geometric F + C as shapes — overlap creates negative-space arrow.",
    geometry: "Two rectilinear forms, 2U overlap, no curves.",
    feeling: "Monogram without circle cliché.",
    risk: "Needs explanation at small sizes.",
    scores: { timeless: 4, scale: 3, brandFit: 4, diff: 5, mono: 5, concept: 4, purity: 5, versatile: 4 }
  }
];

export function totalScore(d: MarkDirection): number {
  const s = d.scores;
  return (
    s.timeless +
    s.scale +
    s.brandFit +
    s.diff +
    s.mono +
    s.concept +
    s.purity +
    s.versatile
  );
}
