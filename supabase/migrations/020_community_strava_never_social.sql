-- 020_community_strava_never_social.sql
-- AGENTS.md §1: STRAVA origin must never appear in social surfaces.
-- Enforced in Postgres (generated column + CHECK + RLS), not UI.
-- Additive only — does not modify migrations 001–019.
-- Dual-schema note: community_* lives in Supabase SQL SoT; Prisma has no
-- CommunityPost model (privileged server only). Prefer this SQL over Prisma.

--;;
do $meta$
begin
  if to_regclass('public.data_schema_meta') is null then
    return;
  end if;
  insert into public.data_schema_meta (key, value, updated_at)
  values
    ('community_strava_never_social_version', '020', now()),
    ('strava_never_social_community', 'provider_id+is_social_eligible+rls', now())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = excluded.updated_at;
end
$meta$;

--;;
-- Origin provider of the post (or of the linked activity). Default MANUAL for
-- seed / user check-ins that are not Strava-sourced.
alter table public.community_posts
  add column if not exists provider_id text not null default 'MANUAL';

--;;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_posts_provider_id_not_blank'
      and conrelid = 'public.community_posts'::regclass
  ) then
    alter table public.community_posts
      add constraint community_posts_provider_id_not_blank
      check (length(provider_id) > 0);
  end if;
end $$;

--;;
-- Generated barrier (case-insensitive), same predicate family as activities.shareable.
alter table public.community_posts
  add column if not exists is_social_eligible boolean
  generated always as (upper(provider_id) <> 'STRAVA') stored;

--;;
-- Hard reject even when RLS is bypassed (service_role / table owner).
-- Social tables must not store STRAVA-origin rows at all.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_posts_is_social_eligible_check'
      and conrelid = 'public.community_posts'::regclass
  ) then
    alter table public.community_posts
      add constraint community_posts_is_social_eligible_check
      check (is_social_eligible);
  end if;
end $$;

--;;
create index if not exists community_posts_social_eligible_created_at_idx
  on public.community_posts (created_at desc)
  where is_social_eligible;

--;;
-- RLS must actually be ON for the policies below to mean anything. Production was
-- observed with relrowsecurity=false and zero policies on both tables while
-- `forced` was still true -- FORCE has no effect while RLS is disabled, so the
-- barrier this file's header promises was not in force. Enable it here, in the
-- same file that defines the policies, so the two can never drift apart again.
alter table public.community_posts enable row level security;
alter table public.community_posts force row level security;

--;;
do $reactions_rls$
begin
  if to_regclass('public.post_reactions') is not null then
    execute 'alter table public.post_reactions enable row level security';
    execute 'alter table public.post_reactions force row level security';
  end if;
end
$reactions_rls$;

--;;
drop policy if exists community_posts_select_all on public.community_posts;

--;;
create policy community_posts_select_all
  on public.community_posts
  for select
  using (is_social_eligible);

--;;
drop policy if exists community_posts_insert_own on public.community_posts;

--;;
create policy community_posts_insert_own
  on public.community_posts
  for insert
  with check (
    author_id = public.firebase_uid()
    and is_social_eligible
  );

--;;
drop policy if exists community_posts_update_own on public.community_posts;

--;;
create policy community_posts_update_own
  on public.community_posts
  for update
  using (
    author_id = public.firebase_uid()
    and is_social_eligible
  )
  with check (
    author_id = public.firebase_uid()
    and is_social_eligible
  );

--;;
-- Reactions only on social-eligible parents (no STRAVA-origin post ids).
drop policy if exists post_reactions_select_all on public.post_reactions;

--;;
create policy post_reactions_select_all
  on public.post_reactions
  for select
  using (
    exists (
      select 1
      from public.community_posts p
      where p.id = post_id
        and p.is_social_eligible
    )
  );

--;;
drop policy if exists post_reactions_insert_own on public.post_reactions;

--;;
create policy post_reactions_insert_own
  on public.post_reactions
  for insert
  with check (
    user_id = public.firebase_uid()
    and exists (
      select 1
      from public.community_posts p
      where p.id = post_id
        and p.is_social_eligible
    )
  );

--;;
-- Comments only on social-eligible parents (019 may not be applied yet).
do $comments$
begin
  if to_regclass('public.post_comments') is null then
    return;
  end if;

  execute 'drop policy if exists post_comments_select_all on public.post_comments';
  execute $pol$
    create policy post_comments_select_all
      on public.post_comments
      for select
      using (
        deleted_at is null
        and exists (
          select 1
          from public.community_posts p
          where p.id = post_id
            and p.is_social_eligible
        )
      )
  $pol$;

  execute 'drop policy if exists post_comments_insert_own on public.post_comments';
  execute $pol$
    create policy post_comments_insert_own
      on public.post_comments
      for insert
      with check (
        author_id = public.firebase_uid()
        and exists (
          select 1
          from public.community_posts p
          where p.id = post_id
            and p.is_social_eligible
        )
      )
  $pol$;
end
$comments$;
