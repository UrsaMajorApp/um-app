-- Миграция Supabase: reverts the temporary dev switcher auth cleanup helpers.
-- Keeps migration history intact while restoring the previous dev seed guard.

drop function if exists public.cleanup_current_dev_switcher_session();
drop function if exists public.purge_stale_dev_switcher_sessions(interval);

create or replace function public.require_dev_seed_admin()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  is_dev_switcher_user boolean := false;
begin
  if current_user_id is null then
    raise exception 'Dev seed requires an authenticated user.';
  end if;

  select coalesce((raw_user_meta_data->>'dev_role_switcher')::boolean, false)
  into is_dev_switcher_user
  from auth.users
  where id = current_user_id;

  if is_dev_switcher_user then
    return current_user_id;
  end if;

  if not exists (
    select 1
    from public.um_user_profiles
    where id = current_user_id
      and role = 'admin'
  ) then
    raise exception 'Dev seed requires a dev-switcher session or the admin role.';
  end if;

  return current_user_id;
end;
$$;

grant execute on function public.require_dev_seed_admin() to authenticated;
