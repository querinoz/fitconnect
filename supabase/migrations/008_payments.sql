-- 008_payments.sql
create table public.stripe_connect_accounts (
  coach_id uuid primary key references public.coach_profiles(id),
  stripe_account_id text not null unique,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id),
  athlete_id uuid not null references public.athlete_profiles(id),
  coach_id uuid not null references public.coach_profiles(id),
  amount_cents int not null,
  platform_fee_cents int not null,
  coach_payout_cents int not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.stripe_connect_accounts enable row level security;
alter table public.transactions enable row level security;
