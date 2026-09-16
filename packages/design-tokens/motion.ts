/** Shared motion tokens — Zenith / Elite OS (web + mobile + Compose via Kotlin gen). */
export const MOTION_TOKENS = {
  /**
   * Canonical duration ladder (seconds).
   * Keep `micro` / `ui` / `screen` / `data` keys stable for Kotlin generator.
   */
  micro: 0.15,
  ui: 0.22,
  screen: 0.4,
  data: 1.2,

  /**
   * Zenith Experience Engine aliases (seconds).
   * Maps onto the canonical ladder — prefer these names in new code.
   */
  zenith: {
    instant: 0.09,
    fast: 0.15,
    normal: 0.22,
    slow: 0.34,
    cinematic: 0.8
  },

  /** Stagger between sibling reveals (seconds). Cap ~6 children. */
  stagger: 0.028,

  ease: {
    /** Assentamento sem overshoot. O defeito do sistema. */
    kinetic: [0.16, 1, 0.3, 1] as const,
    /** Standard / power1.out-ish — presses, toggles. */
    standard: [0.33, 1, 0.68, 1] as const,
    /** Symmetric traverse — tabs, reorder. */
    traverse: [0.65, 0, 0.35, 1] as const,
    /** Large surfaces — sheets, modals. */
    surface: [0.25, 1, 0.5, 1] as const,
    /** Exit only. */
    exit: [0.4, 0, 1, 1] as const,
    /** Realtime telemetry clocks. */
    realtime: "linear" as const,
    /**
     * ~50% de overshoot. PROIBIDO em elementos que representam numeros
     * (ELITE_OS_MOTION_LANGUAGE.md §1 e §4.1). Unico uso autorizado: selo de
     * confirmacao de recorde pessoal. Sem uso em componentes a 2026-08-18.
     */
    snap: [0.25, 1.5, 0.5, 1] as const
  },

  /**
   * Named springs for Motion (type: "spring").
   * Telemetry spring has zero bounce intent — high damping, used for chrome only;
   * metric numbers use duration + settle ease, never spring overshoot.
   */
  spring: {
    snappy: { stiffness: 520, damping: 36, mass: 0.7 },
    soft: { stiffness: 260, damping: 28, mass: 1 },
    heavy: { stiffness: 180, damping: 26, mass: 1.2 },
    telemetry: { stiffness: 320, damping: 40, mass: 0.85 },
    navigation: { stiffness: 380, damping: 32, mass: 0.8 }
  },

  gsapZones: ["hero-immersive", "marketing-demos", "device-showcase"] as const
} as const;

export type MotionTokens = typeof MOTION_TOKENS;
