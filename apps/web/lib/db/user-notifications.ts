import { randomUUID } from "crypto";

export type UserNotificationRow = {
  id: string;
  userId: string;
  title: string;
  body: string;
  deepLink: string | null;
  read: boolean;
  createdAt: string;
};

const store = new Map<string, UserNotificationRow>();

export function resetNotificationsForTests() {
  store.clear();
}

export function listNotifications(userId: string): UserNotificationRow[] {
  return [...store.values()]
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  deepLink?: string | null;
}): UserNotificationRow {
  const row: UserNotificationRow = {
    id: `ntf-${randomUUID()}`,
    userId: input.userId,
    title: input.title,
    body: input.body,
    deepLink: input.deepLink ?? null,
    read: false,
    createdAt: new Date().toISOString()
  };
  store.set(row.id, row);
  return row;
}

export function markNotificationRead(
  userId: string,
  id: string
): UserNotificationRow | null {
  const row = store.get(id);
  if (!row || row.userId !== userId) return null;
  const next = { ...row, read: true };
  store.set(id, next);
  return next;
}
