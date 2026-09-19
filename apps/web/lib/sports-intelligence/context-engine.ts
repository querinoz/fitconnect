/**
 * Real-time context engine — reduces athlete events into AthleteContext.
 * Absence of data → NOT_AVAILABLE / MISSING. Never invents biometrics.
 */

import type { AthleteContext, AthleteEvent, Confidence, MetricSample } from "./events";
import { computeTrainingLoad, type LoadSession } from "./training-load";

function emptyMetric(): MetricSample {
  return {
    value: null,
    unit: "",
    source: "NONE",
    timestamp: null,
    ingestedAt: new Date().toISOString(),
    confidence: "NOT_AVAILABLE",
    freshness: "UNKNOWN",
    provenance: "MISSING"
  };
}

function freshnessFrom(ts: string | null, now = Date.now()): MetricSample["freshness"] {
  if (!ts) return "UNKNOWN";
  const age = now - Date.parse(ts);
  if (!Number.isFinite(age)) return "UNKNOWN";
  if (age <= 30_000) return "LIVE";
  if (age <= 15 * 60_000) return "RECENT";
  return "STALE";
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function buildAthleteContext(params: {
  userId: string;
  events: AthleteEvent[];
  primarySport?: string | null;
  goal?: string | null;
  loadSessions?: LoadSession[];
}): AthleteContext {
  const nowIso = new Date().toISOString();
  const ctx: AthleteContext = {
    userId: params.userId,
    identity: {
      primarySport: params.primarySport ?? null,
      goal: params.goal ?? null
    },
    training: {
      activeSessionId: null,
      phase: "IDLE",
      lastCompletedAt: null,
      trainingLoadLabel: null
    },
    recovery: {
      readinessScore: null,
      readinessState: "NOT_AVAILABLE",
      recoveryNote: null
    },
    nutrition: {
      lastLoggedAt: null,
      hydrationMlToday: null
    },
    device: {
      status: "NOT_CONNECTED",
      providers: [],
      lastSyncAt: null
    },
    competition: {
      nextEventAt: null,
      phase: null
    },
    schedule: {
      availableMinToday: null
    },
    metrics: {
      heartRate: null,
      hrv: null,
      sleepHours: null
    },
    confidence: "NOT_AVAILABLE",
    lastUpdated: nowIso,
    dataSources: [],
    safety: {
      flags: [],
      note: null
    }
  };

  const sources = new Set<string>();
  let hydrationToday = 0;
  const todayPrefix = nowIso.slice(0, 10);

  /** Device-backed biometric sources may be REAL; client/manual/MCP are ESTIMATED. */
  function metricProvenance(
    source: string,
    value: number | null
  ): MetricSample["provenance"] {
    if (value == null) return "MISSING";
    const deviceBacked = new Set([
      "WEAROS",
      "HEALTH_CONNECT",
      "HEALTHKIT",
      "GARMIN",
      "WHOOP"
    ]);
    return deviceBacked.has(source) ? "REAL" : "ESTIMATED";
  }

  for (const e of params.events) {
    sources.add(e.source);
    switch (e.type) {
      case "WORKOUT_STARTED":
      case "SPORT_ACTIVITY_STARTED":
        ctx.training.activeSessionId =
          typeof e.payload.sessionId === "string" ? e.payload.sessionId : ctx.training.activeSessionId;
        ctx.training.phase = "ACTIVE";
        break;
      case "WORKOUT_PAUSED":
        ctx.training.phase = "PAUSED";
        break;
      case "WORKOUT_RESUMED":
        ctx.training.phase = "ACTIVE";
        break;
      case "WORKOUT_COMPLETED":
      case "SPORT_ACTIVITY_COMPLETED":
        // After completion with no active session → IDLE (COMPLETED is transitional)
        ctx.training.phase = "IDLE";
        ctx.training.lastCompletedAt = e.timestamp;
        ctx.training.activeSessionId = null;
        break;
      case "HEART_RATE_UPDATED": {
        const v = num(e.payload.bpm);
        ctx.metrics.heartRate = {
          value: v,
          unit: "bpm",
          source: e.source,
          sourceId: typeof e.payload.sourceId === "string" ? e.payload.sourceId : null,
          timestamp: e.timestamp,
          ingestedAt: nowIso,
          confidence: v == null ? "NOT_AVAILABLE" : metricProvenance(e.source, v) === "REAL" ? "MEDIUM" : "LOW",
          freshness: freshnessFrom(e.timestamp),
          provenance: metricProvenance(e.source, v)
        };
        break;
      }
      case "HRV_UPDATED": {
        const v = num(e.payload.hrvMs);
        ctx.metrics.hrv = {
          value: v,
          unit: "ms",
          source: e.source,
          timestamp: e.timestamp,
          ingestedAt: nowIso,
          confidence: v == null ? "NOT_AVAILABLE" : metricProvenance(e.source, v) === "REAL" ? "MEDIUM" : "LOW",
          freshness: freshnessFrom(e.timestamp),
          provenance: metricProvenance(e.source, v)
        };
        break;
      }
      case "SLEEP_UPDATED": {
        const v = num(e.payload.hours);
        ctx.metrics.sleepHours = {
          value: v,
          unit: "h",
          source: e.source,
          timestamp: e.timestamp,
          ingestedAt: nowIso,
          confidence: v == null ? "NOT_AVAILABLE" : metricProvenance(e.source, v) === "REAL" ? "MEDIUM" : "LOW",
          freshness: freshnessFrom(e.timestamp),
          provenance: metricProvenance(e.source, v)
        };
        break;
      }
      case "READINESS_UPDATED": {
        const score = num(e.payload.score);
        ctx.recovery.readinessScore = score;
        ctx.recovery.readinessState = score == null ? "NOT_AVAILABLE" : "MEDIUM";
        break;
      }
      case "RECOVERY_UPDATED":
        ctx.recovery.recoveryNote =
          typeof e.payload.note === "string" ? e.payload.note : ctx.recovery.recoveryNote;
        break;
      case "DEVICE_CONNECTED":
        ctx.device.status = "CONNECTED";
        if (typeof e.payload.providerId === "string") {
          if (!ctx.device.providers.includes(e.payload.providerId)) {
            ctx.device.providers.push(e.payload.providerId);
          }
        }
        break;
      case "DEVICE_DISCONNECTED":
        ctx.device.status = "DISCONNECTED";
        break;
      case "SYNC_STARTED":
        ctx.device.status = "SYNCING";
        break;
      case "SYNC_COMPLETED":
        ctx.device.status = "SYNCED";
        ctx.device.lastSyncAt = e.timestamp;
        break;
      case "SYNC_FAILED":
        ctx.device.status = "ERROR";
        break;
      case "NUTRITION_LOGGED":
      case "MEAL_COMPLETED":
        ctx.nutrition.lastLoggedAt = e.timestamp;
        break;
      case "HYDRATION_LOGGED": {
        const ml = num(e.payload.ml);
        if (ml != null && e.timestamp.slice(0, 10) === todayPrefix) {
          hydrationToday += ml;
          ctx.nutrition.hydrationMlToday = hydrationToday;
        }
        break;
      }
      default:
        break;
    }
  }

  const load = computeTrainingLoad(params.loadSessions ?? []);
  ctx.training.trainingLoadLabel = load.label === "UNKNOWN" ? null : load.label;
  if (load.label === "SPIKE") {
    ctx.safety.flags.push("TRAINING_LOAD_SPIKE");
    ctx.safety.note =
      "ACWR-lite auxiliary signal elevated — not a medical diagnosis, injury prediction, or readiness guarantee. Consider volume caution.";
  }

  ctx.dataSources = [...sources];
  ctx.lastUpdated = params.events.at(-1)?.timestamp ?? nowIso;

  const confidences: Confidence[] = [];
  if (ctx.metrics.heartRate) confidences.push(ctx.metrics.heartRate.confidence);
  if (ctx.recovery.readinessState !== "NOT_AVAILABLE") confidences.push(ctx.recovery.readinessState);
  if (load.confidence !== "NOT_AVAILABLE") confidences.push(load.confidence);
  if (!confidences.length) ctx.confidence = "NOT_AVAILABLE";
  else if (confidences.includes("LOW") || confidences.includes("NOT_AVAILABLE")) ctx.confidence = "LOW";
  else if (confidences.includes("MEDIUM")) ctx.confidence = "MEDIUM";
  else ctx.confidence = "HIGH";

  // Stale live metric honesty
  if (ctx.metrics.heartRate?.freshness === "STALE" && ctx.training.phase === "ACTIVE") {
    ctx.safety.flags.push("STALE_HEART_RATE");
    ctx.safety.note = (ctx.safety.note ?? "") + " Heart rate sample is STALE — not shown as LIVE.";
  }

  if (!ctx.metrics.heartRate) ctx.metrics.heartRate = emptyMetric();
  if (!ctx.metrics.hrv) ctx.metrics.hrv = emptyMetric();
  if (!ctx.metrics.sleepHours) ctx.metrics.sleepHours = emptyMetric();

  return ctx;
}

/**
 * Suggest TRAIN adaptation from context — NEVER auto-mutates the plan.
 * Returns explainable recommendation only.
 */
export function suggestLiveAdaptation(ctx: AthleteContext): {
  action: "NONE" | "REDUCE_INTENSITY" | "EXTEND_REST" | "CAUTION";
  what: string;
  why: string;
  data: string[];
  confidence: Confidence;
  requiresConfirm: true;
} {
  if (ctx.safety.flags.includes("TRAINING_LOAD_SPIKE")) {
    return {
      action: "REDUCE_INTENSITY",
      what: "Suggest reduced intensity / volume for remaining work",
      why: "Acute:chronic workload ratio in SPIKE band",
      data: [`trainingLoad=${ctx.training.trainingLoadLabel}`, `confidence=${ctx.confidence}`],
      confidence: "MEDIUM",
      requiresConfirm: true
    };
  }
  if (ctx.safety.flags.includes("STALE_HEART_RATE") && ctx.training.phase === "ACTIVE") {
    return {
      action: "CAUTION",
      what: "Keep current plan; do not treat HR as live",
      why: "Latest heart-rate sample is STALE",
      data: [`freshness=${ctx.metrics.heartRate?.freshness}`],
      confidence: "LOW",
      requiresConfirm: true
    };
  }
  return {
    action: "NONE",
    what: "No automatic adaptation",
    why: "Insufficient live risk signals",
    data: [`phase=${ctx.training.phase}`, `confidence=${ctx.confidence}`],
    confidence: ctx.confidence,
    requiresConfirm: true
  };
}
