import { describe, expect, it } from "vitest";
import {
  getProgramById,
  getProgramCoach,
  getProgramWeekPreview
} from "./detail";

describe("program detail", () => {
  it("loads iron arc program with coach", () => {
    const program = getProgramById("p-iron-arc");
    expect(program?.title).toBe("The Iron Arc");
    const coach = program ? getProgramCoach(program) : undefined;
    expect(coach?.id).toBe("t-002");
  });

  it("returns week preview blocks", () => {
    const program = getProgramById("p-iron-arc");
    expect(program).toBeTruthy();
    const weeks = getProgramWeekPreview(program!);
    expect(weeks.length).toBeGreaterThanOrEqual(3);
  });
});
