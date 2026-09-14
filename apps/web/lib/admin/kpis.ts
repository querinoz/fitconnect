import { connection } from "next/server";
import { pgQuery } from "@/lib/db/pg-pool";
import { isDatabaseConfigured } from "@/lib/db/client";

export type AdminKpis = {
  paidAthletes: number;
  verifiedCoaches: number;
  mrrEur: number;
  sessionsThisWeek: number;
  goalCompletionRate: number;
  pendingVerifications: number;
  source: "database" | "unavailable";
};

export type AdminAthleteRow = {
  id: string;
  name: string;
  email: string;
  plan: string;
  coach: string;
  status: string;
};

export type AdminPaymentRow = {
  id: string;
  type: string;
  amountEur: number;
  status: string;
  party: string;
  date: string;
};

export type FunnelStep = {
  label: string;
  count: number;
  rate: number;
};

/** Abort SSG even if a parent layout is a Client Component (the 5d627a4 failure). */
async function requireAdminRuntime(): Promise<void> {
  await connection();
}

const EMPTY_KPIS: AdminKpis = {
  paidAthletes: 0,
  verifiedCoaches: 0,
  mrrEur: 0,
  sessionsThisWeek: 0,
  goalCompletionRate: 0,
  pendingVerifications: 0,
  source: "unavailable"
};

export function emptyAdminKpis(): AdminKpis {
  return { ...EMPTY_KPIS };
}

export function emptyAdminFunnel(): FunnelStep[] {
  return [
    { label: "Signup", count: 0, rate: 0 },
    { label: "Onboarding complete", count: 0, rate: 0 },
    { label: "Free intro booked", count: 0, rate: 0 },
    { label: "Paid session", count: 0, rate: 0 }
  ];
}

export async function loadAdminKpis(): Promise<AdminKpis> {
  await requireAdminRuntime();
  if (!isDatabaseConfigured()) return emptyAdminKpis();
  const paid = await pgQuery<{ n: string }>(
    `select count(*)::text as n from public.user_subscriptions where status in ('active','trialing')`
  );
  const coaches = await pgQuery<{ n: string }>(
    `select count(*)::text as n from public.user_capabilities where capability = 'coach'`
  );
  const mrr = await pgQuery<{ n: string }>(
    `select coalesce(sum(amount_cents),0)::text as n
     from public.payment_transactions
     where status = 'succeeded' and kind = 'subscription'`
  );
  const sessions = await pgQuery<{ n: string }>(
    `select count(*)::text as n from public.payment_transactions
     where status = 'succeeded' and kind = 'session'
       and created_at >= now() - interval '7 days'`
  );
  return {
    paidAthletes: Number(paid[0]?.n ?? 0),
    verifiedCoaches: Number(coaches[0]?.n ?? 0),
    mrrEur: Math.round(Number(mrr[0]?.n ?? 0) / 100),
    sessionsThisWeek: Number(sessions[0]?.n ?? 0),
    goalCompletionRate: 0,
    pendingVerifications: 0,
    source: "database"
  };
}

export async function loadAdminAthletes(): Promise<AdminAthleteRow[]> {
  await requireAdminRuntime();
  if (!isDatabaseConfigured()) return [];
  const rows = await pgQuery<{
    user_id: string;
    plan_id: string;
    status: string;
  }>(
    `select user_id, plan_id, status from public.user_subscriptions order by updated_at desc limit 50`
  );
  return rows.map((r) => ({
    id: r.user_id,
    name: r.user_id,
    email: "",
    plan: r.plan_id,
    coach: "—",
    status: r.status
  }));
}

export async function loadAdminPayments(): Promise<AdminPaymentRow[]> {
  await requireAdminRuntime();
  if (!isDatabaseConfigured()) return [];
  const rows = await pgQuery<{
    stripe_checkout_session_id: string;
    kind: string;
    amount_cents: number;
    status: string;
    athlete_id: string;
    created_at: string;
  }>(
    `select stripe_checkout_session_id, kind, amount_cents, status, athlete_id, created_at::text
     from public.payment_transactions
     order by created_at desc
     limit 50`
  );
  return rows.map((r) => ({
    id: r.stripe_checkout_session_id,
    type: r.kind,
    amountEur: r.amount_cents / 100,
    status: r.status,
    party: r.athlete_id,
    date: r.created_at.slice(0, 10)
  }));
}

export async function loadAdminFunnel(): Promise<FunnelStep[]> {
  await requireAdminRuntime();
  if (!isDatabaseConfigured()) return emptyAdminFunnel();
  const rows = await pgQuery<{ name: string; n: string }>(
    `select name, count(*)::text as n from public.analytics_events group by name`
  );
  const counts = Object.fromEntries(rows.map((r) => [r.name, Number(r.n)]));
  const signup = counts.signup ?? counts.landing_view ?? 0;
  const onboard = counts.onboarding_complete ?? 0;
  const intro = counts.book_intro ?? 0;
  const paid = counts.paid_session ?? 0;
  const denom = Math.max(signup, 1);
  return [
    { label: "Signup", count: signup, rate: signup ? 1 : 0 },
    { label: "Onboarding complete", count: onboard, rate: onboard / denom },
    { label: "Free intro booked", count: intro, rate: intro / denom },
    { label: "Paid session", count: paid, rate: paid / denom }
  ];
}

/** @deprecated Use loadAdminKpis — kept for existing client imports during migration. */
export function getAdminKpis(): AdminKpis {
  return emptyAdminKpis();
}

/** @deprecated Use loadAdminFunnel. */
export function getAdminFunnel(): FunnelStep[] {
  return emptyAdminFunnel();
}

export const ADMIN_ATHLETES: AdminAthleteRow[] = [];
export const ADMIN_PAYMENTS: AdminPaymentRow[] = [];
