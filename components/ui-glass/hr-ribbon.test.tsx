import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HRRibbon } from "./hr-ribbon";

describe("<HRRibbon />", () => {
  it("renders one bar per data point", () => {
    const { container } = render(<HRRibbon data={[60, 70, 80, 90, 100]} />);
    expect(container.querySelectorAll("[data-bar]").length).toBe(5);
  });
});
