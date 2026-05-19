-- 007_community.sql
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  content text not null,
  metric_highlight text,
  sport text,
  created_at timestamptz not null default now()
);

create table public.post_reactions (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  primary key (post_id, user_id, emoji)
);

alter table public.community_posts enable row level security;
alter table public.post_reactions enable row level security;
