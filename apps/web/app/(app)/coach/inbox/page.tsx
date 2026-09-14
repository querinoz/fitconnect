"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { InboxList } from "@/components/app/inbox-list";
import { InboxTabPanel } from "@/components/mobile/athlete-tab-panels";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDashboardCoachId } from "@/lib/dashboard/resolve-scope";
import type { ThreadMessage } from "@fitconnect/types";
import { useStitchMobile } from "@/lib/hooks/use-media-query";

export default function CoachInboxPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = resolveDashboardCoachId(user);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const stitchMobile = useStitchMobile();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/messages?coachId=${encodeURIComponent(coachId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coachId]);

  return (
    <AuthGate roles={["coach", "admin"]}>
      {stitchMobile ? (
        <InboxTabPanel messages={messages} loading={loading} />
      ) : (
        <div className="pb-2">
          <InboxList messages={messages} loading={loading} />
        </div>
      )}
    </AuthGate>
  );
}
