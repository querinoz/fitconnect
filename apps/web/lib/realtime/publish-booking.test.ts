import { describe, expect, it, afterEach } from "vitest";
import { publishSessionBooking } from "./publish-booking";
import {
  getBroadcastTransport,
  resetBroadcastTransportForTests
} from "@/lib/platform/realtime/broadcast-transport";

describe("publishSessionBooking", () => {
  afterEach(() => {
    resetBroadcastTransportForTests();
  });

  it("broadcasts session-booking on coach channel and fitconnect:booking", () => {
    const coachReceived: unknown[] = [];
    const productReceived: unknown[] = [];
    const transport = getBroadcastTransport();
    transport.subscribe("coach:t-002:bookings", (msg) => coachReceived.push(msg));
    transport.subscribe("fitconnect:booking", (msg) => productReceived.push(msg));

    const msg = publishSessionBooking({
      athleteId: "a-ines",
      athleteName: "Inês M.",
      coachId: "t-002",
      coachName: "Tomás Ribeiro",
      mode: "standard"
    });

    expect(msg.kind).toBe("session-booking");
    expect(coachReceived).toHaveLength(1);
    expect(productReceived).toHaveLength(1);
  });
});
