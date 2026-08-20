import type { UserRole } from "@/lib/auth";

export type IdentityProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string | null;
  timezone: string | null;
  accent: string | null;
  role: UserRole | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  createdAt?: string;
  updatedAt?: string;
};

export type IdentityOnboarding = {
  uid: string;
  role: UserRole | null;
  step: number;
  completed: boolean;
  payload: Record<string, unknown>;
};
