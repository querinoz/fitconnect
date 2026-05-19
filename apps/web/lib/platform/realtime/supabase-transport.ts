import type { RealtimeMessage } from "@/lib/realtime/types";
import { isRealtimeMessage } from "@/lib/realtime/types";
import type { IRealtimeTransport, Unsubscribe } from "@/lib/platform/ports/realtime";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/auth/supabase/client";
import { getBroadcastTransport } from "./broadcast-transport";

type Handler = (msg: RealtimeMessage) => void;

/**
 * Supabase Realtime broadcast transport for presence:* and chat:* channels.
 */
export class SupabaseRealtimeTransport implements IRealtimeTransport {
  private fallback = getBroadcastTransport();
  private handlers = new Map<string, Set<Handler>>();
  private channels = new Map<string, ReturnType<NonNullable<ReturnType<typeof createSupabaseBrowserClient>>["channel"]>>();

  subscribe(channel: string, handler: (msg: RealtimeMessage) => void): Unsubscribe {
    if (!isSupabaseConfigured()) {
      return this.fallback.subscribe(channel, handler);
    }

    let set = this.handlers.get(channel);
    if (!set) {
      set = new Set();
      this.handlers.set(channel, set);
      this.ensureChannel(channel);
    }
    set.add(handler);

    return () => {
      set!.delete(handler);
      if (set!.size === 0) {
        this.handlers.delete(channel);
        this.teardownChannel(channel);
      }
    };
  }

  publish(channel: string, msg: RealtimeMessage): void {
    if (!isSupabaseConfigured()) {
      this.fallback.publish(channel, msg);
      return;
    }

    const supa = createSupabaseBrowserClient();
    if (!supa) {
      this.fallback.publish(channel, msg);
      return;
    }

    const ch = this.ensureChannel(channel);
    void ch.send({ type: "broadcast", event: "message", payload: msg });
    // Same-tab fallback
    this.fallback.publish(channel, msg);
  }

  close?(): void {
    for (const [name, ch] of this.channels) {
      void ch.unsubscribe();
      this.channels.delete(name);
    }
    this.handlers.clear();
    this.fallback.close?.();
  }

  private ensureChannel(channel: string) {
    const existing = this.channels.get(channel);
    if (existing) return existing;

    const supa = createSupabaseBrowserClient();
    if (!supa) {
      throw new Error("Supabase client unavailable");
    }

    const ch = supa.channel(`fc:${channel}`, {
      config: { broadcast: { self: true } }
    });

    ch.on("broadcast", { event: "message" }, ({ payload }) => {
      if (isRealtimeMessage(payload)) {
        const handlers = this.handlers.get(channel);
        if (handlers) for (const h of handlers) h(payload);
      }
    });

    void ch.subscribe();
    this.channels.set(channel, ch);
    return ch;
  }

  private teardownChannel(channel: string): void {
    const ch = this.channels.get(channel);
    if (ch) {
      void ch.unsubscribe();
      this.channels.delete(channel);
    }
  }
}

let singleton: SupabaseRealtimeTransport | null = null;

export function getSupabaseTransport(): SupabaseRealtimeTransport {
  if (!singleton) singleton = new SupabaseRealtimeTransport();
  return singleton;
}

export function resetSupabaseTransportForTests(): void {
  singleton?.close?.();
  singleton = null;
}
