-- 031_public_read_surface_is_explicit.sql
-- Restores the public coach directory and public reviews in any database built from this
-- migration chain. On the current production database this is a no-op.
--
-- THE BUG, as measured. Applying 001 -> 030 to an empty PostgreSQL 16 and reading the
-- catalog (2026-09-12):
--
--   table            SELECT policy                         qual    anon holds SELECT
--   coach_profiles   coach_profiles_public_read (SELECT)    true    FALSE
--   reviews          reviews_public_read (SELECT)           true    FALSE
--
-- Both tables carry a deliberately identity-free `USING (true)` read policy -- the coach
-- marketplace's shopfront and its public reviews. In a freshly built database neither is
-- reachable, because a policy without a grant grants nothing. A visitor holding the
-- publishable key sees an empty coach directory and no reviews.
--
-- WHY IT ONLY BITES A FRESH BUILD. `coach_profiles` (002) and `reviews` (010) predate the
-- Firebase identity migration and never granted `anon` anything explicitly -- they relied on
-- Supabase's default privileges at table-creation time. 024 then closed that door on purpose:
--
--   alter default privileges in schema public revoke all on tables from anon;
--
-- Production still holds the old grants because its tables were created before 024 ran. Any
-- database built after 024 exists in the chain never receives them. So production works, a
-- rebuild does not, and nothing in the chain says so. That is the same
-- "two sources of truth" failure as docs/qa/PRODUCTION_SCHEMA_RECONCILIATION.md describes,
-- pointing at disaster recovery instead of at a security gap.
--
-- 025_social_anon_read_only.sql already does the right thing for the social tables: it grants
-- `anon` SELECT explicitly rather than inheriting it. This migration extends that principle to
-- the two tables it missed. After this, every table in the intended anonymous read surface is
-- granted by name in a migration, and none of it depends on default privileges.
--
-- THE INTENDED SURFACE, for the record -- nine tables, verified against production:
--   badge_definitions     qual true              reference data, no user rows
--   coach_profiles        qual true              public shopfront            <- granted here
--   reviews               qual true              public reviews              <- granted here
--   squad_challenges      qual true              public teams
--   squad_contributions   qual true              public leaderboard
--   squad_members         qual true              public roster
--   community_posts       qual is_social_eligible    column-gated, not identity-gated (020)
--   post_comments         parent post eligible AND not soft-deleted
--   post_reactions        parent post eligible
-- Nothing else in `public` is anonymously readable: every other SELECT policy requires
-- public.firebase_uid(). Notably payment_transactions, stripe_connect_accounts,
-- user_subscriptions, profiles and body_weight_entries all still carry an `anon` SELECT grant
-- on production, and all of them return zero rows to a visitor because their policies demand
-- an identity. scripts/db-reconcile-schema.mjs check 8 now holds this list as an invariant:
-- a tenth anonymously readable table is an ERROR, not a discovery.
--
-- SAFETY
--   * SELECT only. No INSERT, UPDATE or DELETE to `anon` anywhere -- 028 made `anon`
--     read-only schema-wide and that is not relaxed here.
--   * Row filtering is unchanged: both tables keep RLS enabled and forced, and this grant
--     only lets the existing `USING (true)` policy be evaluated at all.
--   * No-op where the grant already exists, so it is safe on production and re-runnable.
--   * Guarded on the role existing, so it is a no-op on a plain Postgres without Supabase
--     roles (CI's service container) rather than an error.
--   * Reversible with one REVOKE per table.
--
-- WHAT THIS DELIBERATELY DOES NOT DO. It does not grant `anon` SELECT on anything whose read
-- policy requires an identity, and it does not add or widen any policy. If the product ever
-- wants a new public read, that is two deliberate steps -- a policy without an identity
-- predicate and a grant -- and check 8 will make the reviewer confirm both.

--;;
do $public_read$
declare
  t text;
  -- Tables with an identity-free read policy that relied on default privileges and so are
  -- unreachable in a database built after 024. The other seven public-read tables are
  -- granted explicitly by 025 and are not repeated here.
  public_read text[] := array[
    'coach_profiles',
    'reviews'
  ];
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    raise notice 'role anon does not exist; skipping (plain Postgres, not a Supabase project)';
    return;
  end if;

  foreach t in array public_read loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    -- Refuse to publish a table that does not actually have an identity-free read policy:
    -- without one, granting anon SELECT would widen the surface instead of restoring it.
    if not exists (
      select 1 from pg_policies p
       where p.schemaname = 'public'
         and p.tablename = t
         and p.cmd in ('SELECT', 'ALL')
         and coalesce(p.qual, '') !~* 'firebase_uid|auth\.uid'
    ) then
      raise exception
        'refusing to grant anon SELECT on public.% : it has no identity-free read policy, so this would widen the anonymous surface rather than restore it', t;
    end if;

    execute format('grant select on table public.%I to anon', t);
  end loop;
end
$public_read$;

--;;
comment on table public.coach_profiles is
  'Public read surface: the coach directory. Policy coach_profiles_public_read is identity-free by design and anon holds SELECT explicitly (031) rather than by default privilege. Listed in PUBLIC_READ_TABLES in scripts/db-reconcile-schema.mjs.';
comment on table public.reviews is
  'Public read surface: coach reviews. Policy reviews_public_read is identity-free by design and anon holds SELECT explicitly (031) rather than by default privilege. Listed in PUBLIC_READ_TABLES in scripts/db-reconcile-schema.mjs.';
