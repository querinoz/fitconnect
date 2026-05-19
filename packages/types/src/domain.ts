export type UserRole =
  | "athlete"
  | "coach"
  | "admin"
  | "federation"
  | "gym_owner";

export type RecoveryStatus = "green" | "amber" | "red";

export type WearableProvider =
  | "apple_health"
  | "health_connect"
  | "garmin"
  | "whoop"
  | "oura"
  | "polar"
  | "strava";

export type PlanBlock = {
  id: string;
  day: string;
  title: string;
  detail: string;
  intensity: string;
  completed: boolean;
};

export type ReadinessSnapshot = {
  athleteId: string;
  score: number;
  hrvMs: number;
  sleepHours: string;
  sleepEfficiency: number;
  recoveryStatus: RecoveryStatus;
  capturedAt: string;
};

export type SessionSummary = {
  id: string;
  athleteId: string;
  coachId: string;
  when: string;
  type: string;
  mode: "Online" | "In-person";
  intensity: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
};

export type ThreadMessage = {
  id: string;
  threadId: string;
  athleteId: string;
  coachId: string;
  from: "coach" | "athlete";
  preview: string;
  when: string;
  unread: boolean;
};
