/**
 * Unified identity — capabilities + active mode (not exclusive login roles).
 * One Firebase account → many capabilities → one activeMode for UX.
 */

/** Expandable product capabilities (not limited to athlete|coach forever). */
export type AppCapability =
  | "athlete"
  | "coach"
  | "club_admin"
  | "team_manager"
  | "specialist"
  | "organization_admin";

/** UX shell currently shown. Authorization still requires the matching capability. */
export type ActiveMode = "athlete" | "coach";

export type SubscriptionPlanId = "athlete" | "team" | "coach" | "free" | "unknown";

export type CapabilitySource = "legacy_role" | "plan" | "grant" | "demo";

export type UserCapabilities = {
  /** Ordered unique capabilities the account owns. */
  capabilities: AppCapability[];
  athlete: boolean;
  coach: boolean;
};

export type EntitlementSnapshot = {
  planId: SubscriptionPlanId;
  /** Capabilities granted by the current plan (may be a subset of owned). */
  planCapabilities: AppCapability[];
  status: "active" | "trialing" | "past_due" | "canceled" | "none" | "unknown";
};

export type UnifiedIdentityMe = {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  /** Legacy single-role mirror — equals activeMode for app shells. */
  role: ActiveMode | "admin" | null;
  capabilities: AppCapability[];
  activeMode: ActiveMode | null;
  entitlements: EntitlementSnapshot;
  onboardingCompleted: boolean;
  onboardingStep: number;
};

/** Maps existing Stripe plan ids → capability grants. Free default = athlete. */
export function capabilitiesFromPlan(planId: string | null | undefined): AppCapability[] {
  switch (planId) {
    case "coach":
      return ["coach"];
    case "team":
      return ["athlete", "coach"];
    case "athlete":
      return ["athlete"];
    case "free":
    case null:
    case undefined:
    case "":
      return ["athlete"];
    default:
      return ["athlete"];
  }
}

export function resolveActiveMode(input: {
  capabilities: AppCapability[];
  preferred?: ActiveMode | null;
  legacyRole?: ActiveMode | "admin" | null;
}): ActiveMode | null {
  const hasAthlete = input.capabilities.includes("athlete");
  const hasCoach = input.capabilities.includes("coach");
  if (!hasAthlete && !hasCoach) return null;
  if (hasAthlete && !hasCoach) return "athlete";
  if (!hasAthlete && hasCoach) return "coach";
  if (input.preferred === "athlete" || input.preferred === "coach") {
    if (input.preferred === "athlete" && hasAthlete) return "athlete";
    if (input.preferred === "coach" && hasCoach) return "coach";
  }
  if (input.legacyRole === "coach" && hasCoach) return "coach";
  if (input.legacyRole === "athlete" && hasAthlete) return "athlete";
  return "athlete";
}

export function toUserCapabilities(list: AppCapability[]): UserCapabilities {
  const unique = Array.from(new Set(list));
  return {
    capabilities: unique,
    athlete: unique.includes("athlete"),
    coach: unique.includes("coach")
  };
}
