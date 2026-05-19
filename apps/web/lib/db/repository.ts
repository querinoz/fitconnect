import type { ReadinessSnapshot, SessionSummary, ThreadMessage } from "@fitconnect/types";
import { initialDashboardState, DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";
import { getPrisma } from "./client";

function mapRecovery(
  s: "green" | "amber" | "red"
): ReadinessSnapshot["recoveryStatus"] {
  return s;
}

export async function getAthleteReadiness(
  athleteId: string
): Promise<ReadinessSnapshot | null> {
  const db = getPrisma();
  if (db) {
    try {
      const row = await db.athleteProfile.findUnique({
        where: { externalId: athleteId }
      });
      if (!row) return null;
      return {
        athleteId: row.externalId,
        score: row.readiness,
        hrvMs: row.hrv,
        sleepHours: row.sleepHours,
        sleepEfficiency: row.sleepEfficiency,
        recoveryStatus:
          row.recoveryStatus === "GREEN"
            ? "green"
            : row.recoveryStatus === "AMBER"
              ? "amber"
              : "red",
        capturedAt: new Date().toISOString()
      };
    } catch {
      /* fall through to seed */
    }
  }

  const athlete = initialDashboardState.athletes.find((a) => a.id === athleteId);
  if (!athlete) return null;
  return {
    athleteId: athlete.id,
    score: athlete.readiness,
    hrvMs: athlete.hrv,
    sleepHours: athlete.sleepHours,
    sleepEfficiency: athlete.sleepEfficiency,
    recoveryStatus: mapRecovery(athlete.recoveryStatus),
    capturedAt: new Date().toISOString()
  };
}

export async function listAthleteSessions(
  athleteId: string
): Promise<SessionSummary[]> {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.session.findMany({
        where: { athleteExternalId: athleteId },
        orderBy: { scheduledAt: "desc" }
      });
      return rows.map((r) => ({
        id: r.externalId,
        athleteId: r.athleteExternalId,
        coachId: r.coachExternalId,
        when: r.scheduledAt.toISOString(),
        type: r.type,
        mode: r.mode === "ONLINE" ? "Online" : "In-person",
        intensity: r.intensity,
        status:
          r.status === "LIVE"
            ? "live"
            : r.status === "COMPLETED"
              ? "completed"
              : "scheduled"
      }));
    } catch {
      /* seed fallback */
    }
  }

  return initialDashboardState.sessions
    .filter((s) => s.athleteId === athleteId)
    .map((s) => ({
      id: s.id,
      athleteId: s.athleteId,
      coachId: s.coachId,
      when: s.when,
      type: s.type,
      mode: s.mode,
      intensity: s.intensity,
      status: (s.status ?? "scheduled") as SessionSummary["status"]
    }));
}

export async function listAthleteMessages(
  athleteId: string
): Promise<ThreadMessage[]> {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.message.findMany({
        where: { athleteExternalId: athleteId },
        orderBy: { sentAt: "desc" }
      });
      return rows.map((m) => ({
        id: m.externalId,
        threadId: m.coachExternalId,
        athleteId: m.athleteExternalId,
        coachId: m.coachExternalId,
        from: m.fromRole as "coach" | "athlete",
        preview: m.preview,
        when: m.sentAt.toISOString(),
        unread: m.unread
      }));
    } catch {
      /* seed fallback */
    }
  }

  return initialDashboardState.messages
    .filter((m) => m.athleteId === athleteId)
    .map((m) => ({
      id: m.id,
      threadId: m.coachId,
      athleteId: m.athleteId,
      coachId: m.coachId,
      from: m.from,
      preview: m.preview,
      when: m.when,
      unread: m.unread
    }));
}

export async function listCoachRoster(coachId: string) {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.athleteProfile.findMany({
        where: { coachExternalId: coachId },
        orderBy: { readiness: "desc" }
      });
      return rows.map((r) => ({
        id: r.externalId,
        name: r.name,
        avatar: r.avatar,
        sports: r.sports,
        coachId: r.coachExternalId,
        readiness: r.readiness,
        hrv: r.hrv,
        sleepHours: r.sleepHours,
        sleepEfficiency: r.sleepEfficiency,
        vo2max: r.vo2max,
        recoveryStatus:
          r.recoveryStatus === "GREEN"
            ? ("green" as const)
            : r.recoveryStatus === "AMBER"
              ? ("amber" as const)
              : ("red" as const),
        goalTitle: r.goalTitle,
        goalProgress: r.goalProgress,
        streakWeeks: r.streakWeeks
      }));
    } catch {
      /* seed fallback */
    }
  }

  return initialDashboardState.athletes.filter((a) => a.coachId === coachId);
}

export async function listCoachSessions(coachId: string): Promise<SessionSummary[]> {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.session.findMany({
        where: { coachExternalId: coachId },
        orderBy: { scheduledAt: "desc" }
      });
      return rows.map((r) => ({
        id: r.externalId,
        athleteId: r.athleteExternalId,
        coachId: r.coachExternalId,
        when: r.scheduledAt.toISOString(),
        type: r.type,
        mode: r.mode === "ONLINE" ? "Online" : "In-person",
        intensity: r.intensity,
        status:
          r.status === "LIVE"
            ? "live"
            : r.status === "COMPLETED"
              ? "completed"
              : "scheduled"
      }));
    } catch {
      /* seed fallback */
    }
  }

  return initialDashboardState.sessions
    .filter((s) => s.coachId === coachId)
    .map((s) => ({
      id: s.id,
      athleteId: s.athleteId,
      coachId: s.coachId,
      when: s.when,
      type: s.type,
      mode: s.mode,
      intensity: s.intensity,
      status: "scheduled" as const
    }));
}

export async function listCoachMessages(coachId: string): Promise<ThreadMessage[]> {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.message.findMany({
        where: { coachExternalId: coachId },
        orderBy: { sentAt: "desc" }
      });
      return rows.map((m) => ({
        id: m.externalId,
        threadId: m.athleteExternalId,
        athleteId: m.athleteExternalId,
        coachId: m.coachExternalId,
        from: m.fromRole as "coach" | "athlete",
        preview: m.preview,
        when: m.sentAt.toISOString(),
        unread: m.unread
      }));
    } catch {
      /* seed fallback */
    }
  }

  return initialDashboardState.messages
    .filter((m) => m.coachId === coachId)
    .map((m) => ({
      id: m.id,
      threadId: m.athleteId,
      athleteId: m.athleteId,
      coachId: m.coachId,
      from: m.from,
      preview: m.preview,
      when: m.when,
      unread: m.unread
    }));
}

export { DEMO_ATHLETE_ID };
