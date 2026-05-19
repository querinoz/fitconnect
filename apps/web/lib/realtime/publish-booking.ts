import { getBroadcastTransport } from "@/lib/platform/realtime/broadcast-transport";
import type { SessionBookingMessage } from "@/lib/realtime/types";

export function publishSessionBooking(input: Omit<SessionBookingMessage, "kind" | "at" | "id">) {
  const msg: SessionBookingMessage = {
    kind: "session-booking",
    id: `booking-${Date.now()}`,
    at: new Date().toISOString(),
    ...input
  };
  getBroadcastTransport().publish(`coach:${input.coachId}:bookings`, msg);
  getBroadcastTransport().publish("admin:events", msg);
  return msg;
}
