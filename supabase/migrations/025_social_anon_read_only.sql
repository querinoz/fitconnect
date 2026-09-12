-- 025_social_anon_read_only.sql
-- Defence in depth on the social tables.
--
-- RLS already blocks anonymous writes: every insert policy from 019/020 requires
-- author_id / user_id = public.firebase_uid(), which an anonymous PostgREST
-- session cannot satisfy. The INSERT/UPDATE/DELETE grants to `anon` are left over
-- from 014 and back no flow, so remove them. The public feed stays readable;
-- writing now requires a signed-in identity at both the grant layer and the
-- policy layer rather than at the policy layer alone.
--
-- Additive and reversible. No row is touched.

--;;
do $anon_read_only$
declare
  t text;
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    return;
  end if;
  foreach t in array array['community_posts','post_reactions','post_comments'] loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;
    execute format('revoke insert, update, delete, truncate on table public.%I from anon', t);
    execute format('grant select on table public.%I to anon', t);
  end loop;
end
$anon_read_only$;
