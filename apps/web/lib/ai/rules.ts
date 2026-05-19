import type { AICoPilotAlert } from "@/lib/realtime/types";

export type AthleteSnapshot = {
  id: string;
  name: string;
  hrvSeries: number[];
  sleepSeries: number[];
  missedSessions: number;
};

const avg = (xs: number[]) =>
  xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;

export function evaluateRoster(
  athletes: AthleteSnapshot[],
  coachId: string,
  today: string = new Date().toISOString().slice(0, 10)
): AICoPilotAlert[] {
  const alerts: AICoPilotAlert[] = [];

  for (const a of athletes) {
    const recent3 = avg(a.hrvSeries.slice(-3));
    const sevenDay = avg(a.hrvSeries.slice(-7));
    if (sevenDay > 0 && recent3 < sevenDay * 0.85) {
      alerts.push({
        kind: "ai-alert",
        id: `${a.id}-hrv-${today}`,
        coachId,
        athleteId: a.id,
        rule: "hrv-down",
        recommendation: "swap-z2",
        body: `${a.name}'s 3-day HRV is ${Math.round((1 - recent3 / sevenDay) * 100)}% below baseline. Suggest swapping today's intervals for Z2 base.`,
        at: new Date().toISOString()
      });
    }

    const recentSleep = avg(a.sleepSeries.slice(-3));
    if (recentSleep && recentSleep < 6) {
      alerts.push({
        kind: "ai-alert",
        id: `${a.id}-sleep-${today}`,
        coachId,
        athleteId: a.id,
        rule: "sleep-low",
        recommendation: "recovery-day",
        body: `${a.name} averaged ${recentSleep.toFixed(1)}h of sleep over 3 days. Consider a recovery day.`,
        at: new Date().toISOString()
      });
    }

    if (a.missedSessions >= 3) {
      alerts.push({
        kind: "ai-alert",
        id: `${a.id}-missed-${today}`,
        coachId,
        athleteId: a.id,
        rule: "missed-sessions",
        recommendation: "lighter-day",
        body: `${a.name} has missed ${a.missedSessions} sessions in 14 days. Reach out to re-engage.`,
        at: new Date().toISOString()
      });
    }
  }

  return alerts;
}
