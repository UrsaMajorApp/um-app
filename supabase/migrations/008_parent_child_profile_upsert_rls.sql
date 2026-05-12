-- Миграция Supabase: применяет изменение схемы или seed-данных для parent child profile upsert rls.
-- Make parent-owned profile upserts work for authenticated users, including
-- anonymous dev-switcher sessions. Upserts need both USING and WITH CHECK so
-- PostgREST can validate inserted or updated rows.

alter table public.parent_profiles enable row level security;
alter table public.child_profiles enable row level security;

drop policy if exists "self_insert_parent_profile" on public.parent_profiles;
create policy "self_insert_parent_profile" on public.parent_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "self_update_parent_profile" on public.parent_profiles;
create policy "self_update_parent_profile" on public.parent_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "parent_write_own_children" on public.child_profiles;
drop policy if exists "parent_insert_own_children" on public.child_profiles;
create policy "parent_insert_own_children" on public.child_profiles
  for insert
  to authenticated
  with check (parent_user_id = auth.uid());

drop policy if exists "parent_update_own_children" on public.child_profiles;
create policy "parent_update_own_children" on public.child_profiles
  for update
  to authenticated
  using (parent_user_id = auth.uid())
  with check (parent_user_id = auth.uid());

drop policy if exists "parent_delete_own_children" on public.child_profiles;
create policy "parent_delete_own_children" on public.child_profiles
  for delete
  to authenticated
  using (parent_user_id = auth.uid());
