"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { InboxTabPanel } from "@/components/mobile/athlete-tab-panels";
import { useAthleteMessages } from "@/lib/api/hooks/use-athlete-messages";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";

export default function AthleteInboxPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = user?.athleteId ?? DEMO_ATHLETE_ID;
  const { messages, loading } = useAthleteMessages(athleteId);

  return (
    <AuthGate roles={["athlete", "admin"]}>
      <InboxTabPanel messages={messages} loading={loading} />
    </AuthGate>
  );
}
