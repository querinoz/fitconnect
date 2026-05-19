"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OnboardingRole = "athlete" | "coach";

export type AthleteOnboardingData = {
  sports: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  goal: string;
  wearablesConnected: boolean;
  subscription: "free" | "pro";
  completed: boolean;
};

export type CoachOnboardingData = {
  bio: string;
  sports: string[];
  hourlyRate: number;
  documentsUploaded: boolean;
  stripeConnected: boolean;
  verificationStatus: "pending" | "under_review" | "approved" | "rejected";
  completed: boolean;
};

type OnboardingState = {
  role: OnboardingRole | null;
  athlete: AthleteOnboardingData;
  coach: CoachOnboardingData;
  setRole: (role: OnboardingRole) => void;
  patchAthlete: (patch: Partial<AthleteOnboardingData>) => void;
  patchCoach: (patch: Partial<CoachOnboardingData>) => void;
  reset: () => void;
};

const defaultAthlete: AthleteOnboardingData = {
  sports: [],
  level: "Intermediate",
  goal: "",
  wearablesConnected: false,
  subscription: "free",
  completed: false
};

const defaultCoach: CoachOnboardingData = {
  bio: "",
  sports: [],
  hourlyRate: 65,
  documentsUploaded: false,
  stripeConnected: false,
  verificationStatus: "pending",
  completed: false
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      role: null,
      athlete: defaultAthlete,
      coach: defaultCoach,
      setRole: (role) => set({ role }),
      patchAthlete: (patch) =>
        set((s) => ({ athlete: { ...s.athlete, ...patch } })),
      patchCoach: (patch) => set((s) => ({ coach: { ...s.coach, ...patch } })),
      reset: () =>
        set({ role: null, athlete: defaultAthlete, coach: defaultCoach })
    }),
    { name: "fitconnect-onboarding" }
  )
);
