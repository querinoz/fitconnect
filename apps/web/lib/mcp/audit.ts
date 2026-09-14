export type McpAuditEvent = {
  at: string;
  uid: string;
  tool: string;
  ok: boolean;
  status: number;
  risk?: string;
  error?: string;
};

const MAX_EVENTS = 200;
const events: McpAuditEvent[] = [];

export function recordMcpAudit(event: Omit<McpAuditEvent, "at">): McpAuditEvent {
  const recorded: McpAuditEvent = { ...event, at: new Date().toISOString() };
  events.push(recorded);
  if (events.length > MAX_EVENTS) events.shift();
  return recorded;
}

export function listMcpAudit(uid?: string): McpAuditEvent[] {
  if (!uid) return [...events];
  return events.filter((e) => e.uid === uid);
}

export function resetMcpAuditForTests() {
  events.length = 0;
}
