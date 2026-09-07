-- 018_workout_wave2.sql
-- Wave 2 session states, set laterality, builtin exercises for guided plan.
-- Does NOT modify migrations 001–017 destructively beyond additive alters.

--;;
insert into public.data_schema_meta (key, value, updated_at)
values ('workout_wave2_schema_version', '018', now())
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;

--;;
alter table public.strength_sessions drop constraint if exists strength_sessions_status_check;

--;;
alter table public.strength_sessions
  add constraint strength_sessions_status_check
  check (status in (
    'IDLE','PREP','ACTIVE','REST','PAUSED','COMPLETING','COMPLETED','FAILED',
    'RECOVERING','SYNC_PENDING','SYNCED','FINISHED','CANCELLED'
  ));

--;;
alter table public.strength_sessions
  add column if not exists idempotency_key text;

--;;
create unique index if not exists strength_sessions_user_idempotency_uidx
  on public.strength_sessions (user_id, idempotency_key)
  where idempotency_key is not null;

--;;
alter table public.strength_sets
  add column if not exists side text
  check (side is null or side in ('LEFT','RIGHT','BOTH','NONE'));

--;;
insert into public.exercises (
  id, user_id, name, category, primary_muscles, secondary_muscles, equipment,
  mode, side_aware, weighted, is_custom, source
) values
  ('ex_bench_press', null, 'Barbell bench press', 'strength', array['chest'], array['triceps','shoulders'], array['barbell'], 'REPS', false, true, false, 'builtin'),
  ('ex_dumbbell_row', null, 'Dumbbell row', 'strength', array['back'], array['biceps'], array['dumbbell'], 'REPS', false, true, false, 'builtin'),
  ('ex_push_up', null, 'Push-up', 'strength', array['chest'], array['triceps','shoulders'], array['bodyweight'], 'BODYWEIGHT', false, false, false, 'builtin'),
  ('ex_reverse_lunge', null, 'Reverse lunge', 'strength', array['quads','glutes'], array['hamstrings'], array['dumbbell'], 'REPS', true, true, false, 'builtin'),
  ('ex_plank', null, 'Plank', 'strength', array['core'], array[]::text[], array['bodyweight'], 'TIME', false, false, false, 'builtin'),
  ('ex_jump_rope', null, 'Jump rope', 'cardio', array['calves'], array['shoulders'], array['rope'], 'DURATION_SPEED', false, false, false, 'builtin')
on conflict (id) do nothing;
