import type { RealtimeMessage } from "@/lib/realtime/types";
import { isRealtimeMessage } from "@/lib/realtime/types";
import type { IRealtimeTransport, Unsubscribe } from "@/lib/platform/ports/realtime";
import { getBroadcastTransport } from "./broadcast-transport";
import { api, getConvexHttpClient, isConvexConfigured } from "@/lib/convex/client";

type Handler = (msg: RealtimeMessage) => void;

/**
 * Convex realtime adapter — persists via Convex mutations, polls for cross-client delivery.
 * Falls back to BroadcastChannel when NEXT_PUBLIC_CONVEX_URL is unset.
 */
export class ConvexTransport implements IRealtimeTransport {
  private fallback = getBroadcastTransport();
  private handlers = new Map<string, Set<Handler>>();
  private pollTimers = new Map<string, ReturnType<typeof setInterval>>();
  private sinceByChannel = new Map<string, number>();

  subscribe(channel: string, handler: (msg: RealtimeMessage) => void): Unsubscribe {
    if (!isConvexConfigured()) {
      return this.fallback.subscribe(channel, handler);
    }

    let set = this.handlers.get(channel);
    if (!set) {
      set = new Set();
      this.handlers.set(channel, set);
      this.startPolling(channel);
    }
    set.add(handler);

    // Same-tab immediate delivery via broadcast mirror
    const bcUnsub = this.fallback.subscribe(`convex-mirror:${channel}`, handler);

    return () => {
      set!.delete(handler);
      bcUnsub();
      if (set!.size === 0) {
        this.handlers.delete(channel);
        this.stopPolling(channel);
      }
    };
  }

  publish(channel: string, msg: RealtimeMessage): void {
    if (!isConvexConfigured()) {
      this.fallback.publish(channel, msg);
      return;
    }

    // Optimistic same-tab + cross-tab via broadcast mirror
    this.fallback.publish(`convex-mirror:${channel}`, msg);

    const client = getConvexHttpClient();
    if (client) {
      void client
        .mutation(api.messages.publishMessage, { channel, payload: msg })
        .catch(() => {
          // Convex unavailable — broadcast only
          this.fallback.publish(channel, msg);
        });
    }
  }

  close?(): void {
    for (const id of this.pollTimers.values()) clearInterval(id);
    this.pollTimers.clear();
    this.handlers.clear();
    this.sinceByChannel.clear();
    this.fallback.close?.();
  }

  private startPolling(channel: string): void {
    if (this.pollTimers.has(channel)) return;
    this.sinceByChannel.set(channel, Date.now());

    const poll = async () => {
      const client = getConvexHttpClient();
      const handlers = this.handlers.get(channel);
      if (!client || !handlers?.size) return;

      const since = this.sinceByChannel.get(channel) ?? Date.now();
      try {
        const rows = await client.query(api.messages.listMessagesSince, { channel, since });
        for (const row of rows) {
          const payload = row.payload;
          if (isRealtimeMessage(payload)) {
            for (const h of handlers) h(payload);
          }
          if (row.at > since) this.sinceByChannel.set(channel, row.at);
        }
      } catch {
        // ignore poll errors
      }
    };

    void poll();
    this.pollTimers.set(channel, setInterval(() => void poll(), 2000));
  }

  private stopPolling(channel: string): void {
    const id = this.pollTimers.get(channel);
    if (id) clearInterval(id);
    this.pollTimers.delete(channel);
    this.sinceByChannel.delete(channel);
  }
}

let singleton: ConvexTransport | null = null;

export function getConvexTransport(): ConvexTransport {
  if (!singleton) singleton = new ConvexTransport();
  return singleton;
}

export function resetConvexTransportForTests(): void {
  singleton?.close?.();
  singleton = null;
}
