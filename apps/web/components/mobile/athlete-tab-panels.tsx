"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionSummary, ThreadMessage } from "@fitconnect/types";
import {
  StitchCoachScreen,
  StitchInboxScreen,
  StitchProfileScreen,
  StitchSessionsScreen,
  stitchSessionFromSummary,
  type StitchRosterRow
} from "@/components/mobile/stitch-screens";

export function SessionsTabPanel({
  sessions,
  loading,
  coachName = "Diego",
  sessionLive = false,
  onStartLive,
  onEndLive
}: {
  sessions: SessionSummary[];
  loading?: boolean;
  coachName?: string;
  sessionLive?: boolean;
  onStartLive?: () => void;
  onEndLive?: () => void;
}) {
  const router = useRouter();
  const [localLive, setLocalLive] = useState(false);
  const live = sessionLive || localLive;
  const upcoming = sessions.find((s) => s.status === "scheduled") ?? sessions[0];
  const mapped = stitchSessionFromSummary(upcoming, coachName);

  return (
    <StitchSessionsScreen
      sessionLive={live}
      loading={loading}
      title={mapped?.title}
      meta={mapped?.meta}
      timeLabel={mapped?.timeLabel}
      joinHref={mapped?.joinHref}
      onStart={() => {
        setLocalLive(true);
        onStartLive?.();
        router.push("/dashboard");
      }}
      onEnd={() => {
        setLocalLive(false);
        onEndLive?.();
      }}
    />
  );
}

export function CoachTabPanel({
  coachName,
  coachHeadline,
  coachAvatar,
  hrvMs = 68,
  isCoach = false,
  roster
}: {
  coachName: string;
  coachHeadline?: string;
  coachAvatar?: string;
  hrvMs?: number;
  isCoach?: boolean;
  roster?: StitchRosterRow[];
}) {
  const router = useRouter();
  const [messageSent, setMessageSent] = useState(false);

  return (
    <StitchCoachScreen
      isCoach={isCoach}
      coachName={coachName}
      coachHeadline={coachHeadline}
      coachAvatar={coachAvatar}
      hrvMs={hrvMs}
      roster={roster}
      messageSent={messageSent}
      onSendCheckIn={() => {
        setMessageSent(true);
        router.push("/inbox");
      }}
    />
  );
}

export function InboxTabPanel({
  messages,
  loading,
  planApproved,
  onApprovePlan
}: {
  messages: ThreadMessage[];
  loading?: boolean;
  planApproved?: boolean;
  onApprovePlan?: () => void;
}) {
  return (
    <StitchInboxScreen
      messages={messages}
      loading={loading}
      planApproved={planApproved}
      onApprovePlan={onApprovePlan}
    />
  );
}

export function ProfileTabPanel({
  name,
  subtitle,
  streakDays = 35,
  readinessScore = 82,
  isCoach = false,
  showSettings = true,
  extra
}: {
  name: string;
  subtitle?: string;
  streakDays?: number;
  readinessScore?: number;
  isCoach?: boolean;
  showSettings?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <StitchProfileScreen
        name={name}
        subtitle={subtitle}
        streakDays={streakDays}
        readinessScore={readinessScore}
        isCoach={isCoach}
        showSettings={showSettings}
      />
      {extra}
    </div>
  );
}

export { StitchTodayScreen as TodayTabPanel } from "@/components/mobile/stitch-screens";
