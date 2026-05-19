import { describe, expect, it } from "vitest";
import { useDashboardStore } from "@/lib/dashboard-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";

describe("dashboard session actions", () => {
  it("cancels and reschedules athlete sessions", () => {
    const store = useDashboardStore.getState();
    store.resetDemo();
    const session = store.sessions.find(
      (s) => s.athleteId === DEMO_ATHLETE_ID && s.status !== "completed"
    );
    expect(session).toBeDefined();

    store.cancelSession(session!.id);
    expect(
      useDashboardStore.getState().sessions.find((s) => s.id === session!.id)
        ?.status
    ).toBe("cancelled");

    store.rescheduleSession(session!.id, "Fri · 10:00");
    const updated = useDashboardStore.getState().sessions.find(
      (s) => s.id === session!.id
    );
    expect(updated?.when).toBe("Fri · 10:00");
    expect(updated?.status).toBe("scheduled");
  });
});
