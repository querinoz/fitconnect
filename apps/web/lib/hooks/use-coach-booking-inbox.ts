"use client";

import { useEffect } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import { toastInfo } from "@/lib/toast/store";

/** Coach dashboard: surface new session bookings via BroadcastChannel. */
export function useCoachBookingInbox(coachId: string) {
  const { messages } = useChannel(`coach:${coachId}:bookings`);

  useEffect(() => {
    const latest = messages.at(-1);
    if (!latest || latest.kind !== "session-booking") return;
    toastInfo(
      "New booking",
      `${latest.athleteName} booked a ${latest.mode} session.`
    );
  }, [messages]);
}
