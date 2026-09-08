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

export type CoachDataSource = "postgres" | "seed" | "empty";

export async function listCoachRoster(coachId: string): Promise<{
  roster: Array<Record<string, unknown>>;
  source: CoachDataSource;
}> {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.athleteProfile.findMany({
        where: { coachExternalId: coachId },
        orderBy: { readiness: "desc" }
      });
      return {
        source: "postgres",
        roster: rows.map((r) => ({
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
        }))
      };
    } catch {
      // Database configured: never silently fall back to LOCAL_DEMO seed.
      return { source: "empty", roster: [] };
    }
  }

  return {
    source: "seed",
    roster: initialDashboardState.athletes.filter((a) => a.coachId === coachId)
  };
}

export async function listCoachSessions(coachId: string): Promise<{
  sessions: SessionSummary[];
  source: CoachDataSource;
}> {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.session.findMany({
        where: { coachExternalId: coachId },
        orderBy: { scheduledAt: "desc" }
      });
      return {
        source: "postgres",
        sessions: rows.map((r) => ({
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
                : r.status === "CANCELLED"
                  ? "cancelled"
                  : "scheduled"
        }))
      };
    } catch {
      return { source: "empty", sessions: [] };
    }
  }

  return {
    source: "seed",
    sessions: initialDashboardState.sessions
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
      }))
  };
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

export type CoachProgramRow = {
  id: string;
  title: string;
  weeks: number;
  sport: string;
  level: string;
  state: "draft" | "published" | "archived";
  version: number;
};

export async function listCoachPrograms(coachId: string): Promise<{
  programs: CoachProgramRow[];
  source: CoachDataSource;
}> {
  void coachId;
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.program.findMany({ orderBy: { title: "asc" } });
      return {
        source: "postgres",
        programs: rows.map((r) => ({
          id: r.externalId,
          title: r.title,
          weeks: r.weeks,
          sport: r.sport,
          level: r.level,
          state: "published" as const,
          version: 1
        }))
      };
    } catch {
      return { source: "empty", programs: [] };
    }
  }

  // Path A: never return seed fixtures as production coach programs.
  return { source: "empty", programs: [] };
}

export type CoachBookingRow = {
  id: string;
  athleteId: string;
  athleteName: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
};

/**
 * Bookings are session requests: scheduled sessions owned by the coach.
 * Approve keeps the session; reject deletes it (no CANCELLED enum yet).
 */
export async function listCoachBookings(coachId: string): Promise<{
  bookings: CoachBookingRow[];
  source: CoachDataSource;
}> {
  const { listMemoryBookingsForCoach } = await import("@/lib/db/bookings");
  const memory = listMemoryBookingsForCoach(coachId).map((b) => ({
    id: b.id,
    athleteId: b.athleteId,
    athleteName: b.athleteId,
    requestedAt: b.scheduledAt,
    status: b.status === "pending" ? ("pending" as const) : ("pending" as const),
    notes: b.notes ?? b.type
  }));

  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.session.findMany({
        where: {
          coachExternalId: coachId,
          status: "SCHEDULED",
          intensity: { not: "approved" }
        },
        orderBy: { scheduledAt: "asc" },
        include: { athlete: true }
      });
      return {
        source: "postgres",
        bookings: [
          ...rows.map((r) => ({
            id: r.externalId,
            athleteId: r.athleteExternalId,
            athleteName: r.athlete?.name ?? r.athleteExternalId,
            requestedAt: r.scheduledAt.toISOString(),
            status: "pending" as const,
            notes: `${r.type} · ${r.mode}`
          })),
          ...memory
        ]
      };
    } catch {
      return { source: "empty", bookings: memory };
    }
  }

  if (memory.length > 0) {
    return { source: "empty", bookings: memory };
  }

  return {
    source: "seed",
    bookings: initialDashboardState.sessions
      .filter((s) => s.coachId === coachId)
      .slice(0, 3)
      .map((s) => ({
        id: `booking-${s.id}`,
        athleteId: s.athleteId,
        athleteName: s.athleteId,
        requestedAt: s.when,
        status: "pending" as const,
        notes: s.type
      }))
  };
}

export async function approveCoachBooking(
  coachId: string,
  bookingId: string
): Promise<{ ok: boolean; source: CoachDataSource }> {
  const db = getPrisma();
  if (db) {
    try {
      const result = await db.session.updateMany({
        where: {
          externalId: bookingId,
          coachExternalId: coachId,
          status: "SCHEDULED"
        },
        data: { intensity: "approved" }
      });
      return { ok: result.count > 0, source: "postgres" };
    } catch {
      return { ok: false, source: "empty" };
    }
  }
  return { ok: false, source: "seed" };
}

export async function rejectCoachBooking(
  coachId: string,
  bookingId: string
): Promise<{ ok: boolean; source: CoachDataSource }> {
  const db = getPrisma();
  if (db) {
    try {
      const result = await db.session.deleteMany({
        where: {
          externalId: bookingId,
          coachExternalId: coachId,
          status: "SCHEDULED"
        }
      });
      return { ok: result.count > 0, source: "postgres" };
    } catch {
      return { ok: false, source: "empty" };
    }
  }
  return { ok: false, source: "seed" };
}

export async function coachOwnsAthlete(
  coachId: string,
  athleteId: string
): Promise<boolean> {
  const db = getPrisma();
  if (db) {
    try {
      const row = await db.athleteProfile.findFirst({
        where: { externalId: athleteId, coachExternalId: coachId },
        select: { id: true }
      });
      return Boolean(row);
    } catch {
      return false;
    }
  }
  return initialDashboardState.athletes.some(
    (a) => a.id === athleteId && a.coachId === coachId
  );
}

export async function getCoachAthleteDetail(
  coachId: string,
  athleteId: string
): Promise<{
  athlete: Record<string, unknown> | null;
  source: CoachDataSource;
}> {
  const owned = await coachOwnsAthlete(coachId, athleteId);
  if (!owned) {
    return { athlete: null, source: getPrisma() ? "empty" : "seed" };
  }

  const db = getPrisma();
  if (db) {
    try {
      const row = await db.athleteProfile.findFirst({
        where: { externalId: athleteId, coachExternalId: coachId }
      });
      if (!row) return { athlete: null, source: "empty" };
      const sessions = await db.session.findMany({
        where: { coachExternalId: coachId, athleteExternalId: athleteId },
        orderBy: { scheduledAt: "desc" },
        take: 20
      });
      return {
        source: "postgres",
        athlete: {
          id: row.externalId,
          name: row.name,
          sports: row.sports,
          readiness: row.readiness,
          hrv: row.hrv,
          sleepHours: row.sleepHours,
          sleepEfficiency: row.sleepEfficiency,
          recoveryStatus: row.recoveryStatus,
          goalTitle: row.goalTitle,
          goalProgress: row.goalProgress,
          streakWeeks: row.streakWeeks,
          sessionIds: sessions.map((s) => s.externalId)
        }
      };
    } catch {
      return { athlete: null, source: "empty" };
    }
  }

  const seed = initialDashboardState.athletes.find(
    (a) => a.id === athleteId && a.coachId === coachId
  );
  if (!seed) return { athlete: null, source: "seed" };
  return {
    source: "seed",
    athlete: {
      id: seed.id,
      name: seed.name,
      sports: seed.sports,
      readiness: seed.readiness,
      hrv: seed.hrv,
      sleepHours: seed.sleepHours,
      sleepEfficiency: seed.sleepEfficiency,
      recoveryStatus: seed.recoveryStatus,
      goalTitle: seed.goalTitle,
      goalProgress: seed.goalProgress,
      streakWeeks: seed.streakWeeks,
      sessionIds: initialDashboardState.sessions
        .filter((s) => s.athleteId === athleteId && s.coachId === coachId)
        .map((s) => s.id)
    }
  };
}

export async function listDiscoverCoaches(): Promise<{
  coaches: Array<Record<string, unknown>>;
  source: CoachDataSource;
}> {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.coachProfile.findMany({
        orderBy: { rating: "desc" },
        take: 50
      });
      return {
        source: "postgres",
        coaches: rows.map((r) => ({
          id: r.externalId,
          name: r.name,
          headline: r.headline,
          city: r.city,
          country: r.country,
          sports: r.sports,
          rating: r.rating,
          reviews: r.reviews,
          hourlyRate: r.hourlyRate,
          athletesCoached: r.athletesCoached
        }))
      };
    } catch {
      return { source: "empty", coaches: [] };
    }
  }

  return { source: "empty", coaches: [] };
}

export { DEMO_ATHLETE_ID };
