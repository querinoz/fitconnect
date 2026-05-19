export type CoachPayoutRow = {
  id: string;
  athleteName: string;
  sessionType: string;
  date: string;
  amountCents: number;
  coachShareCents: number;
  platformFeeCents: number;
  status: "paid" | "pending";
};

export type CoachEarningsMonth = {
  month: string;
  grossCents: number;
  coachNetCents: number;
};

export const COACH_TAKE_HOME_RATE = 0.85;

export function coachShare(amountCents: number) {
  return Math.round(amountCents * COACH_TAKE_HOME_RATE);
}

export function platformFee(amountCents: number) {
  return amountCents - coachShare(amountCents);
}

export function getCoachEarningsSeries(coachId: string): CoachEarningsMonth[] {
  const base =
    coachId === "t-001"
      ? [3200, 3480, 3650, 3920, 4100, 4280]
      : [1680, 1820, 1950, 2010, 2080, 2140];
  const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  return months.map((month, i) => {
    const grossCents = base[i]! * 100;
    const coachNetCents = coachShare(grossCents);
    return { month, grossCents, coachNetCents };
  });
}

export function getCoachPayouts(coachId: string): CoachPayoutRow[] {
  const athletes =
    coachId === "t-001"
      ? ["Marina athlete · João", "Marina athlete · Sara", "Marina athlete · Luís"]
      : ["Inês M.", "Pedro V.", "Ana C."];
  return [
    {
      id: "pay-1",
      athleteName: athletes[0]!,
      sessionType: "Strength · 60 min",
      date: "2026-05-17",
      amountCents: 6500,
      coachShareCents: coachShare(6500),
      platformFeeCents: platformFee(6500),
      status: "paid"
    },
    {
      id: "pay-2",
      athleteName: athletes[1]!,
      sessionType: "Threshold intervals",
      date: "2026-05-16",
      amountCents: 5500,
      coachShareCents: coachShare(5500),
      platformFeeCents: platformFee(5500),
      status: "paid"
    },
    {
      id: "pay-3",
      athleteName: athletes[2] ?? athletes[0]!,
      sessionType: "Free intro",
      date: "2026-05-18",
      amountCents: 0,
      coachShareCents: 0,
      platformFeeCents: 0,
      status: "pending"
    },
    {
      id: "pay-4",
      athleteName: athletes[0]!,
      sessionType: "Program · 12 weeks",
      date: "2026-05-15",
      amountCents: 14900,
      coachShareCents: coachShare(14900),
      platformFeeCents: platformFee(14900),
      status: "paid"
    }
  ];
}

export function formatEur(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(cents / 100);
}
