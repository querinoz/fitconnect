import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SparkLine } from "./spark-line";

describe("<SparkLine />", () => {
  it("renders a polyline with the right number of points", () => {
    const { container } = render(<SparkLine values={[1, 2, 3, 4]} />);
    const poly = container.querySelector("polyline");
    expect(poly).toBeTruthy();
    expect(poly!.getAttribute("points")?.trim().split(/\s+/).length).toBe(4);
  });
});
