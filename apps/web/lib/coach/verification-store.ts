"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VerificationCase = {
  id: string;
  coachId: string;
  coachName: string;
  email: string;
  sports: string[];
  status: "pending" | "under_review" | "approved" | "rejected";
  submittedAt: string;
  documentsUploaded: boolean;
};

type VerificationState = {
  cases: VerificationCase[];
  submitCase: (input: Omit<VerificationCase, "id" | "status" | "submittedAt">) => void;
  updateStatus: (id: string, status: VerificationCase["status"]) => void;
};

const seed: VerificationCase[] = [
  {
    id: "ver-001",
    coachId: "t-003",
    coachName: "Lior Ben-Ami",
    email: "lior@fitconnect.local",
    sports: ["Climbing"],
    status: "under_review",
    submittedAt: "2026-05-10T09:00:00Z",
    documentsUploaded: true
  }
];

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      cases: seed,
      submitCase: (input) =>
        set((s) => ({
          cases: [
            {
              ...input,
              id: `ver-${Date.now()}`,
              status: "under_review",
              submittedAt: new Date().toISOString()
            },
            ...s.cases
          ]
        })),
      updateStatus: (id, status) =>
        set((s) => ({
          cases: s.cases.map((c) => (c.id === id ? { ...c, status } : c))
        }))
    }),
    { name: "fitconnect-verification" }
  )
);
