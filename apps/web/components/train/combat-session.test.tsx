import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CombatBriefing, CombatLiveBlock } from "./combat-session";
import { IDLE_SNAPSHOT } from "@/lib/train/machine";
import type { CombatPlanMeta, TrainSnapshot } from "@/lib/train/types";

const combat: CombatPlanMeta = {
  disciplineId: "boxing",
  sessionMode: "bag_work",
  roundCount: 5,
  roundDurationSec: 180,
  restDurationSec: 60,
  warningSec: 10,
  focus: "Combinations. No invented force."
};

const handlers = {
  onMute: vi.fn(),
  onPause: vi.fn(),
  onSkipRest: vi.fn(),
  onFinish: vi.fn(),
  onRpe: vi.fn()
};

function snap(partial: Partial<TrainSnapshot>): TrainSnapshot {
  return { ...IDLE_SNAPSHOT, sessionId: "c1", planId: "plan_boxing_bag_v1", ...partial };
}

describe("CombatLiveBlock", () => {
  it("renders missing telemetry and a giant round clock", () => {
    render(
      <CombatLiveBlock
        combat={combat}
        snapshot={snap({ phase: "active", workRemainingSec: 180, workDurationSec: 180 })}
        elapsed="0:01"
        cues={["FIGHT MODE · boxing"]}
        muted={false}
        rpe={null}
        {...handlers}
      />
    );
    expect(screen.getByTestId("combat-state")).toHaveTextContent("ROUND");
    expect(screen.getByTestId("combat-telemetry")).toHaveTextContent("MISSING");
    expect(screen.getByLabelText(/round remaining 03:00/i)).toBeInTheDocument();
    expect(screen.queryByText(/142 bpm|\d+ kcal|900 n/i)).not.toBeInTheDocument();
  });

  it("exposes skip rest during REST and warning copy in the last 10s", () => {
    const { rerender } = render(
      <CombatLiveBlock
        combat={combat}
        snapshot={snap({ phase: "rest", restRemainingSec: 60, restDurationSec: 60 })}
        elapsed="3:00"
        cues={["Rest"]}
        muted
        rpe={6}
        {...handlers}
      />
    );
    expect(screen.getByTestId("combat-state")).toHaveTextContent("REST");
    expect(screen.getByTestId("combat-skip-rest")).toBeInTheDocument();

    rerender(
      <CombatLiveBlock
        combat={combat}
        snapshot={snap({ phase: "active", workRemainingSec: 8, workDurationSec: 180 })}
        elapsed="2:52"
        cues={["Warning"]}
        muted
        rpe={6}
        {...handlers}
      />
    );
    expect(screen.getByTestId("combat-state")).toHaveTextContent("WARNING");
  });
});

describe("CombatBriefing", () => {
  it("starts Fight Mode without claiming sensors", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(
      <CombatBriefing
        combat={combat}
        title="Boxing bag — 5×3"
        purpose="Five three-minute rounds"
        equipment={["heavy bag"]}
        cues={["Acceleration is not newtons."]}
        onStart={onStart}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByTestId("combat-prep")).toBeInTheDocument();
    await user.click(screen.getByTestId("train-start"));
    expect(onStart).toHaveBeenCalled();
  });
});
