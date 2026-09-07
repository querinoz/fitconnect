import { randomUUID } from "crypto";
import { isMemoryPersistence } from "@/lib/persistence/config";
import { getPrisma } from "@/lib/db/client";

export type ProgramCatalogRow = {
  id: string;
  title: string;
  weeks: number;
  sport: string;
  level: string;
  coachId: string;
};

export type ProgramEnrollmentRow = {
  id: string;
  programId: string;
  athleteId: string;
  title: string;
  currentWeek: number;
  totalWeeks: number;
  progressPercent: number;
  nextWorkoutTitle: string;
  milestones: string[];
  enrolledAt: string;
};

const catalog = new Map<string, ProgramCatalogRow>();
const enrollments = new Map<string, ProgramEnrollmentRow>();

function seedCatalog() {
  if (catalog.size > 0) return;
  const rows: ProgramCatalogRow[] = [
    {
      id: "prog-vo2-8",
      title: "VO2 Build · 8 weeks",
      weeks: 8,
      sport: "running",
      level: "intermediate",
      coachId: "coach-catalog"
    },
    {
      id: "prog-strength-6",
      title: "Strength Base · 6 weeks",
      weeks: 6,
      sport: "strength",
      level: "beginner",
      coachId: "coach-catalog"
    }
  ];
  for (const row of rows) catalog.set(row.id, row);
}

export function resetProgramEnrollmentsForTests() {
  catalog.clear();
  enrollments.clear();
}

export function listProgramCatalog(): ProgramCatalogRow[] {
  seedCatalog();
  return [...catalog.values()];
}

export function listAthleteEnrollments(athleteId: string): ProgramEnrollmentRow[] {
  return [...enrollments.values()]
    .filter((e) => e.athleteId === athleteId)
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
}

async function resolveProgram(programId: string): Promise<ProgramCatalogRow | null> {
  seedCatalog();
  const cached = catalog.get(programId);
  if (cached) return cached;

  const db = getPrisma();
  if (db && !isMemoryPersistence()) {
    try {
      const row = await db.program.findFirst({
        where: { OR: [{ externalId: programId }, { id: programId }] }
      });
      if (!row) return null;
      const mapped: ProgramCatalogRow = {
        id: row.externalId,
        title: row.title,
        weeks: row.weeks,
        sport: row.sport,
        level: row.level,
        coachId: "coach-db"
      };
      catalog.set(mapped.id, mapped);
      return mapped;
    } catch {
      return null;
    }
  }
  return null;
}

export async function enrollAthleteInProgram(input: {
  athleteId: string;
  programId: string;
}): Promise<{
  enrollment: ProgramEnrollmentRow | null;
  source: "memory" | "postgres" | "empty";
  idempotent: boolean;
  error?: string;
}> {
  const programId = input.programId.trim();
  if (!programId) {
    return {
      enrollment: null,
      source: "empty",
      idempotent: false,
      error: "programId_required"
    };
  }

  const resolved = await resolveProgram(programId);
  if (!resolved) {
    return {
      enrollment: null,
      source: "empty",
      idempotent: false,
      error: "program_not_found"
    };
  }

  const existing = [...enrollments.values()].find(
    (e) => e.athleteId === input.athleteId && e.programId === resolved.id
  );
  if (existing) {
    return { enrollment: existing, source: "memory", idempotent: true };
  }

  const enrollment: ProgramEnrollmentRow = {
    id: `enr-${randomUUID()}`,
    programId: resolved.id,
    athleteId: input.athleteId,
    title: resolved.title,
    currentWeek: 1,
    totalWeeks: resolved.weeks,
    progressPercent: 0,
    nextWorkoutTitle: "Week 1 · intro session",
    milestones: ["Enrolled", "Week 1 start"],
    enrolledAt: new Date().toISOString()
  };
  enrollments.set(enrollment.id, enrollment);
  return { enrollment, source: "memory", idempotent: false };
}
