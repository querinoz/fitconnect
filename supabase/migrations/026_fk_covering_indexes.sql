-- 026_fk_covering_indexes.sql
-- Additive. Covering indexes for foreign keys reported by the Supabase performance
-- linter (0001_unindexed_foreign_keys) on tables that belong to the CURRENT
-- architecture: the strength/workout engine (017/018), spots and distribution
-- (021), and badges (014).
--
-- Deliberately NOT indexed here: the foreign keys on public.sessions,
-- public.programs, public.program_enrollments, public.readiness_scores,
-- public.hrv_readings, public.push_tokens, public.notifications, public.reviews
-- and public.athlete_profiles. Those tables come from migrations 002-010, carry
-- RLS with zero policies (deny-all for every client role), and are pending the
-- legacy-schema decision. Indexing tables that may be dropped adds maintenance
-- cost for no query benefit -- see AUTONOMOUS_MASTER_TODO.md (legacy schema).
--
-- Plain CREATE INDEX (not CONCURRENTLY) because these tables are small and the
-- migration runner applies each file in a single transaction.

--;;
create index if not exists progression_states_exercise_id_idx
  on public.progression_states (exercise_id);

--;;
create index if not exists routine_exercises_exercise_id_idx
  on public.routine_exercises (exercise_id);

--;;
create index if not exists routine_exercises_routine_id_idx
  on public.routine_exercises (routine_id);

--;;
create index if not exists strength_sessions_activity_id_idx
  on public.strength_sessions (activity_id);

--;;
create index if not exists strength_sessions_occurrence_id_idx
  on public.strength_sessions (occurrence_id);

--;;
create index if not exists strength_sets_exercise_id_idx
  on public.strength_sets (exercise_id);

--;;
create index if not exists training_routines_plan_id_idx
  on public.training_routines (plan_id);

--;;
create index if not exists workout_occurrences_routine_id_idx
  on public.workout_occurrences (routine_id);

--;;
create index if not exists training_spot_audit_spot_id_idx
  on public.training_spot_audit (spot_id);

--;;
create index if not exists training_spot_reports_spot_id_idx
  on public.training_spot_reports (spot_id);

--;;
create index if not exists user_badges_badge_id_idx
  on public.user_badges (badge_id);
