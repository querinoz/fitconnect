import type { IRealtimeTransport } from "@/lib/platform/ports/realtime";
import { getBroadcastTransport } from "@/lib/platform/realtime/broadcast-transport";
import { getConvexTransport } from "@/lib/platform/realtime/convex-transport";
import { getSupabaseTransport } from "@/lib/platform/realtime/supabase-transport";
import { getRealtimeProvider } from "@/lib/platform/stack";

/** Hybrid router: presence/chat → Supabase; coaching → Convex or broadcast. */
export function resolveTransport(channel: string): IRealtimeTransport {
  if (channel.startsWith("presence:") || channel.startsWith("chat:")) {
    return getSupabaseTransport();
  }

  const provider = getRealtimeProvider();
  if (provider === "convex") {
    return getConvexTransport();
  }
  if (provider === "supabase") {
    return getSupabaseTransport();
  }
  return getBroadcastTransport();
}
