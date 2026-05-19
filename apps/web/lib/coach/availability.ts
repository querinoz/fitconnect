/** Deterministic availability mock for coach cards. */
export type AvailabilityStatus = "available" | "limited" | "waitlist";

export function getCoachAvailability(coachId: string): AvailabilityStatus {
  const n = coachId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  if (n % 5 === 0) return "waitlist";
  if (n % 3 === 0) return "limited";
  return "available";
}

export const availabilityLabel: Record<AvailabilityStatus, string> = {
  available: "Open slots",
  limited: "Few slots",
  waitlist: "Waitlist"
};

export const availabilityTone: Record<AvailabilityStatus, string> = {
  available: "text-accent-400",
  limited: "text-amber-400",
  waitlist: "text-signal-400"
};
