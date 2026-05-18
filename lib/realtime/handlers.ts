import { useDashboardStore } from "@/lib/dashboard-store";
import type { RealtimeMessage } from "./types";

export function applyMessage(m: RealtimeMessage): void {
  const st = useDashboardStore.getState();
  switch (m.kind) {
    case "session-start":
      st.startLiveSession(m.athleteId, "z2");
      return;
    case "live-tick":
      if (st.liveSessions[m.athleteId]) st.appendLiveTick(m.athleteId, m);
      return;
    case "session-end":
      st.endLiveSession(m.athleteId);
      return;
    case "reaction":
      st.addReaction(m.achievementId, m);
      return;
    case "ai-alert":
      st.pushAIAlert(m);
      return;
    default:
      return;
  }
}
