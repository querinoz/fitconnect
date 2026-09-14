// Canonical implementation lives in @fitconnect/utils — re-exported here for backwards compatibility.
export type { ReadinessInputs, ReadinessResult } from "@fitconnect/utils";
export {
  computeReadiness,
  computeReadinessForApi,
  generateHrvSeries,
  hasCompleteReadinessInputs,
  mapRecoveryToComputeStatus,
  readinessGreeting
} from "@fitconnect/utils";
