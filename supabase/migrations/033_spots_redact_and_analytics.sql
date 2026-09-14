-- 033: exact spot coordinates stay owner-only; analytics events are server-written.
-- AGENTS.md: app-layer redaction of exact_lat/exact_lng is not sufficient.

DROP POLICY IF EXISTS training_spots_read_approx ON public.training_spots;

CREATE POLICY training_spots_select_own
  ON public.training_spots
  FOR SELECT
  USING (creator_id = public.firebase_uid());

CREATE OR REPLACE VIEW public.training_spots_public AS
SELECT
  id,
  name,
  sport_key,
  description,
  NULL::double precision AS exact_lat,
  NULL::double precision AS exact_lng,
  approx_lat,
  approx_lng,
  blur_radius_m,
  visibility,
  access_status,
  difficulty,
  risk,
  risk_confidence,
  reports_count,
  last_verified_at,
  creator_id,
  is_secret,
  moderation_state,
  created_at,
  updated_at
FROM public.training_spots
WHERE visibility IN ('PUBLIC', 'APPROXIMATE')
  AND moderation_state IN ('PENDING_REVIEW', 'COMMUNITY_VERIFIED', 'VERIFIED');

COMMENT ON VIEW public.training_spots_public IS
  'Public/approximate spots with exact_lat/exact_lng forced null. Owners read exact coords from the base table.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    GRANT SELECT ON public.training_spots_public TO anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT ON public.training_spots_public TO authenticated;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  path text,
  uid text,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_name_idx ON public.analytics_events (name);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE public.analytics_events IS
  'First-party product events. Server inserts only (postgres / service_role). No client grants.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.analytics_events FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.analytics_events FROM authenticated;
  END IF;
END $$;
