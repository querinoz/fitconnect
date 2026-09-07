import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";
import type { DirectMessageEvent } from "@/lib/realtime/types";

/**
 * Publish athlete↔coach DM on canonical mobile topic + role-scoped web channels.
 */
export function publishDirectMessage(input: {
  id: string;
  athleteId: string;
  coachId: string;
  from: "athlete" | "coach";
  preview: string;
  when?: string;
}) {
  const msg: DirectMessageEvent = {
    kind: "direct-message",
    id: input.id,
    athleteId: input.athleteId,
    coachId: input.coachId,
    from: input.from,
    preview: input.preview,
    at: input.when ?? new Date().toISOString()
  };
  // Canonical Android ProductRealtimeTopics.MESSAGE
  resolveTransport("fitconnect:message").publish("fitconnect:message", msg);
  resolveTransport(`coach:${input.coachId}:messages`).publish(
    `coach:${input.coachId}:messages`,
    msg
  );
  resolveTransport(`athlete:${input.athleteId}:messages`).publish(
    `athlete:${input.athleteId}:messages`,
    msg
  );
  return msg;
}
