export type AvailabilitySlotRow = {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  timezone: string;
};

export type CancellationPolicyRow = {
  hoursNotice: number;
  feePercent: number;
  notes: string;
};

const slots = new Map<string, AvailabilitySlotRow[]>();
const policies = new Map<string, CancellationPolicyRow>();

export function resetCoachSettingsForTests() {
  slots.clear();
  policies.clear();
}

export function listAvailability(coachId: string): AvailabilitySlotRow[] {
  const existing = slots.get(coachId);
  if (existing) return existing;
  const defaults: AvailabilitySlotRow[] = [
    {
      id: `${coachId}-mon-am`,
      coachId,
      dayOfWeek: 1,
      startHour: 9,
      endHour: 12,
      timezone: "Europe/Lisbon"
    },
    {
      id: `${coachId}-wed-pm`,
      coachId,
      dayOfWeek: 3,
      startHour: 14,
      endHour: 18,
      timezone: "Europe/Lisbon"
    }
  ];
  slots.set(coachId, defaults);
  return defaults;
}

export function getCancellationPolicy(coachId: string): CancellationPolicyRow {
  const existing = policies.get(coachId);
  if (existing) return existing;
  const policy: CancellationPolicyRow = {
    hoursNotice: 24,
    feePercent: 50,
    notes: "Cancel ≥24h ahead for free reschedule; later cancellations may incur a fee."
  };
  policies.set(coachId, policy);
  return policy;
}
