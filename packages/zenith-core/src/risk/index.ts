/**
 * Risk signal engine — performance attention levels, never diagnosis.
 */

import type { RiskLevel } from "../schemas";
import type { RecoveryState } from "../schemas";
import type { LoadBand } from "../schemas";
import type { ReadinessState } from "../schemas";
import { ZENITH_CORE_VERSION } from "../schemas";

export type RiskSignalInput = {
  readinessState: ReadinessState;
  recoveryState: RecoveryState;
  loadBand: LoadBand;
  /** Consecutive days recovery below baseline / LOW, if tracked. */
  lowRecoveryStreakDays?: number;
};

export type RiskSignal = {
  level: RiskLevel;
  code: string;
  message: string;
  disclaimer: string;
  engineVersion: typeof ZENITH_CORE_VERSION;
};

export function evaluateRiskSignals(input: RiskSignalInput): RiskSignal[] {
  const disclaimer =
    "These signals are training-load attention markers — not a medical diagnosis.";
  const signals: RiskSignal[] = [];

  if (
    input.readinessState === "CRITICAL" ||
    input.recoveryState === "LOW"
  ) {
    signals.push({
      level: input.readinessState === "CRITICAL" ? "HIGH" : "ATTENTION",
      code: "RECOVERY_LOW",
      message:
        "Recovery indicators are associated with reduced readiness for high load.",
      disclaimer,
      engineVersion: ZENITH_CORE_VERSION,
    });
  }

  if (input.loadBand === "EXTREME") {
    signals.push({
      level: "HIGH",
      code: "LOAD_EXTREME",
      message:
        "Acute:chronic load is in an extreme band relative to recent history.",
      disclaimer,
      engineVersion: ZENITH_CORE_VERSION,
    });
  } else if (input.loadBand === "HIGH") {
    signals.push({
      level: "ATTENTION",
      code: "LOAD_HIGH",
      message: "Training load is elevated versus chronic baseline.",
      disclaimer,
      engineVersion: ZENITH_CORE_VERSION,
    });
  }

  if ((input.lowRecoveryStreakDays ?? 0) >= 3) {
    signals.push({
      level: "ATTENTION",
      code: "RECOVERY_STREAK",
      message:
        "Recovery has remained below preferred range for several days.",
      disclaimer,
      engineVersion: ZENITH_CORE_VERSION,
    });
  }

  if (input.readinessState === "UNKNOWN" || input.recoveryState === "UNKNOWN") {
    signals.push({
      level: "INFO",
      code: "INSUFFICIENT_DATA",
      message: "Insufficient telemetry for a confident risk assessment.",
      disclaimer,
      engineVersion: ZENITH_CORE_VERSION,
    });
  }

  if (signals.length === 0) {
    signals.push({
      level: "INFO",
      code: "STABLE",
      message: "No elevated performance risk signals from available metrics.",
      disclaimer,
      engineVersion: ZENITH_CORE_VERSION,
    });
  }

  return signals;
}
