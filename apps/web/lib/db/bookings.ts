import { randomUUID } from "crypto";
import { getPrisma } from "@/lib/db/client";
import { isMemoryPersistence } from "@/lib/persistence/config";

export type AthleteBookingRow = {
  id: string;
  athleteId: string;
  coachId: string;
  scheduledAt: string;
  durationMin: number;
  type: string;
  mode: "Online" | "In-person";
  status: "pending" | "approved" | "rejected" | "cancelled";
  notes: string | null;
};

type MemoryBooking = AthleteBookingRow & { createdAt: string };

const memoryBookings = new Map<string, MemoryBooking>();

/** Duplicate rule: one SCHEDULED booking per athlete + coach + exact scheduledAt. */
export function bookingNaturalKey(
  athleteId: string,
  coachId: string,
  scheduledAtIso: string
): string {
  return `${athleteId}|${coachId}|${new Date(scheduledAtIso).toISOString()}`;
}

export function resetBookingsForTests() {
  memoryBookings.clear();
}

export async function createAthleteBooking(input: {
  athleteId: string;
  coachId: string;
  scheduledAt: string;
  durationMin?: number;
  type?: string;
  mode?: "Online" | "In-person";
  notes?: string | null;
  idempotencyKey?: string | null;
}): Promise<{
  booking: AthleteBookingRow;
  source: "postgres" | "memory" | "empty";
  idempotent: boolean;
  error?: string;
}> {
  const coachId = input.coachId.trim();
  const scheduledAt = input.scheduledAt.trim();
  if (!coachId) {
    return {
      booking: null as unknown as AthleteBookingRow,
      source: "empty",
      idempotent: false,
      error: "coachId_required"
    };
  }
  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) {
    return {
      booking: null as unknown as AthleteBookingRow,
      source: "empty",
      idempotent: false,
      error: "invalid_scheduledAt"
    };
  }
  if (when.getTime() < Date.now() - 60_000) {
    return {
      booking: null as unknown as AthleteBookingRow,
      source: "empty",
      idempotent: false,
      error: "scheduledAt_in_past"
    };
  }

  const durationMin = input.durationMin && input.durationMin > 0 ? input.durationMin : 60;
  const type = input.type?.trim() || "Intro session";
  const mode = input.mode === "Online" ? "Online" : "In-person";
  const notes = input.notes?.trim() || null;

  if (isMemoryPersistence() || !getPrisma()) {
    if (!isMemoryPersistence() && !getPrisma()) {
      return {
        booking: null as unknown as AthleteBookingRow,
        source: "empty",
        idempotent: false,
        error: "persistence_not_configured"
      };
    }
    const natural = bookingNaturalKey(input.athleteId, coachId, when.toISOString());
    for (const row of memoryBookings.values()) {
      if (
        row.athleteId === input.athleteId &&
        row.coachId === coachId &&
        new Date(row.scheduledAt).toISOString() === when.toISOString() &&
        row.status === "pending"
      ) {
        return { booking: row, source: "memory", idempotent: true };
      }
      if (input.idempotencyKey && row.id === `bk-${input.idempotencyKey}`) {
        return { booking: row, source: "memory", idempotent: true };
      }
    }
    const id = input.idempotencyKey
      ? `bk-${input.idempotencyKey}`
      : `bk-${randomUUID()}`;
    const booking: MemoryBooking = {
      id,
      athleteId: input.athleteId,
      coachId,
      scheduledAt: when.toISOString(),
      durationMin,
      type,
      mode,
      status: "pending",
      notes,
      createdAt: new Date().toISOString()
    };
    memoryBookings.set(id, booking);
    void natural;
    return { booking, source: "memory", idempotent: false };
  }

  const db = getPrisma()!;
  try {
    await db.athleteProfile.upsert({
      where: { externalId: input.athleteId },
      create: {
        externalId: input.athleteId,
        name: "Athlete",
        avatar: "",
        sports: [],
        coachExternalId: coachId
      },
      update: {}
    });

    if (input.idempotencyKey) {
      const byKey = await db.session.findFirst({
        where: { externalId: `bk-${input.idempotencyKey}` }
      });
      if (byKey && byKey.athleteExternalId === input.athleteId) {
        return {
          booking: mapPrismaSession(byKey, durationMin),
          source: "postgres",
          idempotent: true
        };
      }
    }

    const existing = await db.session.findFirst({
      where: {
        athleteExternalId: input.athleteId,
        coachExternalId: coachId,
        scheduledAt: when,
        status: "SCHEDULED"
      }
    });
    if (existing) {
      return {
        booking: mapPrismaSession(existing, durationMin),
        source: "postgres",
        idempotent: true
      };
    }

    const externalId = input.idempotencyKey
      ? `bk-${input.idempotencyKey}`
      : `bk-${randomUUID()}`;
    const created = await db.session.create({
      data: {
        externalId,
        athleteExternalId: input.athleteId,
        coachExternalId: coachId,
        scheduledAt: when,
        type,
        mode: mode === "Online" ? "ONLINE" : "IN_PERSON",
        intensity: "pending",
        status: "SCHEDULED"
      }
    });
    return {
      booking: mapPrismaSession(created, durationMin),
      source: "postgres",
      idempotent: false
    };
  } catch {
    return {
      booking: null as unknown as AthleteBookingRow,
      source: "empty",
      idempotent: false,
      error: "create_failed"
    };
  }
}

function mapPrismaSession(
  row: {
    externalId: string;
    athleteExternalId: string;
    coachExternalId: string;
    scheduledAt: Date;
    type: string;
    mode: string;
    intensity: string;
    status: string;
  },
  durationMin: number
): AthleteBookingRow {
  const status =
    row.status === "CANCELLED"
      ? "cancelled"
      : row.intensity === "approved"
        ? "approved"
        : row.intensity === "rejected"
          ? "rejected"
          : "pending";
  return {
    id: row.externalId,
    athleteId: row.athleteExternalId,
    coachId: row.coachExternalId,
    scheduledAt: row.scheduledAt.toISOString(),
    durationMin,
    type: row.type,
    mode: row.mode === "ONLINE" ? "Online" : "In-person",
    status,
    notes: null
  };
}

export function listMemoryBookingsForCoach(coachId: string): AthleteBookingRow[] {
  return [...memoryBookings.values()].filter(
    (b) => b.coachId === coachId && b.status === "pending"
  );
}

export function listMemoryBookingsForAthlete(athleteId: string): AthleteBookingRow[] {
  return [...memoryBookings.values()]
    .filter((b) => b.athleteId === athleteId)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
}

/**
 * Athlete lists own bookings only (caller must pass auth subject id).
 * Path A: postgres or memory — never seed/demo fixtures.
 */
export async function listAthleteBookings(athleteId: string): Promise<{
  bookings: AthleteBookingRow[];
  source: "postgres" | "memory" | "empty";
}> {
  const memory = listMemoryBookingsForAthlete(athleteId);

  if (isMemoryPersistence() || !getPrisma()) {
    if (!isMemoryPersistence() && !getPrisma()) {
      return { bookings: [], source: "empty" };
    }
    return { bookings: memory, source: memory.length > 0 ? "memory" : "empty" };
  }

  const db = getPrisma()!;
  try {
    const rows = await db.session.findMany({
      where: { athleteExternalId: athleteId },
      orderBy: { scheduledAt: "asc" }
    });
    const fromDb = rows.map((r) => mapPrismaSession(r, 60));
    const memoryIds = new Set(memory.map((b) => b.id));
    const merged = [
      ...fromDb.filter((b) => !memoryIds.has(b.id)),
      ...memory
    ].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    return { bookings: merged, source: "postgres" };
  } catch {
    return { bookings: memory, source: memory.length > 0 ? "memory" : "empty" };
  }
}
