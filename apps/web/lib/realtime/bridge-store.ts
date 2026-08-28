/** In-memory realtime bridge buffer (mobile fallback when Convex is unavailable). */

const memoryStore = new Map<string, { payload: unknown; at: number }[]>();

export const MAX_BUFFERED = 200;

export function readBridgeMessages(channel: string, since: number) {
  return (memoryStore.get(channel) ?? []).filter((r) => r.at > since);
}

export function appendBridgeMessage(channel: string, payload: unknown, at = Date.now()) {
  const list = memoryStore.get(channel) ?? [];
  list.push({ payload, at });
  memoryStore.set(channel, list.slice(-MAX_BUFFERED));
  return at;
}

export function resetBridgeStoreForTests() {
  memoryStore.clear();
}
