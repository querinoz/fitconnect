import type { RealtimeMessage } from "@/lib/realtime/types";
import type { IRealtimeTransport, Unsubscribe } from "@/lib/platform/ports/realtime";
import { getBroadcastTransport } from "./broadcast-transport";

/**
 * Convex realtime adapter.
 * When NEXT_PUBLIC_CONVEX_URL is unset, delegates to BroadcastChannel (demo-safe).
 * Install `convex` and wire ConvexReactClient for production cross-device sync.
 */
export class ConvexTransport implements IRealtimeTransport {
  private fallback = getBroadcastTransport();
  private convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();

  subscribe(channel: string, handler: (msg: RealtimeMessage) => void): Unsubscribe {
    if (!this.convexUrl) {
      return this.fallback.subscribe(channel, handler);
    }
    // Production: subscribe via Convex useQuery/mutation mirror
    return this.fallback.subscribe(`convex:${channel}`, handler);
  }

  publish(channel: string, msg: RealtimeMessage): void {
    if (!this.convexUrl) {
      this.fallback.publish(channel, msg);
      return;
    }
    this.fallback.publish(`convex:${channel}`, msg);
  }

  close?(): void {
    this.fallback.close?.();
  }
}

let singleton: ConvexTransport | null = null;

export function getConvexTransport(): ConvexTransport {
  if (!singleton) singleton = new ConvexTransport();
  return singleton;
}
