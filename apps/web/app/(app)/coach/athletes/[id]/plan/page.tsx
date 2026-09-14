"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { PlanBuilder } from "@/components/coach/plan-builder";
import { useAuthStore } from "@/lib/auth-store";
import {
  selectAthlete,
  selectPlanForAthlete,
  useDashboardStore
} from "@/lib/dashboard-store";
import { resolveDashboardCoachId } from "@/lib/dashboard/resolve-scope";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CoachPlanBuilderPage() {
  const params = useParams();
  const athleteId = String(params.id);
  const user = useAuthStore((s) => s.user);
  const coachId = resolveDashboardCoachId(user);

  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const plan = useDashboardStore((s) => selectPlanForAthlete(s, athleteId));

  return (
    <AuthGate roles={["coach", "admin"]}>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={`/coach/athletes/${athleteId}`} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to athlete
        </Link>
      </Button>

      {athlete && plan && athlete.coachId === coachId ? (
        <PlanBuilder
          planId={plan.id}
          athleteId={athleteId}
          athleteName={athlete.name}
          initialBlocks={plan.blocks}
          aiSuggestion={
            plan.aiSuggestion ||
            `Based on ${athlete.name}'s HRV, reduce Thursday intensity by 15%.`
          }
        />
      ) : (
        <p className="text-ink-400">Plan not found for this athlete.</p>
      )}
    </AuthGate>
  );
}
