import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionCard } from "./session-card";

describe("<SessionCard />", () => {
  it("renders the session title and duration", () => {
    render(
      <SessionCard title="Z2 base" durationMin={45} intent="z2" onStart={() => {}} />
    );
    expect(screen.getByText("Z2 base")).toBeInTheDocument();
    expect(screen.getByText(/45 min/)).toBeInTheDocument();
  });
  it("calls onStart when Start tapped", async () => {
    const fn = vi.fn();
    render(
      <SessionCard title="x" durationMin={10} intent="z2" onStart={fn} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Start/i }));
    expect(fn).toHaveBeenCalled();
  });
});
