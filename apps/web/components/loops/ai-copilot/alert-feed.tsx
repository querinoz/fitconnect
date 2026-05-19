import type { AICoPilotAlert } from "@/lib/realtime/types";
import { AlertCard } from "./alert-card";

export function AlertFeed({
  alerts,
  athleteNameFor,
  onApprove,
  onOpenAthlete
}: {
  alerts: AICoPilotAlert[];
  athleteNameFor: (athleteId: string) => string;
  onApprove: (a: AICoPilotAlert) => void;
  onOpenAthlete: (id: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic">
        No co-pilot alerts. Roster is on track.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {alerts.map((a) => (
        <li key={a.id}>
          <AlertCard
            alert={a}
            athleteName={athleteNameFor(a.athleteId)}
            onApprove={onApprove}
            onOpenAthlete={onOpenAthlete}
          />
        </li>
      ))}
    </ul>
  );
}
