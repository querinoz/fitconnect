import type { UserRole } from "@/lib/auth";

const ASSIGNABLE: ReadonlySet<string> = new Set(["athlete", "coach"]);

/**
 * First-time role selection OR re-affirming the same role.
 * Unified identity: adding a *second* capability is handled by grantCapability /
 * plan entitlements — not by flipping this lock.
 *
 * `canAssignAppRole(athlete, coach)` remains false so clients cannot silently
 * replace athlete with coach via the legacy role endpoint. Use capabilities grant.
 */
export function canAssignAppRole(
  current: UserRole | null | undefined,
  next: string
): next is Exclude<UserRole, "admin"> {
  if (!ASSIGNABLE.has(next)) return false;
  if (!current) return true;
  return current === next;
}

/** Whether the account may add this capability (self-serve athlete/coach only). */
export function canGrantCapability(
  existing: ReadonlyArray<string>,
  next: string
): next is "athlete" | "coach" {
  if (next !== "athlete" && next !== "coach") return false;
  return !existing.includes(next);
}

export function parseAppRole(value: unknown): UserRole | null {
  if (value === "athlete" || value === "coach" || value === "admin") return value;
  if (value === "ATHLETE") return "athlete";
  if (value === "COACH") return "coach";
  if (value === "ADMIN") return "admin";
  return null;
}
