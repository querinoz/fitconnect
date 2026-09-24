-- 037: Sports Intelligence Map — extend training_spots without breaking 021/033/034.
-- No PostGIS required (haversine SQL helpers). Keep exact coords owner-only via views.
-- Do not modify migration 016.

ALTER TABLE public.training_spots
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS spot_kind text NOT NULL DEFAULT 'STANDARD'
    CHECK (spot_kind IN ('STANDARD', 'MASTER', 'SECRET')),
  ADD COLUMN IF NOT EXISTS certification_status text NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (certification_status IN ('UNVERIFIED', 'COMMUNITY', 'MASTER')),
  ADD COLUMN IF NOT EXISTS skill_level text
    CHECK (skill_level IS NULL OR skill_level IN ('BEGINNER', 'AMATEUR', 'ADVANCED', 'PROFESSIONAL')),
  ADD COLUMN IF NOT EXISTS surface text,
  ADD COLUMN IF NOT EXISTS equipment text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS training_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS facilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS weather_sensitivity text,
  ADD COLUMN IF NOT EXISTS best_time text,
  ADD COLUMN IF NOT EXISTS crowd_level text,
  ADD COLUMN IF NOT EXISTS parking text,
  ADD COLUMN IF NOT EXISTS public_transport text,
  ADD COLUMN IF NOT EXISTS safety_notes text,
  ADD COLUMN IF NOT EXISTS permission_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_warning text,
  ADD COLUMN IF NOT EXISTS landowner_restriction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS opening_hours jsonb,
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS rating_avg double precision,
  ADD COLUMN IF NOT EXISTS review_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photo_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exact_location_visibility text NOT NULL DEFAULT 'OWNER_ONLY'
    CHECK (exact_location_visibility IN ('OWNER_ONLY', 'MEMBERS', 'VERIFIED_USERS', 'PUBLIC_APPROXIMATION'));

-- Backfill spot_kind / certification from existing flags (idempotent).
UPDATE public.training_spots
SET
  spot_kind = CASE
    WHEN is_secret IS TRUE THEN 'SECRET'
    WHEN moderation_state = 'VERIFIED' THEN 'MASTER'
    ELSE 'STANDARD'
  END,
  certification_status = CASE
    WHEN moderation_state = 'VERIFIED' THEN 'MASTER'
    WHEN moderation_state = 'COMMUNITY_VERIFIED' THEN 'COMMUNITY'
    ELSE 'UNVERIFIED'
  END,
  skill_level = CASE difficulty
    WHEN 'BEGINNER' THEN 'BEGINNER'
    WHEN 'EASY' THEN 'AMATEUR'
    WHEN 'INTERMEDIATE' THEN 'AMATEUR'
    WHEN 'ADVANCED' THEN 'ADVANCED'
    WHEN 'EXPERT' THEN 'PROFESSIONAL'
    ELSE NULL
  END,
  verified_at = COALESCE(verified_at, last_verified_at)
WHERE TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS training_spots_slug_uidx
  ON public.training_spots (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS training_spots_kind_idx ON public.training_spots (spot_kind);
CREATE INDEX IF NOT EXISTS training_spots_cert_idx ON public.training_spots (certification_status);
CREATE INDEX IF NOT EXISTS training_spots_skill_idx ON public.training_spots (skill_level);
CREATE INDEX IF NOT EXISTS training_spots_visibility_idx ON public.training_spots (visibility);
CREATE INDEX IF NOT EXISTS training_spots_bbox_idx ON public.training_spots (approx_lat, approx_lng, sport_key);

-- Haversine distance in meters (WGS84). Prefer this until PostGIS is enabled.
CREATE OR REPLACE FUNCTION public.fc_haversine_m(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
) RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN NULL
    ELSE (
      2 * 6371000 * asin(
        sqrt(
          power(sin(radians(lat2 - lat1) / 2), 2)
          + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
        )
      )
    )
  END;
$$;

COMMENT ON FUNCTION public.fc_haversine_m IS
  'FitConnect Sports Intelligence — great-circle distance meters. PostGIS optional later.';

-- Public view: never exact coords; never secrets; expose intelligence columns safely.
CREATE OR REPLACE VIEW public.training_spots_public AS
SELECT
  id,
  name,
  slug,
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
  skill_level,
  spot_kind,
  certification_status,
  risk,
  risk_confidence,
  reports_count,
  last_verified_at,
  verified_by,
  verified_at,
  creator_id,
  is_secret,
  moderation_state,
  region,
  country,
  surface,
  equipment,
  training_types,
  facilities,
  weather_sensitivity,
  best_time,
  crowd_level,
  parking,
  public_transport,
  safety_notes,
  permission_required,
  access_warning,
  landowner_restriction,
  opening_hours,
  rating_avg,
  review_count,
  photo_count,
  exact_location_visibility,
  created_at,
  updated_at
FROM public.training_spots
WHERE visibility IN ('PUBLIC', 'APPROXIMATE')
  AND moderation_state IN ('PENDING_REVIEW', 'COMMUNITY_VERIFIED', 'VERIFIED')
  AND is_secret IS NOT TRUE
  AND spot_kind <> 'SECRET';

COMMENT ON VIEW public.training_spots_public IS
  'Sports Intelligence public surface. Secrets never appear. exact_lat/exact_lng always null.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    GRANT SELECT ON public.training_spots_public TO anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT ON public.training_spots_public TO authenticated;
  END IF;
END $$;

-- Owners may update their own non-certification fields (Master cannot be self-asserted).
DROP POLICY IF EXISTS training_spots_update_own ON public.training_spots;
CREATE POLICY training_spots_update_own
  ON public.training_spots
  FOR UPDATE
  USING (creator_id = public.firebase_uid())
  WITH CHECK (
    creator_id = public.firebase_uid()
    AND certification_status IN ('UNVERIFIED', 'COMMUNITY')
  );

COMMENT ON COLUMN public.training_spots.certification_status IS
  'UNVERIFIED → COMMUNITY → MASTER. MASTER requires server/admin verification — never client-asserted.';
COMMENT ON COLUMN public.training_spots.spot_kind IS
  'STANDARD | MASTER | SECRET. SECRET rows never appear on training_spots_public.';
