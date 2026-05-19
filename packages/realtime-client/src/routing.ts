export type RealtimeProvider = "broadcast" | "convex" | "supabase";

export function getRealtimeProvider(env: Record<string, string | undefined> = {}): RealtimeProvider {
  const raw = env.NEXT_PUBLIC_REALTIME_PROVIDER ?? env.EXPO_PUBLIC_REALTIME_PROVIDER;
  if (raw === "convex" || raw === "supabase" || raw === "broadcast") return raw;
  return "broadcast";
}

/** Hybrid routing: presence/chat → Supabase; coaching events → Convex; demo → broadcast. */
export function resolveProviderForChannel(
  channel: string,
  defaultProvider: RealtimeProvider
): RealtimeProvider {
  if (channel.startsWith("presence:") || channel.startsWith("chat:")) {
    return "supabase";
  }
  if (defaultProvider === "convex") return "convex";
  return defaultProvider;
}

export function isConvexChannel(channel: string): boolean {
  return (
    channel.startsWith("athlete:") ||
    channel.startsWith("roster:") ||
    channel.startsWith("celebration:") ||
    channel.startsWith("coach:") ||
    channel.startsWith("admin:")
  );
}
