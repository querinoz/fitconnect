"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { TrainExperience } from "@/components/train/train-experience";

export default function TrainPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <TrainExperience />
    </AuthGate>
  );
}
