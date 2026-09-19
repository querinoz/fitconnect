/**
 * V10.1 Device adapter contract + normalization + conflict + freshness.
 * UI never talks to vendors directly — only through adapters.
 */

import type { ProviderId } from "@fitconnect/types";
import { constraintsFor } from "@fitconnect/types";
import type { Confidence, Freshness } from "@/lib/sports-intelligence/events";

export type DeviceStatus =
  | "CONNECTED"
  | "SYNCING"
  | "SYNCED"
  | "STALE"
  | "DISCONNECTED"
  | "PERMISSION_REQUIRED"
  | "UNSUPPORTED"
  | "ERROR"
  | "NOT_CONNECTED";

export type DeviceCapabilities = {
  heartRate: boolean;
  hrv: boolean;
  sleep: boolean;
  gps: boolean;
  workoutControl: boolean;
};

export type NormalizedMetric = {
  metric: "heart_rate" | "hrv" | "sleep_hours" | "distance_m" | "pace_s_km" | "power_w" | "cadence_spm" | "calories_kcal" | "steps" | "training_load";
  value: number | null;
  unit: string;
  source: ProviderId | "MANUAL" | "UNKNOWN";
  sourceId: string | null;
  timestamp: string | null;
  ingestedAt: string;
  confidence: Confidence;
  freshness: Freshness;
  quality: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
};

export type DeviceAdapter = {
  providerId: ProviderId;
  connect(): Promise<{ status: DeviceStatus; note?: string }>;
  disconnect(): Promise<{ status: DeviceStatus }>;
  authorize(): Promise<{ status: DeviceStatus; note?: string }>;
  sync(): Promise<{ status: DeviceStatus; metrics: NormalizedMetric[]; note?: string }>;
  getCapabilities(): DeviceCapabilities;
  getStatus(): DeviceStatus;
  subscribe?(cb: (m: NormalizedMetric) => void): () => void;
  fetchHistory?(fromISO: string, toISO: string): Promise<NormalizedMetric[]>;
  getLatestMetrics(): NormalizedMetric[];
  handleError(err: unknown): { status: DeviceStatus; message: string };
};

export function computeFreshness(timestamp: string | null, now = Date.now()): Freshness {
  if (!timestamp) return "UNKNOWN";
  const age = now - Date.parse(timestamp);
  if (!Number.isFinite(age)) return "UNKNOWN";
  if (age <= 30_000) return "LIVE";
  if (age <= 15 * 60_000) return "RECENT";
  return "STALE";
}

export function normalizeMetric(input: {
  metric: NormalizedMetric["metric"];
  value: number | null;
  unit: string;
  source: NormalizedMetric["source"];
  sourceId?: string | null;
  timestamp?: string | null;
}): NormalizedMetric {
  const ts = input.timestamp ?? null;
  const freshness = computeFreshness(ts);
  return {
    metric: input.metric,
    value: input.value,
    unit: input.unit,
    source: input.source,
    sourceId: input.sourceId ?? null,
    timestamp: ts,
    ingestedAt: new Date().toISOString(),
    confidence: input.value == null ? "NOT_AVAILABLE" : freshness === "STALE" ? "LOW" : "MEDIUM",
    freshness,
    quality: input.value == null ? "UNKNOWN" : "MEDIUM"
  };
}

/** Source priority for conflict resolution — Strava never wins social/public paths (constraints). */
const SOURCE_PRIORITY: Record<string, number> = {
  HEALTH_CONNECT: 100,
  HEALTHKIT: 100,
  GARMIN: 90,
  WHOOP: 90,
  OURA: 80,
  WEAROS: 85,
  MANUAL: 40,
  STRAVA: 20,
  UNKNOWN: 0
};

export type MetricConflict = {
  metric: string;
  kept: NormalizedMetric;
  rejected: NormalizedMetric;
  reason: string;
};

export function resolveMetricConflict(
  a: NormalizedMetric,
  b: NormalizedMetric
): { winner: NormalizedMetric; conflict: MetricConflict | null } {
  if (a.metric !== b.metric) {
    return { winner: a, conflict: null };
  }
  const pa = SOURCE_PRIORITY[a.source] ?? 0;
  const pb = SOURCE_PRIORITY[b.source] ?? 0;
  const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
  const tb = b.timestamp ? Date.parse(b.timestamp) : 0;

  let winner = a;
  let rejected = b;
  let reason = "source_priority";

  if (pb > pa) {
    winner = b;
    rejected = a;
    reason = "source_priority";
  } else if (pb === pa) {
    if (tb > ta) {
      winner = b;
      rejected = a;
      reason = "newer_timestamp";
    } else if (tb === ta && (b.quality === "HIGH" || b.confidence === "HIGH")) {
      winner = b;
      rejected = a;
      reason = "higher_quality";
    }
  }

  // Never silently prefer Strava for shareable contexts
  if (winner.source === "STRAVA") {
    const c = constraintsFor("STRAVA");
    if (!c.shareable) {
      reason = `${reason}; strava_non_shareable_kept_for_owner_only`;
    }
  }

  return {
    winner,
    conflict: {
      metric: a.metric,
      kept: winner,
      rejected,
      reason
    }
  };
}

/** Per-user registry — NEVER share connection state across identities */
export type DeviceRegistryEntry = {
  providerId: ProviderId;
  status: DeviceStatus;
  capabilities: DeviceCapabilities;
  lastSyncAt: string | null;
  note: string;
};

const CATALOG: ProviderId[] = [
  "HEALTH_CONNECT",
  "HEALTHKIT",
  "GARMIN",
  "WHOOP",
  "STRAVA"
];

/** key = `${userId}:${providerId}` */
const registry = new Map<string, DeviceRegistryEntry>();

function registryKey(userId: string, providerId: ProviderId): string {
  return `${userId}:${providerId}`;
}

function defaultEntry(providerId: ProviderId): DeviceRegistryEntry {
  const c = constraintsFor(providerId);
  return {
    providerId,
    status: c.enabled ? "NOT_CONNECTED" : "UNSUPPORTED",
    capabilities: {
      heartRate: providerId !== "STRAVA",
      hrv:
        providerId === "WHOOP" ||
        providerId === "OURA" ||
        providerId === "HEALTH_CONNECT" ||
        providerId === "HEALTHKIT",
      sleep:
        providerId === "WHOOP" ||
        providerId === "OURA" ||
        providerId === "HEALTH_CONNECT" ||
        providerId === "HEALTHKIT",
      gps: providerId === "GARMIN" || providerId === "HEALTH_CONNECT" || providerId === "HEALTHKIT",
      workoutControl: providerId === "HEALTH_CONNECT" || providerId === "HEALTHKIT"
    },
    lastSyncAt: null,
    note:
      providerId === "STRAVA"
        ? "Owner-only. Never social. Never ML training."
        : "NOT_CONNECTED until athlete authorizes a live provider session."
  };
}

export function isCatalogProvider(providerId: string): providerId is ProviderId {
  return (CATALOG as string[]).includes(providerId);
}

export function listDeviceRegistry(userId: string): DeviceRegistryEntry[] {
  return CATALOG.map((providerId) => {
    const existing = registry.get(registryKey(userId, providerId));
    return existing ?? defaultEntry(providerId);
  });
}

export function setDeviceRegistryEntry(userId: string, entry: DeviceRegistryEntry): void {
  if (!isCatalogProvider(entry.providerId)) {
    throw new Error("provider_not_in_catalog");
  }
  registry.set(registryKey(userId, entry.providerId), entry);
}

export function __resetDeviceRegistry(): void {
  registry.clear();
}

/**
 * Manual / demo adapter that never fabricates biometrics — only accepts explicit payloads.
 */
export function createManualDeviceAdapter(): DeviceAdapter {
  let status: DeviceStatus = "NOT_CONNECTED";
  let latest: NormalizedMetric[] = [];
  return {
    providerId: "MANUAL",
    async connect() {
      status = "CONNECTED";
      return { status, note: "Manual adapter connected — metrics only when explicitly provided." };
    },
    async disconnect() {
      status = "DISCONNECTED";
      latest = [];
      return { status };
    },
    async authorize() {
      status = "CONNECTED";
      return { status };
    },
    async sync() {
      status = latest.length ? "SYNCED" : "CONNECTED";
      return { status, metrics: latest, note: "No fabricated samples." };
    },
    getCapabilities() {
      return { heartRate: true, hrv: true, sleep: true, gps: false, workoutControl: false };
    },
    getStatus() {
      return status;
    },
    getLatestMetrics() {
      return latest;
    },
    handleError(err) {
      status = "ERROR";
      return { status, message: err instanceof Error ? err.message : "device_error" };
    }
  };
}
