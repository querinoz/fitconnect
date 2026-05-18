import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NudgeToast } from "./nudge-toast";

describe("<NudgeToast />", () => {
  it("shows the variant label", () => {
    render(<NudgeToast variant="push" coachName="Marina" />);
    expect(screen.getByText(/Marina/)).toBeInTheDocument();
    expect(screen.getByText(/Push/i)).toBeInTheDocument();
  });
});
