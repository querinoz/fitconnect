-- 028_anon_is_read_only.sql
-- `anon` becomes read-only across the whole public schema.
--
-- Evidence for why this is safe rather than a guess. Every write policy in the
-- schema pins an identity; this query returns zero rows on production:
--
--   select tablename, policyname, cmd
--   from pg_policies
--   where schemaname='public'
--     and cmd in ('INSERT','UPDATE','ALL')
--     and coalesce(with_check,'') !~* 'firebase_uid|auth\.uid'
--     and coalesce(qual,'')       !~* 'firebase_uid|auth\.uid';
--
-- So there is no anonymous write path the product relies on -- an anonymous
-- PostgREST session can never satisfy `= public.firebase_uid()`. The INSERT/UPDATE/
-- DELETE grants `anon` still carried on 36 tables were leftovers from the early
-- migrations, backing nothing. RLS was already denying those writes; this removes
-- the grant behind them so a future policy mistake cannot become an anonymous write.
--
-- SELECT is deliberately untouched: the public feed, badge catalog and marketing
-- surfaces read as `anon` and keep working. `authenticated` and `service_role` are
-- untouched. Nothing is dropped, no row changes, and a single GRANT reverses it.

--;;
do $anon_read_only$
declare
  r record;
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    return;
  end if;
  for r in
    select c.oid::regclass as ident
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
  loop
    execute format('revoke insert, update, delete on table %s from anon', r.ident);
  end loop;
end
$anon_read_only$;
