/**
 * FitConnect integrations — in-memory store with demo fallback.
 * Production: swap token persistence for Prisma WearableConnection + encrypted vault.
 */
import type { WearableProvider } from "@fitconnect/types";

export type IntegrationStatus = "connected" | "disconnected" | "syncing" | "error";

export type IntegrationConnection = {
  provider: WearableProvider;
  athleteId: string;
  status: IntegrationStatus;
  connectedAt: string;
  lastSyncAt: string | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  externalAthleteId?: string;
  metadata?: Record<string, unknown>;
};

export type IntegrationActivity = {
  id: string;
  provider: "strava";
  name: string;
  type: string;
  distanceM: number;
  movingTimeSec: number;
  startDate: string;
  avgHr?: number;
  elevationGainM?: number;
  mapPolyline?: string;
};

export type IntegrationSyncLog = {
  id: string;
  provider: string;
  at: string;
  action: string;
  ok: boolean;
  detail?: string;
};

type StoreState = {
  connections: Map<string, IntegrationConnection>;
  activities: Map<string, IntegrationActivity[]>;
  logs: IntegrationSyncLog[];
};

const globalStore = globalThis as typeof globalThis & {
  __fcIntegrations?: StoreState;
};

function store(): StoreState {
  if (!globalStore.__fcIntegrations) {
    globalStore.__fcIntegrations = {
      connections: new Map(),
      activities: new Map(),
      logs: []
    };
  }
  return globalStore.__fcIntegrations;
}

function key(athleteId: string, provider: string) {
  return `${athleteId}:${provider}`;
}

export function getConnection(athleteId: string, provider: string) {
  return store().connections.get(key(athleteId, provider)) ?? null;
}

export function listConnections(athleteId: string): IntegrationConnection[] {
  return [...store().connections.values()].filter((c) => c.athleteId === athleteId);
}

export function upsertConnection(conn: IntegrationConnection) {
  store().connections.set(key(conn.athleteId, conn.provider), conn);
}

export function disconnectIntegration(athleteId: string, provider: string) {
  store().connections.delete(key(athleteId, provider));
}

export function setActivities(athleteId: string, activities: IntegrationActivity[]) {
  store().activities.set(athleteId, activities);
}

export function getActivities(athleteId: string, limit = 5) {
  return (store().activities.get(athleteId) ?? []).slice(0, limit);
}

export function pushLog(entry: Omit<IntegrationSyncLog, "id">) {
  const log: IntegrationSyncLog = { ...entry, id: `log-${Date.now()}` };
  store().logs.unshift(log);
  store().logs = store().logs.slice(0, 50);
  return log;
}

export function getLogs(limit = 8) {
  return store().logs.slice(0, limit);
}

export const DEMO_STRAVA_ACTIVITIES: IntegrationActivity[] = [
  {
    id: "demo-1",
    provider: "strava",
    name: "Morning Threshold Run",
    type: "Run",
    distanceM: 12400,
    movingTimeSec: 3180,
    startDate: new Date(Date.now() - 86400000).toISOString(),
    avgHr: 158,
    elevationGainM: 42
  },
  {
    id: "demo-2",
    provider: "strava",
    name: "Recovery Ride",
    type: "Ride",
    distanceM: 28500,
    movingTimeSec: 4200,
    startDate: new Date(Date.now() - 172800000).toISOString(),
    avgHr: 128,
    elevationGainM: 180
  },
  {
    id: "demo-3",
    provider: "strava",
    name: "Strength · Coach block",
    type: "Workout",
    distanceM: 0,
    movingTimeSec: 2700,
    startDate: new Date(Date.now() - 259200000).toISOString(),
    avgHr: 112
  }
];

export function seedDemoStrava(athleteId: string) {
  upsertConnection({
    provider: "strava",
    athleteId,
    status: "connected",
    connectedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastSyncAt: new Date().toISOString(),
    externalAthleteId: "demo-strava-athlete",
    metadata: { demo: true, athleteName: "Inês M." }
  });
  setActivities(athleteId, DEMO_STRAVA_ACTIVITIES);
  pushLog({
    provider: "strava",
    at: new Date().toISOString(),
    action: "demo_seed",
    ok: true,
    detail: "Demo Strava activities loaded"
  });
}
