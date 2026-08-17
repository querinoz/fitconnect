import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useShallow } from "zustand/react/shallow";
import {
  selectAthletesForCoach,
  useDashboardStore
} from "@/lib/dashboard-store";
import { DEMO_COACH_TOMAS_ID } from "@/lib/dashboard/seed";

function RosterProbe() {
  const athletes = useDashboardStore(
    useShallow((s) => selectAthletesForCoach(s, DEMO_COACH_TOMAS_ID))
  );
  return <p>roster:{athletes.length}</p>;
}

describe("coach dashboard zustand selectors", () => {
  it("selectAthletesForCoach allocates a new array each call", () => {
    const state = useDashboardStore.getState();
    const a = selectAthletesForCoach(state, DEMO_COACH_TOMAS_ID);
    const b = selectAthletesForCoach(state, DEMO_COACH_TOMAS_ID);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("useShallow roster subscription does not throw maximum update depth", () => {
    expect(() => render(<RosterProbe />)).not.toThrow();
    expect(screen.getByText(/roster:\d+/)).toBeInTheDocument();
  });
});
