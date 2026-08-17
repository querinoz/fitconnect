import { TRPCError } from "@trpc/server";
import type { ContextUser } from "./context";

/**
 * Bind a requested athlete/coach id to the authenticated principal.
 * Admins may impersonate any subject. Everyone else may only act as themselves.
 */
export function bindSubjectId(
  user: ContextUser,
  requestedId: string,
  kind: "athlete" | "coach"
): string {
  if (user.role === "admin") {
    return requestedId;
  }
  if (kind === "coach" && user.role !== "coach") {
    throw new TRPCError({ code: "FORBIDDEN", message: "coach_role_required" });
  }
  if (kind === "athlete" && user.role === "coach") {
    throw new TRPCError({ code: "FORBIDDEN", message: "athlete_subject_required" });
  }
  if (requestedId !== user.id) {
    throw new TRPCError({ code: "FORBIDDEN", message: `${kind}_mismatch` });
  }
  return user.id;
}
