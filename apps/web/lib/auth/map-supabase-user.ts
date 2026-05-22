import type { User } from "@supabase/supabase-js";
import type { AuthUser, UserRole } from "@/lib/auth";

/** Map Supabase user + metadata to client AuthUser for Zustand / AuthGate. */
export function mapSupabaseUserToAuthUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  const roleRaw = (meta.role as string | undefined)?.toLowerCase();
  const role: UserRole =
    roleRaw === "coach" ? "coach" : roleRaw === "admin" ? "admin" : "athlete";
  const email = user.email ?? "";
  const slug = email.split("@")[0] || user.id.slice(0, 8);
  const name = (meta.name as string | undefined) || slug;

  return {
    id: user.id,
    username: slug,
    name,
    email,
    role,
    athleteId:
      role === "athlete"
        ? (meta.athleteId as string | undefined) ?? `a-${slug}`
        : undefined,
    coachId:
      role === "coach" ? (meta.coachId as string | undefined) ?? `t-${slug}` : undefined
  };
}
