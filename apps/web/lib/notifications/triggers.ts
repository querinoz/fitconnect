import { listPushTokensForUser } from "@/lib/notifications/push-store";
import { sendPushToTokens } from "@/lib/notifications/send-push";

export async function notifyReadinessLow(userId: string, score: number) {
  const tokens = await listPushTokensForUser(userId);
  if (!tokens.length) return;
  await sendPushToTokens(
    tokens.map((t) => t.token),
    "Recovery alert",
    `Your readiness is ${score} — consider lighter training today.`,
    { type: "readiness_low", score: String(score) }
  );
}

export async function notifyCoachMessage(userId: string, coachName: string) {
  const tokens = await listPushTokensForUser(userId);
  if (!tokens.length) return;
  await sendPushToTokens(
    tokens.map((t) => t.token),
    "Coach message",
    `${coachName} sent you an update.`,
    { type: "coach_message" }
  );
}

export async function notifyAthleteNeedsAttention(userId: string, athleteName: string) {
  const tokens = await listPushTokensForUser(userId);
  if (!tokens.length) return;
  await sendPushToTokens(
    tokens.map((t) => t.token),
    "Athlete alert",
    `${athleteName} needs your attention today.`,
    { type: "athlete_needs_attention" }
  );
}
