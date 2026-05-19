/** Coach verification + fraud signal stubs (Phase 5 ops AI). */

export type VerificationStatus = "pending" | "verified" | "rejected";

export function evaluateCoachVerification(input: {
  coachId: string;
  certifications: string[];
  yearsExperience: number;
}): { status: VerificationStatus; notes: string[] } {
  const notes: string[] = [];
  let status: VerificationStatus = "pending";

  if (input.certifications.length >= 2 && input.yearsExperience >= 3) {
    status = "verified";
    notes.push("Meets minimum certification threshold.");
  } else if (input.yearsExperience < 1) {
    status = "rejected";
    notes.push("Insufficient coaching experience for marketplace listing.");
  } else {
    notes.push("Manual review recommended.");
  }

  return { status, notes };
}

export function evaluateRosterAlerts(input: {
  bookingVelocity: number;
  chargebackRate: number;
}): { fraudRisk: "low" | "medium" | "high"; action: string } {
  if (input.chargebackRate > 0.05 || input.bookingVelocity > 50) {
    return { fraudRisk: "high", action: "Hold payouts and request ID verification." };
  }
  if (input.chargebackRate > 0.02) {
    return { fraudRisk: "medium", action: "Enable enhanced monitoring for 14 days." };
  }
  return { fraudRisk: "low", action: "No action required." };
}
