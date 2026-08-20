import type { UserRole } from "@/lib/auth";

const ASSIGNABLE: ReadonlySet<string> = new Set(["athlete", "coach"]);

/** Server-enforced FitConnect role transitions. Client values are never trusted. */
export function canAssignAppRole(
  current: UserRole | null | undefined,
  next: string
): next is Exclude<UserRole, "admin"> {
  if (!ASSIGNABLE.has(next)) return false;
  if (!current) return true;
  return current === next;
}

export function parseAppRole(value: unknown): UserRole | null {
  if (value === "athlete" || value === "coach" || value === "admin") return value;
  if (value === "ATHLETE") return "athlete";
  if (value === "COACH") return "coach";
  if (value === "ADMIN") return "admin";
  return null;
}
