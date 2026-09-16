import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeviceStatusBadge, normalizeDeviceStatus } from "./device-status-badge";

describe("DeviceStatusBadge", () => {
  it("normalizes provider strings without inventing connected", () => {
    expect(normalizeDeviceStatus("disconnected")).toBe("DISCONNECTED");
    expect(normalizeDeviceStatus("connected")).toBe("CONNECTED");
    expect(normalizeDeviceStatus("oauth_not_live")).toBe("DISCONNECTED");
  });

  it("renders connected only for connected status", () => {
    render(<DeviceStatusBadge status="connected" />);
    expect(screen.getByTestId("device-status-badge")).toHaveAttribute("data-state", "CONNECTED");
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it("uses distinct tones for syncing and permission", () => {
    const { rerender } = render(<DeviceStatusBadge status="syncing" />);
    expect(screen.getByTestId("device-status-badge")).toHaveAttribute("data-state", "SYNCING");
    rerender(<DeviceStatusBadge status="permission_required" />);
    expect(screen.getByTestId("device-status-badge")).toHaveAttribute(
      "data-state",
      "PERMISSION_REQUIRED"
    );
  });
});
