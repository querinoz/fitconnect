-- 014_social_ascend_firebase.sql
-- Firebase UID (text) social + ASCEND persistence. Replaces uuid-based 007 stub.
-- RLS via public.firebase_uid() — same pattern as 012_firebase_identity.sql.

--;;
drop table if exists public.post_reactions cascade;

--;;
drop table if exists public.community_posts cascade;

--;;
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id text not null,
  post_kind text not null default 'Check-in',
  content text not null,
  sport text,
  author_name text not null,
  author_avatar text,
  metric_label text,
  metric_value text,
  created_at timestamptz not null default now(),
  constraint community_posts_author_id_not_blank check (length(author_id) > 0),
  constraint community_posts_kind_check check (
    post_kind in ('PR', 'Check-in', 'Before/After', 'Question', 'Race')
  )
);

--;;
create table public.post_reactions (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, emoji)
);

--;;
create table public.squad_challenges (
  id text primary key,
  name_key text not null,
  squad_id text not null,
  target_m double precision not null,
  expires_at timestamptz not null,
  reward_xp int not null default 40,
  demo_labeled boolean not null default true,
  created_at timestamptz not null default now()
);

--;;
create table public.squad_members (
  challenge_id text not null references public.squad_challenges(id) on delete cascade,
  user_id text not null,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

--;;
create table public.squad_contributions (
  challenge_id text not null references public.squad_challenges(id) on delete cascade,
  user_id text not null,
  distance_m double precision not null default 0,
  updated_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

--;;
create table public.ascend_progress (
  user_id text primary key,
  total_xp int not null default 0,
  streak_days int not null default 0,
  badges jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint ascend_progress_user_id_not_blank check (length(user_id) > 0)
);

--;;
create table public.ascend_events (
  event_id text not null,
  user_id text not null,
  event_type text not null,
  xp_awarded int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

--;;
create index community_posts_created_at_idx on public.community_posts (created_at desc);

--;;
create index ascend_events_user_idx on public.ascend_events (user_id, processed_at desc);

--;;
alter table public.community_posts enable row level security;

--;;
alter table public.community_posts force row level security;

--;;
alter table public.post_reactions enable row level security;

--;;
alter table public.post_reactions force row level security;

--;;
alter table public.squad_challenges enable row level security;

--;;
alter table public.squad_challenges force row level security;

--;;
alter table public.squad_members enable row level security;

--;;
alter table public.squad_members force row level security;

--;;
alter table public.squad_contributions enable row level security;

--;;
alter table public.squad_contributions force row level security;

--;;
alter table public.ascend_progress enable row level security;

--;;
alter table public.ascend_progress force row level security;

--;;
alter table public.ascend_events enable row level security;

--;;
alter table public.ascend_events force row level security;

--;;
drop policy if exists community_posts_select_all on public.community_posts;

--;;
create policy community_posts_select_all
  on public.community_posts
  for select
  using (true);

--;;
drop policy if exists community_posts_insert_own on public.community_posts;

--;;
create policy community_posts_insert_own
  on public.community_posts
  for insert
  with check (author_id = public.firebase_uid());

--;;
drop policy if exists community_posts_update_own on public.community_posts;

--;;
create policy community_posts_update_own
  on public.community_posts
  for update
  using (author_id = public.firebase_uid())
  with check (author_id = public.firebase_uid());

--;;
drop policy if exists post_reactions_select_all on public.post_reactions;

--;;
create policy post_reactions_select_all
  on public.post_reactions
  for select
  using (true);

--;;
drop policy if exists post_reactions_insert_own on public.post_reactions;

--;;
create policy post_reactions_insert_own
  on public.post_reactions
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists squad_challenges_select_all on public.squad_challenges;

--;;
create policy squad_challenges_select_all
  on public.squad_challenges
  for select
  using (true);

--;;
drop policy if exists squad_members_select_all on public.squad_members;

--;;
create policy squad_members_select_all
  on public.squad_members
  for select
  using (true);

--;;
drop policy if exists squad_members_insert_own on public.squad_members;

--;;
create policy squad_members_insert_own
  on public.squad_members
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists squad_contributions_select_all on public.squad_contributions;

--;;
create policy squad_contributions_select_all
  on public.squad_contributions
  for select
  using (true);

--;;
drop policy if exists squad_contributions_upsert_own on public.squad_contributions;

--;;
create policy squad_contributions_upsert_own
  on public.squad_contributions
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists squad_contributions_update_own on public.squad_contributions;

--;;
create policy squad_contributions_update_own
  on public.squad_contributions
  for update
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists ascend_progress_select_own on public.ascend_progress;

--;;
create policy ascend_progress_select_own
  on public.ascend_progress
  for select
  using (user_id = public.firebase_uid());

--;;
drop policy if exists ascend_progress_insert_own on public.ascend_progress;

--;;
create policy ascend_progress_insert_own
  on public.ascend_progress
  for insert
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists ascend_progress_update_own on public.ascend_progress;

--;;
create policy ascend_progress_update_own
  on public.ascend_progress
  for update
  using (user_id = public.firebase_uid())
  with check (user_id = public.firebase_uid());

--;;
drop policy if exists ascend_events_select_own on public.ascend_events;

--;;
create policy ascend_events_select_own
  on public.ascend_events
  for select
  using (user_id = public.firebase_uid());

--;;
drop policy if exists ascend_events_insert_own on public.ascend_events;

--;;
create policy ascend_events_insert_own
  on public.ascend_events
  for insert
  with check (user_id = public.firebase_uid());

--;;
insert into public.squad_challenges (id, name_key, squad_id, target_m, expires_at, reward_xp, demo_labeled)
values (
  'squad-fc-week',
  'challenge.squad_week',
  'fc-performance',
  50000,
  now() + interval '7 days',
  40,
  true
)
on conflict (id) do nothing;

--;;
insert into public.community_posts (id, author_id, post_kind, content, sport, author_name, author_avatar, metric_label, metric_value, created_at)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'seed-demo',
    'PR',
    'Hit a clean 145 kg back-squat at 64 kg bodyweight today. The block deload was magic.',
    'Strength',
    'Inês P.',
    'https://i.pravatar.cc/200?img=45',
    'Back squat',
    '145 kg',
    now() - interval '2 hours'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'seed-demo',
    'Check-in',
    'Morning Z2 on the coast — legs feel fresh for Saturday long run.',
    'Running',
    'Marco R.',
    'https://i.pravatar.cc/200?img=12',
    null,
    null,
    now() - interval '5 hours'
  )
on conflict (id) do nothing;

--;;
do $grants$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update on table public.community_posts to authenticated;
    grant select, insert on table public.post_reactions to authenticated;
    grant select on table public.squad_challenges to authenticated;
    grant select, insert on table public.squad_members to authenticated;
    grant select, insert, update on table public.squad_contributions to authenticated;
    grant select, insert, update on table public.ascend_progress to authenticated;
    grant select, insert on table public.ascend_events to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant select on table public.community_posts to anon;
    grant select on table public.post_reactions to anon;
    grant select on table public.squad_challenges to anon;
    grant select on table public.squad_members to anon;
    grant select on table public.squad_contributions to anon;
  end if;
end
$grants$;
