export type ProgressionStrategy =
  | "LINEAR"
  | "DOUBLE_PROGRESSION"
  | "REP_BASED"
  | "TIME_BASED"
  | "DISTANCE_BASED"
  | "PACE_BASED"
  | "POWER_BASED"
  | "AUTO_DELOAD"
  | "USER_DEFINED";

export type ProgressionInput = {
  strategy: ProgressionStrategy;
  previousLoadKg: number | null;
  previousReps: number | null;
  targetRepsMin: number;
  targetRepsMax: number;
  previousTimeSec: number | null;
  previousDistanceM: number | null;
  previousPaceSecPerKm: number | null;
  previousPowerW: number | null;
  readinessBand: string | null;
  /** When true, suggest deload — never auto-apply without product authorization */
  suggestDeload?: boolean;
};

export type ProgressionSuggestion = {
  nextLoadKg: number | null;
  nextReps: number | null;
  nextTimeSec: number | null;
  nextDistanceM: number | null;
  nextPaceSecPerKm: number | null;
  nextPowerW: number | null;
  deloadSuggested: boolean;
  explanation: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Never invent impossible values; never silently auto-deload. */
export function suggestProgression(input: ProgressionInput): ProgressionSuggestion {
  if (input.suggestDeload || input.strategy === "AUTO_DELOAD") {
    const load =
      input.previousLoadKg != null ? Number((input.previousLoadKg * 0.9).toFixed(1)) : null;
    return {
      nextLoadKg: load,
      nextReps: input.previousReps,
      nextTimeSec: input.previousTimeSec,
      nextDistanceM: input.previousDistanceM,
      nextPaceSecPerKm: input.previousPaceSecPerKm,
      nextPowerW: input.previousPowerW != null ? Math.round(input.previousPowerW * 0.9) : null,
      deloadSuggested: true,
      explanation:
        "Deload suggested from recovery/load context — review before applying. Not applied automatically."
    };
  }

  if (input.readinessBand === "RESTORE" || input.readinessBand === "RECOVER") {
    return {
      nextLoadKg: input.previousLoadKg,
      nextReps: input.previousReps,
      nextTimeSec: input.previousTimeSec,
      nextDistanceM: input.previousDistanceM,
      nextPaceSecPerKm: input.previousPaceSecPerKm,
      nextPowerW: input.previousPowerW,
      deloadSuggested: false,
      explanation: `Intensity held — readiness band ${input.readinessBand}. No load increase proposed.`
    };
  }

  switch (input.strategy) {
    case "DOUBLE_PROGRESSION":
    case "REP_BASED": {
      if (input.previousReps != null && input.previousReps >= input.targetRepsMax) {
        const nextLoad =
          input.previousLoadKg != null ? Number((input.previousLoadKg + 2.5).toFixed(1)) : null;
        return {
          nextLoadKg: nextLoad,
          nextReps: input.targetRepsMin,
          nextTimeSec: null,
          nextDistanceM: null,
          nextPaceSecPerKm: null,
          nextPowerW: null,
          deloadSuggested: false,
          explanation:
            "Hit top of rep range — propose small load increase and reset reps to range floor."
        };
      }
      return {
        nextLoadKg: input.previousLoadKg,
        nextReps:
          input.previousReps != null
            ? clamp(input.previousReps + 1, input.targetRepsMin, input.targetRepsMax)
            : input.targetRepsMin,
        nextTimeSec: null,
        nextDistanceM: null,
        nextPaceSecPerKm: null,
        nextPowerW: null,
        deloadSuggested: false,
        explanation: "Add one rep within the prescribed range before increasing load."
      };
    }
    case "LINEAR": {
      const nextLoad =
        input.previousLoadKg != null ? Number((input.previousLoadKg + 2.5).toFixed(1)) : null;
      return {
        nextLoadKg: nextLoad,
        nextReps: input.previousReps ?? input.targetRepsMin,
        nextTimeSec: null,
        nextDistanceM: null,
        nextPaceSecPerKm: null,
        nextPowerW: null,
        deloadSuggested: false,
        explanation: "Linear load step (+2.5 kg) — confirm based on last session quality."
      };
    }
    case "TIME_BASED": {
      const next =
        input.previousTimeSec != null ? input.previousTimeSec + 60 : input.previousTimeSec;
      return {
        nextLoadKg: null,
        nextReps: null,
        nextTimeSec: next,
        nextDistanceM: null,
        nextPaceSecPerKm: null,
        nextPowerW: null,
        deloadSuggested: false,
        explanation: "Extend work duration by ~60s when prior session completed as prescribed."
      };
    }
    case "DISTANCE_BASED": {
      const next =
        input.previousDistanceM != null
          ? Math.round(input.previousDistanceM * 1.05)
          : input.previousDistanceM;
      return {
        nextLoadKg: null,
        nextReps: null,
        nextTimeSec: null,
        nextDistanceM: next,
        nextPaceSecPerKm: null,
        nextPowerW: null,
        deloadSuggested: false,
        explanation: "Distance +5% proposal when prior distance target was met."
      };
    }
    case "PACE_BASED": {
      const next =
        input.previousPaceSecPerKm != null
          ? Math.max(150, input.previousPaceSecPerKm - 5)
          : null;
      return {
        nextLoadKg: null,
        nextReps: null,
        nextTimeSec: null,
        nextDistanceM: input.previousDistanceM,
        nextPaceSecPerKm: next,
        nextPowerW: null,
        deloadSuggested: false,
        explanation: "Slightly faster pace target (−5 s/km) — only if last session was controlled."
      };
    }
    case "POWER_BASED": {
      const next =
        input.previousPowerW != null ? Math.round(input.previousPowerW * 1.02) : null;
      return {
        nextLoadKg: null,
        nextReps: null,
        nextTimeSec: input.previousTimeSec,
        nextDistanceM: null,
        nextPaceSecPerKm: null,
        nextPowerW: next,
        deloadSuggested: false,
        explanation: "Power +2% proposal when prior power target was achieved."
      };
    }
    default:
      return {
        nextLoadKg: input.previousLoadKg,
        nextReps: input.previousReps,
        nextTimeSec: input.previousTimeSec,
        nextDistanceM: input.previousDistanceM,
        nextPaceSecPerKm: input.previousPaceSecPerKm,
        nextPowerW: input.previousPowerW,
        deloadSuggested: false,
        explanation: "User-defined progression — no automatic change."
      };
  }
}
