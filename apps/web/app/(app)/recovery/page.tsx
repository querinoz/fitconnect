"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { RecoveryExperience } from "@/components/recovery/recovery-experience";

export default function RecoveryPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <RecoveryExperience />
    </AuthGate>
  );
}
