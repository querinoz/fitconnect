import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteModal } from "./route-modal";

const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: back })
}));

describe("<RouteModal />", () => {
  beforeEach(() => {
    back.mockClear();
  });

  it("renders dialog with title and close control", () => {
    render(
      <RouteModal title="Sign in">
        <p>Form content</p>
      </RouteModal>
    );
    expect(screen.getByRole("dialog", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText("Form content")).toBeInTheDocument();
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });
});
