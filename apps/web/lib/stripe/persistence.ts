import { pgQuery } from "@/lib/db/pg-pool";
import { isDatabaseConfigured } from "@/lib/db/client";

export type ConnectAccountRow = {
  coach_id: string;
  stripe_account_id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  onboarding_complete: boolean;
};

export type SubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: string;
  grace_period_ends_at: string | null;
};

export function isStripePgPersistenceAvailable(): boolean {
  return isDatabaseConfigured();
}

export async function claimStripeEventPg(eventId: string, eventType: string): Promise<boolean> {
  if (!isStripePgPersistenceAvailable()) return true;
  try {
    await pgQuery(
      `insert into public.stripe_processed_events (stripe_event_id, event_type) values ($1, $2)`,
      [eventId, eventType]
    );
    return true;
  } catch {
    return false;
  }
}

export async function getConnectAccountPg(coachId: string): Promise<ConnectAccountRow | null> {
  const rows = await pgQuery<ConnectAccountRow>(
    `select * from public.stripe_connect_accounts where coach_id = $1`,
    [coachId]
  );
  return rows[0] ?? null;
}

export async function upsertConnectAccountPg(input: {
  coachId: string;
  stripeAccountId: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  onboardingComplete?: boolean;
}) {
  await pgQuery(
    `insert into public.stripe_connect_accounts
      (coach_id, stripe_account_id, charges_enabled, payouts_enabled, onboarding_complete, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (coach_id) do update set
       stripe_account_id = excluded.stripe_account_id,
       charges_enabled = excluded.charges_enabled,
       payouts_enabled = excluded.payouts_enabled,
       onboarding_complete = excluded.onboarding_complete,
       updated_at = now()`,
    [
      input.coachId,
      input.stripeAccountId,
      input.chargesEnabled ?? false,
      input.payoutsEnabled ?? false,
      input.onboardingComplete ?? false
    ]
  );
}

export async function recordPaymentTransactionPg(input: {
  checkoutSessionId: string;
  paymentIntentId?: string | null;
  athleteId: string;
  coachId?: string;
  programId?: string;
  kind: string;
  amountCents: number;
  platformFeeCents: number;
  coachPayoutCents: number;
  status?: string;
}) {
  await pgQuery(
    `insert into public.payment_transactions
      (stripe_checkout_session_id, stripe_payment_intent_id, athlete_id, coach_id, program_id,
       kind, amount_cents, platform_fee_cents, coach_payout_cents, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (stripe_checkout_session_id) do update set
       status = excluded.status,
       stripe_payment_intent_id = coalesce(excluded.stripe_payment_intent_id, payment_transactions.stripe_payment_intent_id)`,
    [
      input.checkoutSessionId,
      input.paymentIntentId ?? null,
      input.athleteId,
      input.coachId ?? null,
      input.programId ?? null,
      input.kind,
      input.amountCents,
      input.platformFeeCents,
      input.coachPayoutCents,
      input.status ?? "succeeded"
    ]
  );
}

export async function upsertSubscriptionPg(input: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  planId: string;
  status: string;
  gracePeriodEndsAt?: Date | null;
}) {
  await pgQuery(
    `insert into public.user_subscriptions
      (user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, grace_period_ends_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, now())
     on conflict (user_id) do update set
       stripe_customer_id = coalesce(excluded.stripe_customer_id, user_subscriptions.stripe_customer_id),
       stripe_subscription_id = coalesce(excluded.stripe_subscription_id, user_subscriptions.stripe_subscription_id),
       plan_id = excluded.plan_id,
       status = excluded.status,
       grace_period_ends_at = excluded.grace_period_ends_at,
       updated_at = now()`,
    [
      input.userId,
      input.stripeCustomerId ?? null,
      input.stripeSubscriptionId ?? null,
      input.planId,
      input.status,
      input.gracePeriodEndsAt ?? null
    ]
  );
}

export async function updateSubscriptionByStripeIdPg(
  stripeSubscriptionId: string,
  patch: { status?: string; planId?: string; gracePeriodEndsAt?: Date | null }
) {
  const sets: string[] = ["updated_at = now()"];
  const params: unknown[] = [stripeSubscriptionId];
  let i = 2;
  if (patch.status) {
    sets.push(`status = $${i++}`);
    params.push(patch.status);
  }
  if (patch.planId) {
    sets.push(`plan_id = $${i++}`);
    params.push(patch.planId);
  }
  if (patch.gracePeriodEndsAt !== undefined) {
    sets.push(`grace_period_ends_at = $${i++}`);
    params.push(patch.gracePeriodEndsAt);
  }
  await pgQuery(
    `update public.user_subscriptions set ${sets.join(", ")} where stripe_subscription_id = $1`,
    params
  );
}

export async function getSubscriptionPg(userId: string): Promise<SubscriptionRow | null> {
  const rows = await pgQuery<SubscriptionRow>(
    `select * from public.user_subscriptions where user_id = $1`,
    [userId]
  );
  return rows[0] ?? null;
}

export async function getCustomerIdPg(userId: string): Promise<string | null> {
  const row = await getSubscriptionPg(userId);
  return row?.stripe_customer_id ?? null;
}
