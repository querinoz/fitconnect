-- 019_post_comments.sql
-- Canonical post comments + reaction delete (unreact) for Firebase UID social.

--;;
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id text not null,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint post_comments_author_id_not_blank check (length(author_id) > 0),
  constraint post_comments_body_not_blank check (length(trim(body)) > 0)
);

--;;
create index if not exists post_comments_post_id_idx
  on public.post_comments (post_id, created_at asc);

--;;
alter table public.post_comments enable row level security;

--;;
alter table public.post_comments force row level security;

--;;
drop policy if exists post_comments_select_all on public.post_comments;

--;;
create policy post_comments_select_all
  on public.post_comments
  for select
  using (deleted_at is null);

--;;
drop policy if exists post_comments_insert_own on public.post_comments;

--;;
create policy post_comments_insert_own
  on public.post_comments
  for insert
  with check (author_id = public.firebase_uid());

--;;
drop policy if exists post_comments_delete_own on public.post_comments;

--;;
create policy post_comments_delete_own
  on public.post_comments
  for update
  using (author_id = public.firebase_uid())
  with check (author_id = public.firebase_uid());

--;;
drop policy if exists post_reactions_delete_own on public.post_reactions;

--;;
create policy post_reactions_delete_own
  on public.post_reactions
  for delete
  using (user_id = public.firebase_uid());

--;;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select, insert, update on table public.post_comments to authenticated;
    grant delete on table public.post_reactions to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant select on table public.post_comments to anon;
  end if;
end $$;
