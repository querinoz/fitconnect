"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { CoachAthleteDetailView } from "@/components/dashboard/coach-athlete-detail-view";

export default function CoachAthletePage({
  params
}: {
  params: { id: string };
}) {
  return (
    <AuthGate roles={["coach", "admin"]}>
      <CoachAthleteDetailView athleteId={params.id} />
    </AuthGate>
  );
}
