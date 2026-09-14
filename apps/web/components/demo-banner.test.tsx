"use client";

import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoBanner } from "./demo-banner";

vi.mock("@/lib/i18n-provider", () => ({
  useT: () => (ns: string, key: string) => `${ns}.${key}`
}));

describe("DemoBanner", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders nothing when production demo mode is off", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    const { container } = render(<DemoBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the demo region when LOCAL_DEMO is on", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    render(<DemoBanner />);
    expect(screen.getByRole("region", { name: "demo.label" })).toBeInTheDocument();
  });
});
