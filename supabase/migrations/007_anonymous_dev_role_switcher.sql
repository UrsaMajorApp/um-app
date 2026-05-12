-- Миграция Supabase: применяет изменение схемы или seed-данных для anonymous dev role switcher.
-- Allow dev anonymous sessions to create the matching app profile row.
-- Supabase anonymous users still use auth.role() = 'authenticated', so this
-- lets the dev role switcher participate in auth.uid()-based RLS paths.

alter table public.um_user_profiles enable row level security;

drop policy if exists "self_insert_own_profile" on public.um_user_profiles;
create policy "self_insert_own_profile" on public.um_user_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "self_update_own_profile" on public.um_user_profiles;
create policy "self_update_own_profile" on public.um_user_profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
