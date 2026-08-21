/**
 * Semantic + chart colour roles — references COLOR_TOKENS keys (not new hues).
 * Kotlin generator resolves these to the same ARGB as the referenced colour.
 */
export const SEMANTIC_TOKENS = {
  success: "performance",
  warning: "recovery",
  danger: "alert",
  info: "telemetry",
  focus: "iris",
  cta: "voltline",
  trust: "connect",
} as const;

/**
 * Papeis de grafico -> token de cor.
 *
 * Os papeis que aparecem como SERIE num grafico apontam para chartSeries*, nao para
 * as hues canonicas a brilho pleno: essas reprovam a banda de lightness do modo
 * escuro e, no caso de connect vs telemetry, sao indistinguiveis para visao normal.
 *
 * heartRate mantem `alert` de proposito -- e leitura de ESTADO (zona), nao uma serie
 * entre outras, e a convencao de dominio e vermelha. Nunca o uses ao lado de outra
 * serie no mesmo grafico.
 */
export const CHART_TOKENS = {
  hrv: "chartSeries1",
  heartRate: "alert",
  readiness: "chartSeries2",
  sleep: "chartSeries3",
  recovery: "chartSeries4",
  performance: "performance",
  trainingLoad: "chartSeries1",
  weight: "chartSeries3",
  hydration: "chartSeries1",
} as const;

/** Ordem FIXA de atribuicao de series. Nunca ciclar; a 5a serie vira "Outros". */
export const CHART_SERIES_ORDER = [
  "chartSeries1",
  "chartSeries2",
  "chartSeries3",
  "chartSeries4",
] as const;

export const GRADIENT_TOKENS = {
  floorFade: ["floor", "surface"],
  voltGlow: ["voltlineDim", "floor"],
  glass: ["surfaceContainer", "elevated"],
} as const;
