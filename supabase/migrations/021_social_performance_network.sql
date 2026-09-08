-- 021_social_performance_network.sql
-- Spots / Secret Spots + outbound distribution jobs.
-- FitConnect remains SoT; Zapier/social are distribution only.
-- Strava-originated content remains non-social (see 020).

CREATE TABLE IF NOT EXISTS public.training_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sport_key text NOT NULL,
  description text NOT NULL DEFAULT '',
  exact_lat double precision,
  exact_lng double precision,
  approx_lat double precision NOT NULL,
  approx_lng double precision NOT NULL,
  blur_radius_m double precision NOT NULL DEFAULT 400,
  visibility text NOT NULL CHECK (visibility IN ('PUBLIC','APPROXIMATE','FOLLOWERS_ONLY','PRIVATE','INVITE_ONLY')),
  access_status text NOT NULL CHECK (access_status IN ('PUBLIC','PRIVATE','PERMISSION_REQUIRED','UNKNOWN','RESTRICTED')),
  difficulty text NOT NULL CHECK (difficulty IN ('BEGINNER','EASY','INTERMEDIATE','ADVANCED','EXPERT')),
  risk text NOT NULL CHECK (risk IN ('LOW','MODERATE','HIGH','VERY_HIGH','EXTREME')),
  risk_confidence double precision NOT NULL DEFAULT 0.35,
  reports_count int NOT NULL DEFAULT 0,
  last_verified_at timestamptz,
  creator_id text NOT NULL,
  is_secret boolean NOT NULL DEFAULT false,
  moderation_state text NOT NULL DEFAULT 'PENDING_REVIEW'
    CHECK (moderation_state IN ('PENDING_REVIEW','COMMUNITY_VERIFIED','VERIFIED','DISPUTED','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS training_spots_approx_idx ON public.training_spots (approx_lat, approx_lng);
CREATE INDEX IF NOT EXISTS training_spots_sport_idx ON public.training_spots (sport_key);

CREATE TABLE IF NOT EXISTS public.training_spot_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES public.training_spots(id) ON DELETE CASCADE,
  reporter_id text NOT NULL,
  reason text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_spot_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES public.training_spots(id) ON DELETE CASCADE,
  actor_id text NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_distribution_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  author_id text NOT NULL,
  platform text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('QUEUED','PROCESSING','PUBLISHED','FAILED','RETRY')),
  attempt int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  last_error text,
  external_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_distribution_post_idx ON public.post_distribution_jobs (post_id);
CREATE INDEX IF NOT EXISTS post_distribution_status_idx ON public.post_distribution_jobs (status);

CREATE TABLE IF NOT EXISTS public.user_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  when_event text NOT NULL,
  create_fitconnect_post boolean NOT NULL DEFAULT false,
  distribute_platforms text[] NOT NULL DEFAULT '{}',
  include_music_metadata boolean NOT NULL DEFAULT false,
  include_approximate_location boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_automation_user_idx ON public.user_automation_rules (user_id);

ALTER TABLE public.training_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_spot_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_spot_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_distribution_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_automation_rules ENABLE ROW LEVEL SECURITY;

-- Exact coordinates: never select for anonymous; app layer redacts further.
CREATE POLICY training_spots_read_approx ON public.training_spots
  FOR SELECT USING (
    visibility IN ('PUBLIC','APPROXIMATE')
    OR creator_id = auth.uid()::text
  );

CREATE POLICY training_spots_insert_own ON public.training_spots
  FOR INSERT WITH CHECK (creator_id = auth.uid()::text);

CREATE POLICY distribution_jobs_own ON public.post_distribution_jobs
  FOR ALL USING (author_id = auth.uid()::text)
  WITH CHECK (author_id = auth.uid()::text);

CREATE POLICY automation_rules_own ON public.user_automation_rules
  FOR ALL USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);
