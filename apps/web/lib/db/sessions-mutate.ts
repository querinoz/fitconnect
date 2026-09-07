import { getPrisma } from "@/lib/db/client";
import { isMemoryPersistence } from "@/lib/persistence/config";

export type SessionMutationResult = {
  ok: boolean;
  source: "postgres" | "memory" | "empty" | "seed";
  session?: {
    id: string;
    coachId: string;
    athleteId: string;
    when: string;
    status: "scheduled" | "live" | "completed" | "cancelled";
  };
  error?: string;
};

type MemorySession = {
  id: string;
  coachId: string;
  athleteId: string;
  when: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
};

const memorySessions = new Map<string, MemorySession>();

export function resetSessionMutationsForTests() {
  memorySessions.clear();
}

export function seedMemorySessionForTests(session: MemorySession) {
  memorySessions.set(session.id, session);
}

export async function rescheduleCoachSession(
  coachId: string,
  sessionId: string,
  newWhenIso: string
): Promise<SessionMutationResult> {
  const when = new Date(newWhenIso);
  if (Number.isNaN(when.getTime())) {
    return { ok: false, source: "empty", error: "invalid_when" };
  }

  if (isMemoryPersistence() || !getPrisma()) {
    if (!isMemoryPersistence() && !getPrisma()) {
      return { ok: false, source: "empty", error: "persistence_not_configured" };
    }
    const row = memorySessions.get(sessionId);
    if (!row) return { ok: false, source: "memory", error: "not_found" };
    if (row.coachId !== coachId) return { ok: false, source: "memory", error: "forbidden" };
    if (row.status === "cancelled" || row.status === "completed") {
      return { ok: false, source: "memory", error: "invalid_state" };
    }
    const updated = { ...row, when: when.toISOString() };
    memorySessions.set(sessionId, updated);
    return { ok: true, source: "memory", session: updated };
  }

  const db = getPrisma()!;
  try {
    const existing = await db.session.findFirst({
      where: { externalId: sessionId }
    });
    if (!existing) return { ok: false, source: "postgres", error: "not_found" };
    if (existing.coachExternalId !== coachId) {
      return { ok: false, source: "postgres", error: "forbidden" };
    }
    if (existing.status === "CANCELLED" || existing.status === "COMPLETED") {
      return { ok: false, source: "postgres", error: "invalid_state" };
    }
    const updated = await db.session.update({
      where: { id: existing.id },
      data: { scheduledAt: when }
    });
    return {
      ok: true,
      source: "postgres",
      session: {
        id: updated.externalId,
        coachId: updated.coachExternalId,
        athleteId: updated.athleteExternalId,
        when: updated.scheduledAt.toISOString(),
        status: "scheduled"
      }
    };
  } catch {
    return { ok: false, source: "empty", error: "update_failed" };
  }
}

export async function cancelCoachSession(
  coachId: string,
  sessionId: string
): Promise<SessionMutationResult> {
  if (isMemoryPersistence() || !getPrisma()) {
    if (!isMemoryPersistence() && !getPrisma()) {
      return { ok: false, source: "empty", error: "persistence_not_configured" };
    }
    const row = memorySessions.get(sessionId);
    if (!row) return { ok: false, source: "memory", error: "not_found" };
    if (row.coachId !== coachId) return { ok: false, source: "memory", error: "forbidden" };
    if (row.status === "cancelled") {
      return { ok: true, source: "memory", session: row };
    }
    if (row.status === "completed") {
      return { ok: false, source: "memory", error: "invalid_state" };
    }
    const updated = { ...row, status: "cancelled" as const };
    memorySessions.set(sessionId, updated);
    return { ok: true, source: "memory", session: updated };
  }

  const db = getPrisma()!;
  try {
    const existing = await db.session.findFirst({
      where: { externalId: sessionId }
    });
    if (!existing) return { ok: false, source: "postgres", error: "not_found" };
    if (existing.coachExternalId !== coachId) {
      return { ok: false, source: "postgres", error: "forbidden" };
    }
    if (existing.status === "COMPLETED") {
      return { ok: false, source: "postgres", error: "invalid_state" };
    }
    if (existing.status === "CANCELLED") {
      return {
        ok: true,
        source: "postgres",
        session: {
          id: existing.externalId,
          coachId: existing.coachExternalId,
          athleteId: existing.athleteExternalId,
          when: existing.scheduledAt.toISOString(),
          status: "cancelled"
        }
      };
    }
    const updated = await db.session.update({
      where: { id: existing.id },
      data: { status: "CANCELLED" }
    });
    return {
      ok: true,
      source: "postgres",
      session: {
        id: updated.externalId,
        coachId: updated.coachExternalId,
        athleteId: updated.athleteExternalId,
        when: updated.scheduledAt.toISOString(),
        status: "cancelled"
      }
    };
  } catch {
    return { ok: false, source: "empty", error: "update_failed" };
  }
}
