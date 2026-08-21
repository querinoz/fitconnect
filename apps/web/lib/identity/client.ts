"use client";

import type { AuthUser, UserRole } from "@/lib/auth";
import type { IdentityProfile } from "@/lib/identity/types";

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
