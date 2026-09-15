"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { MartialArtsExperience } from "@/components/martial-arts/martial-arts-experience";

export default function MartialArtsPage() {
  return (
    <AuthGate roles={["athlete", "coach", "admin"]}>
      <MartialArtsExperience />
    </AuthGate>
  );
}
