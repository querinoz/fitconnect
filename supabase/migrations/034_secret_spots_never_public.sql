-- 034: secret training spots are never auto-exposed on the public/approximate surface.
-- Exact coordinates stay owner-only (033). is_secret rows stay off the public view.

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
  AND moderation_state IN ('PENDING_REVIEW', 'COMMUNITY_VERIFIED', 'VERIFIED')
  AND is_secret IS NOT TRUE;

COMMENT ON VIEW public.training_spots_public IS
  'Public/approximate spots only. Secret spots never appear. exact_lat/exact_lng always null.';
