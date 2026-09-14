"use client";

import type { AuthUser, UserRole } from "@/lib/auth";
import type { IdentityProfile } from "@/lib/identity/types";
import type { UnifiedIdentityMe } from "@fitconnect/types";

async function identityFetch(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  return response;
}

export async function bootstrapProfile(input?: {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}): Promise<IdentityProfile | null> {
  const response = await identityFetch("/api/v1/identity/profile", {
    method: "POST",
    body: JSON.stringify(input ?? {})
  });
  if (!response.ok) return null;
  return (await response.json()) as IdentityProfile;
}

export async function fetchIdentityProfile(): Promise<IdentityProfile | null> {
  const response = await identityFetch("/api/v1/identity/profile");
  if (!response.ok) return null;
  return (await response.json()) as IdentityProfile;
}

export async function persistIdentityRole(role: Exclude<UserRole, "admin">): Promise<UserRole | null> {
  const response = await identityFetch("/api/v1/identity/role", {
    method: "PUT",
    body: JSON.stringify({ role })
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { role?: UserRole | null };
  return body.role ?? null;
}

export async function fetchIdentityMe(): Promise<UnifiedIdentityMe | null> {
  const response = await identityFetch("/api/v1/identity/me");
  if (!response.ok) return null;
  return (await response.json()) as UnifiedIdentityMe;
}

/** Switch UX shell without logout. Server still requires the owned capability. */
export async function persistActiveMode(
  mode: Exclude<UserRole, "admin">,
): Promise<{ activeMode: Exclude<UserRole, "admin">; capabilities: string[] } | null> {
  const response = await identityFetch("/api/v1/identity/active-mode", {
    method: "PUT",
    body: JSON.stringify({ activeMode: mode })
  });
  if (!response.ok) return null;
  const body = (await response.json()) as {
    activeMode?: Exclude<UserRole, "admin">;
    capabilities?: string[];
  };
  if (body.activeMode !== "athlete" && body.activeMode !== "coach") return null;
  return {
    activeMode: body.activeMode,
    capabilities: body.capabilities ?? []
  };
}

export async function persistOnboarding(patch: {
  role?: UserRole | null;
  step?: number;
  completed?: boolean;
  payload?: Record<string, unknown>;
}) {
  await identityFetch("/api/v1/identity/onboarding", {
    method: "PUT",
    body: JSON.stringify(patch)
  });
}

export function applyIdentityToAuthUser(user: AuthUser, profile: IdentityProfile | null): AuthUser {
  if (!profile) return user;
  const role = profile.role ?? user.role;
  return {
    ...user,
    id: profile.uid,
    name: profile.displayName || user.name,
    email: profile.email || user.email,
    role,
    athleteId: role === "athlete" ? profile.uid : user.athleteId,
    coachId: role === "coach" ? profile.uid : user.coachId
  };
}
