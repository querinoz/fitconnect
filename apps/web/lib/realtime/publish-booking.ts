import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";
import type { SessionBookingMessage } from "@/lib/realtime/types";

export function publishSessionBooking(input: Omit<SessionBookingMessage, "kind" | "at" | "id">) {
  const msg: SessionBookingMessage = {
    kind: "session-booking",
    id: `booking-${Date.now()}`,
    at: new Date().toISOString(),
    ...input
  };
  resolveTransport(`coach:${input.coachId}:bookings`).publish(
    `coach:${input.coachId}:bookings`,
    msg
  );
  resolveTransport("admin:events").publish("admin:events", msg);
  return msg;
}
