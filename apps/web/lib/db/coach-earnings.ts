import { pgQuery } from "@/lib/db/pg-pool";
import { isDatabaseConfigured } from "@/lib/db/client";

export type CoachEarningsLedger = {
  weekCents: number;
  monthCents: number;
  pendingPayoutCents: number;
  subscriptions: number;
  bookingsPaid: number;
  invoicesOpen: number;
  transfersPending: number;
  payoutStatus: string;
  source: "postgres" | "empty";
  stripeLive: false;
};

type TxAgg = {
  week_cents: string | number | null;
  month_cents: string | number | null;
  pending_cents: string | number | null;
  bookings_paid: string | number | null;
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/**
 * Coach earnings ledger from payment_transactions — read-only.
 * Never fabricates Stripe Connect balances. stripeLive is always false until
 * live Connect credentials are configured (BLOCKED_EXTERNAL).
 */
export async function getCoachEarningsLedger(
  coachId: string
): Promise<CoachEarningsLedger> {
  if (!isDatabaseConfigured()) {
    return emptyLedger("empty — no database; Stripe Connect BLOCKED_EXTERNAL");
  }
  try {
    const rows = await pgQuery<TxAgg>(
      `select
         coalesce(sum(case when created_at >= now() - interval '7 days'
           and status = 'succeeded' then coach_payout_cents else 0 end), 0) as week_cents,
         coalesce(sum(case when created_at >= now() - interval '30 days'
           and status = 'succeeded' then coach_payout_cents else 0 end), 0) as month_cents,
         coalesce(sum(case when status in ('pending','processing')
           then coach_payout_cents else 0 end), 0) as pending_cents,
         coalesce(sum(case when kind = 'booking' and status = 'succeeded'
           then 1 else 0 end), 0) as bookings_paid
       from public.payment_transactions
       where coach_id = $1`,
      [coachId]
    );
    const row = rows[0];
    return {
      weekCents: num(row?.week_cents),
      monthCents: num(row?.month_cents),
      pendingPayoutCents: num(row?.pending_cents),
      subscriptions: 0,
      bookingsPaid: num(row?.bookings_paid),
      invoicesOpen: 0,
      transfersPending: 0,
      payoutStatus:
        "ledger from payment_transactions — Stripe Connect LIVE BLOCKED_EXTERNAL",
      source: "postgres",
      stripeLive: false
    };
  } catch {
    return emptyLedger("empty — payment_transactions unavailable");
  }
}

function emptyLedger(status: string): CoachEarningsLedger {
  return {
    weekCents: 0,
    monthCents: 0,
    pendingPayoutCents: 0,
    subscriptions: 0,
    bookingsPaid: 0,
    invoicesOpen: 0,
    transfersPending: 0,
    payoutStatus: status,
    source: "empty",
    stripeLive: false
  };
}
