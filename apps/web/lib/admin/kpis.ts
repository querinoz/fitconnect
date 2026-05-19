export type AdminKpis = {
  paidAthletes: number;
  verifiedCoaches: number;
  mrrEur: number;
  sessionsThisWeek: number;
  goalCompletionRate: number;
  pendingVerifications: number;
};

export function getAdminKpis(): AdminKpis {
  return {
    paidAthletes: 842,
    verifiedCoaches: 12418,
    mrrEur: 10104,
    sessionsThisWeek: 318,
    goalCompletionRate: 0.73,
    pendingVerifications: 3
  };
}

export type AdminAthleteRow = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  coach: string;
  status: "active" | "paused";
};

export const ADMIN_ATHLETES: AdminAthleteRow[] = [
  {
    id: "a-ines",
    name: "Inês M.",
    email: "ines@fitconnect.local",
    plan: "pro",
    coach: "Tomás Ribeiro",
    status: "active"
  },
  {
    id: "a-pedro",
    name: "Pedro S.",
    email: "pedro@fitconnect.local",
    plan: "pro",
    coach: "Marina Costa",
    status: "active"
  },
  {
    id: "a-sara",
    name: "Sara L.",
    email: "sara@fitconnect.local",
    plan: "free",
    coach: "—",
    status: "paused"
  }
];

export type AdminPaymentRow = {
  id: string;
  type: "subscription" | "session" | "program";
  amountEur: number;
  status: "paid" | "pending" | "refunded";
  party: string;
  date: string;
};

export const ADMIN_PAYMENTS: AdminPaymentRow[] = [
  {
    id: "tx-001",
    type: "subscription",
    amountEur: 12,
    status: "paid",
    party: "Inês M.",
    date: "2026-05-18"
  },
  {
    id: "tx-002",
    type: "session",
    amountEur: 65,
    status: "paid",
    party: "Pedro S. → Tomás R.",
    date: "2026-05-17"
  },
  {
    id: "tx-003",
    type: "program",
    amountEur: 149,
    status: "pending",
    party: "Sara L.",
    date: "2026-05-16"
  }
];

export type FunnelStep = {
  label: string;
  count: number;
  rate: number;
};

export function getAdminFunnel(): FunnelStep[] {
  return [
    { label: "Signup", count: 4200, rate: 1 },
    { label: "Onboarding complete", count: 3100, rate: 0.74 },
    { label: "Free intro booked", count: 2100, rate: 0.5 },
    { label: "Paid session", count: 980, rate: 0.23 }
  ];
}
