-- 015_stripe_payments_firebase.sql
-- Firebase UID payment tables (replaces uuid-based 008_payments for app use).

--;;
drop table if exists public.transactions cascade;

--;;
drop table if exists public.stripe_connect_accounts cascade;

--;;
create table public.stripe_connect_accounts (
  coach_id text primary key,
  stripe_account_id text not null unique,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--;;
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  athlete_id text not null,
  coach_id text,
  program_id text,
  kind text not null,
  amount_cents int not null,
  platform_fee_cents int not null default 0,
  coach_payout_cents int not null default 0,
  currency text not null default 'eur',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

--;;
create table public.user_subscriptions (
  user_id text primary key,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan_id text not null default 'athlete',
  status text not null default 'active',
  grace_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--;;
create table public.stripe_processed_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

--;;
create index payment_transactions_athlete_idx on public.payment_transactions (athlete_id, created_at desc);

--;;
create index payment_transactions_coach_idx on public.payment_transactions (coach_id, created_at desc);

--;;
alter table public.stripe_connect_accounts enable row level security;

--;;
alter table public.stripe_connect_accounts force row level security;

--;;
alter table public.payment_transactions enable row level security;

--;;
alter table public.payment_transactions force row level security;

--;;
alter table public.user_subscriptions enable row level security;

--;;
alter table public.user_subscriptions force row level security;

--;;
alter table public.stripe_processed_events enable row level security;

--;;
alter table public.stripe_processed_events force row level security;

--;;
drop policy if exists stripe_connect_select_own on public.stripe_connect_accounts;

--;;
create policy stripe_connect_select_own
  on public.stripe_connect_accounts
  for select
  using (coach_id = public.firebase_uid());

--;;
drop policy if exists stripe_connect_insert_own on public.stripe_connect_accounts;

--;;
create policy stripe_connect_insert_own
  on public.stripe_connect_accounts
  for insert
  with check (coach_id = public.firebase_uid());

--;;
drop policy if exists stripe_connect_update_own on public.stripe_connect_accounts;

--;;
create policy stripe_connect_update_own
  on public.stripe_connect_accounts
  for update
  using (coach_id = public.firebase_uid())
  with check (coach_id = public.firebase_uid());

--;;
drop policy if exists payment_transactions_select_own on public.payment_transactions;

--;;
create policy payment_transactions_select_own
  on public.payment_transactions
  for select
  using (athlete_id = public.firebase_uid() or coach_id = public.firebase_uid());

--;;
drop policy if exists user_subscriptions_select_own on public.user_subscriptions;

--;;
create policy user_subscriptions_select_own
  on public.user_subscriptions
  for select
  using (user_id = public.firebase_uid());

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update on table public.stripe_connect_accounts to authenticated;
    grant select on table public.payment_transactions to authenticated;
    grant select on table public.user_subscriptions to authenticated;
  end if;
end
$grants$;
