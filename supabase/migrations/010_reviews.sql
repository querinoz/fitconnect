-- 010_reviews.sql
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles(id),
  athlete_id uuid not null references public.athlete_profiles(id),
  rating int not null check (rating between 1 and 5),
  body text,
  sport text,
  created_at timestamptz not null default now(),
  unique (coach_id, athlete_id)
);

alter table public.reviews enable row level security;

create policy "reviews_public_read" on public.reviews for select using (true);
