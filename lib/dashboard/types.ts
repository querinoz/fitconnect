import type { AICoPilotAlert, LiveTick, Reaction } from "@/lib/realtime/types";

export type RecoveryStatus = "green" | "amber" | "red";

export type PlanBlock = {
  id: string;
  day: string;
  title: string;
  detail: string;
  intensity: string;
  completed: boolean;
};

export type CoachPlan = {
  id: string;
  athleteId: string;
  coachId: string;
  weekLabel: string;
  aiSuggestion: string;
  approvedLabel: string;
  blocks: PlanBlock[];
  updatedAt: string;
};

export type DashboardAthlete = {
  id: string;
  name: string;
  avatar: string;
  sports: string[];
  coachId: string;
  readiness: number;
  hrv: number;
  sleepHours: string;
  sleepEfficiency: number;
  vo2max: number;
  recoveryStatus: RecoveryStatus;
  goalTitle: string;
  goalProgress: number;
  streakWeeks: number;
};

export type DashboardSession = {
  id: string;
  athleteId: string;
  coachId: string;
  when: string;
  type: string;
  mode: "Online" | "In-person";
  intensity: string;
};

export type DashboardMessage = {
  id: string;
  athleteId: string;
  coachId: string;
  from: "coach" | "athlete";
  preview: string;
  when: string;
  unread: boolean;
};

export type CoachMetrics = {
  coachId: string;
  activeAthletes: number;
  revenueMtd: string;
  sessionsWeek: number;
  retention: number;
};

export type ChartPoint = { d: string; load?: number; rpe?: number; rev?: number };
export type TrendPoint = { m: string; kpi?: number; hrv?: number; rate?: number };
export type SleepPoint = { d: string; sleep: number; deep: number; hrv: number };

export type HabitItem = {
  id: string;
  athleteId: string;
  name: string;
  done: boolean;
  streak: number;
};

export type LiveSessionIntent = "z2" | "intervals" | "recovery";

export type LiveSession = {
  athleteId: string;
  intent: LiveSessionIntent;
  startedAt: string;
  ticks: LiveTick[];
  endedAt?: string;
};

export type DashboardState = {
  athletes: DashboardAthlete[];
  plans: CoachPlan[];
  sessions: DashboardSession[];
  messages: DashboardMessage[];
  habits: HabitItem[];
  coachMetrics: CoachMetrics[];
  weeklyVolume: ChartPoint[];
  monthlyTrend: TrendPoint[];
  sleepWeek: SleepPoint[];
  revenueWeekly: ChartPoint[];
  retentionTrend: TrendPoint[];
  liveSessions: Record<string, LiveSession>;
  reactions: Record<string, Reaction[]>;
  aiAlerts: AICoPilotAlert[];
};
