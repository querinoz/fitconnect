/**
 * Honest telemetry surface states — never invent biometric values.
 * Aligns with MCP gateway: MISSING / UNAVAILABLE / NOT_CONNECTED.
 */
export type TelemetrySurfaceState =
  | "loading"
  | "ready"
  | "empty"
  | "missing"
  | "unavailable"
  | "not_connected"
  | "error";

export type TelemetryDatum<T = number> = {
  state: TelemetrySurfaceState;
  value: T | null;
  unit?: string;
  label: string;
  source?: string;
  detail?: string;
};

export function datumFromScore(
  label: string,
  score: number | null | undefined,
  opts?: { source?: string; unit?: string; unauthorized?: boolean; offline?: boolean }
): TelemetryDatum {
  if (opts?.unauthorized) {
    return {
      state: "error",
      value: null,
      label,
      source: opts.source,
      detail: "Sign in required.",
      unit: opts.unit
    };
  }
  if (opts?.offline) {
    return {
      state: "unavailable",
      value: null,
      label,
      source: opts.source ?? "offline",
      detail: "Could not reach the readiness service.",
      unit: opts.unit
    };
  }
  if (typeof score === "number" && Number.isFinite(score)) {
    return {
      state: "ready",
      value: Math.round(score),
      label,
      source: opts?.source,
      unit: opts?.unit ?? "score"
    };
  }
  const source = opts?.source ?? "unavailable";
  if (source === "not_connected" || source === "insufficient_data") {
    return {
      state: source === "not_connected" ? "not_connected" : "missing",
      value: null,
      label,
      source,
      detail:
        source === "not_connected"
          ? "No wearable connected for this metric."
          : "Inputs required for this metric are missing.",
      unit: opts?.unit
    };
  }
  return {
    state: "unavailable",
    value: null,
    label,
    source,
    detail: "Metric is not available. We do not invent biometrics.",
    unit: opts?.unit
  };
}

export function surfaceLabel(state: TelemetrySurfaceState): string {
  switch (state) {
    case "loading":
      return "Loading";
    case "ready":
      return "Ready";
    case "empty":
      return "Empty";
    case "missing":
      return "Missing";
    case "unavailable":
      return "Unavailable";
    case "not_connected":
      return "Not connected";
    case "error":
      return "Error";
  }
}
