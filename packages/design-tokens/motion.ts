/** Shared motion tokens — Kinetic Energy design system (web + mobile). */
export const MOTION_TOKENS = {
  /** Micro-interactions: hover, toggle, badge pulse */
  micro: 0.15,
  /** UI transitions: panels, tabs, cards */
  ui: 0.22,
  /** Screen entrance: hero, dashboard sections */
  screen: 0.4,
  /** Live data pulse: readiness dial, HRV wave */
  data: 1.2,
  ease: {
    /** Assentamento sem overshoot. O defeito do sistema. */
    kinetic: [0.16, 1, 0.3, 1] as const,
    /**
     * ~50% de overshoot. PROIBIDO em elementos que representam numeros
     * (ELITE_OS_MOTION_LANGUAGE.md §1 e §4.1). Unico uso autorizado: selo de
     * confirmacao de recorde pessoal. Sem uso em componentes a 2026-08-18.
     */
    snap: [0.25, 1.5, 0.5, 1] as const
  },
  gsapZones: ["hero-immersive", "marketing-demos", "device-showcase"] as const
} as const;
