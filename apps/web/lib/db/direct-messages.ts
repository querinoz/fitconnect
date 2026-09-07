import { randomUUID } from "crypto";

export type DirectMessageRow = {
  id: string;
  athleteId: string;
  coachId: string;
  from: "athlete" | "coach";
  preview: string;
  when: string;
  unread: boolean;
};

const store = new Map<string, DirectMessageRow>();

export function resetDirectMessagesForTests() {
  store.clear();
}

export function listDirectMessages(filter: {
  athleteId?: string;
  coachId?: string;
}): DirectMessageRow[] {
  return [...store.values()]
    .filter((m) => {
      if (filter.athleteId && m.athleteId !== filter.athleteId) return false;
      if (filter.coachId && m.coachId !== filter.coachId) return false;
      return true;
    })
    .sort((a, b) => b.when.localeCompare(a.when));
}

export function createDirectMessage(input: {
  athleteId: string;
  coachId: string;
  from: "athlete" | "coach";
  preview: string;
}): DirectMessageRow {
  const row: DirectMessageRow = {
    id: `msg-${randomUUID()}`,
    athleteId: input.athleteId,
    coachId: input.coachId,
    from: input.from,
    preview: input.preview.trim().slice(0, 2000),
    when: new Date().toISOString(),
    unread: true
  };
  store.set(row.id, row);
  return row;
}
