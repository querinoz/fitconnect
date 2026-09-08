import { randomUUID } from "crypto";
import type { CoachProgramRow } from "@/lib/db/repository";

/** In-memory coach program mutations (publish/clone/draft) for WAVE 2.
 * Path A: start empty — never auto-seed demo plans as production data.
 */
const byCoach = new Map<string, CoachProgramRow[]>();

export function resetCoachProgramMutationsForTests() {
  byCoach.clear();
}

function programsFor(coachId: string): CoachProgramRow[] {
  const existing = byCoach.get(coachId);
  if (existing) return existing;
  const rows: CoachProgramRow[] = [];
  byCoach.set(coachId, rows);
  return rows;
}

export function listMutableCoachPrograms(coachId: string): CoachProgramRow[] {
  return [...programsFor(coachId)];
}

export function publishCoachProgram(
  coachId: string,
  id: string
): CoachProgramRow | null {
  const rows = programsFor(coachId);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  rows[idx] = { ...rows[idx], state: "published", version: rows[idx].version + 1 };
  byCoach.set(coachId, rows);
  return rows[idx];
}

export function draftCoachProgram(
  coachId: string,
  id: string
): CoachProgramRow | null {
  const rows = programsFor(coachId);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  rows[idx] = { ...rows[idx], state: "draft" };
  byCoach.set(coachId, rows);
  return rows[idx];
}

export function cloneCoachProgram(
  coachId: string,
  id: string
): CoachProgramRow | null {
  const rows = programsFor(coachId);
  const src = rows.find((r) => r.id === id);
  if (!src) return null;
  const clone: CoachProgramRow = {
    ...src,
    id: `prog-${randomUUID()}`,
    title: `${src.title} (copy)`,
    state: "draft",
    version: 1
  };
  rows.push(clone);
  byCoach.set(coachId, rows);
  return clone;
}
