export type StravaTrpcService = {
  listActivities: (
    athleteId: string,
    limit?: number
  ) => Promise<
    Array<{
      id: string;
      name: string;
      sportType: string;
      distanceM: number;
      movingTimeSec: number;
      startDate: string;
      avgHr?: number;
      mapPolyline?: string;
    }>
  >;
  getActivity: (
    athleteId: string,
    stravaId: number
  ) => Promise<{
    activity: Record<string, unknown> | null;
    streams?: Record<string, unknown>;
  }>;
  sync: (athleteId: string) => Promise<{ count: number }>;
  connectionStatus: (athleteId: string) => Promise<{
    connected: boolean;
    lastSyncAt: string | null;
  }>;
};
