-- FitConnect seed data (run after migrations)
-- Demo users align with demo auth: Athlete, Coach, Admin

insert into public.profiles (id, email, full_name, role)
values
  ('00000000-0000-4000-8000-000000000001', 'ines@fitconnect.local', 'Inês M.', 'athlete'),
  ('00000000-0000-4000-8000-000000000002', 'tomas@fitconnect.local', 'Tomás Ribeiro', 'coach'),
  ('00000000-0000-4000-8000-000000000003', 'admin@fitconnect.local', 'Admin', 'admin')
on conflict do nothing;
