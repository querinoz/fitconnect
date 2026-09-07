import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";
import type { SessionBookingMessage } from "@/lib/realtime/types";

/**
 * Publish booking events on:
 * - coach:{id}:bookings (web coach inbox)
 * - fitconnect:booking (Android ProductRealtimeTopics.BOOKING)
 * - admin:events
 */
export function publishSessionBooking(
  input: Omit<SessionBookingMessage, "kind" | "at" | "id"> & { id?: string }
) {
  const msg: SessionBookingMessage = {
    kind: "session-booking",
    id: input.id ?? `booking-${Date.now()}`,
    at: new Date().toISOString(),
    athleteId: input.athleteId,
    athleteName: input.athleteName,
    coachId: input.coachId,
    coachName: input.coachName,
    mode: input.mode
  };
  resolveTransport(`coach:${input.coachId}:bookings`).publish(
    `coach:${input.coachId}:bookings`,
    msg
  );
  // Canonical Android / product topic — must stay aligned with ProductRealtimeTopics.BOOKING
  resolveTransport("fitconnect:booking").publish("fitconnect:booking", msg);
  resolveTransport("admin:events").publish("admin:events", msg);
  return msg;
}
