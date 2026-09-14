import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecoveryBookingModal } from "./recovery-booking-modal";

describe("RecoveryBookingModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not invent a booking when no coach is linked", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(
      <RecoveryBookingModal
        open
        readinessScore={32}
        coachName="Coach"
        onClose={() => undefined}
      />
    );
    expect(screen.getByRole("link", { name: /find a coach/i })).toHaveAttribute(
      "href",
      "/discover"
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("only toasts success after the bookings API succeeds", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ booking: { id: "bk-1" } })
      })
    );
    render(
      <RecoveryBookingModal
        open
        readinessScore={80}
        coachName="Diego"
        coachId="coach-1"
        athleteId="ath-1"
        onClose={() => undefined}
      />
    );
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));
    await user.click(screen.getByRole("button", { name: /confirm/i }));
    expect(await screen.findByText(/session booked/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/bookings",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("surfaces API failure instead of a fake reservation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: "persistence_not_configured" })
      })
    );
    render(
      <RecoveryBookingModal
        open
        readinessScore={80}
        coachName="Diego"
        coachId="coach-1"
        athleteId="ath-1"
        onClose={() => undefined}
      />
    );
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));
    await user.click(screen.getByRole("button", { name: /confirm/i }));
    expect(
      await screen.findByText(/unavailable until the database is configured/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Session booked$/i)).not.toBeInTheDocument();
  });
});
