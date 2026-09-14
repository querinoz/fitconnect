import type { RealtimeMessage } from "./types";

const BIOMETRIC_KINDS = new Set(["vitals", "live-tick"]);

/** Public / social channels must never carry biometric telemetry. */
export function isPublicRealtimeChannel(channel: string): boolean {
  return (
    channel.startsWith("community:") ||
    channel.startsWith("presence:") ||
    channel.startsWith("chat:")
  );
}

export function isBiometricRealtimeKind(kind: RealtimeMessage["kind"]): boolean {
  return BIOMETRIC_KINDS.has(kind);
}

export function canPublishRealtime(channel: string, msg: RealtimeMessage): boolean {
  if (!isBiometricRealtimeKind(msg.kind)) return true;
  if (isPublicRealtimeChannel(channel)) return false;
  return channel.startsWith("session:") || channel.startsWith("athlete:");
}

export function realtimeEventKey(msg: RealtimeMessage): string {
  const id =
    "id" in msg && typeof msg.id === "string"
      ? msg.id
      : "sessionId" in msg && typeof msg.sessionId === "string"
        ? msg.sessionId
        : "";
  return `${msg.kind}:${msg.at}:${id}`;
}
