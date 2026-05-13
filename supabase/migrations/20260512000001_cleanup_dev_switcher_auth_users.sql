-- Миграция Supabase: cleans up anonymous auth users created by the dev role switcher.
-- The dev switcher is useful against a remote Supabase project, but each
-- anonymous sign-in creates a real auth.users row. These helpers let the app
-- dispose of only accounts that were explicitly tagged by the switcher.

create or replace function public.require_dev_seed_admin()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Dev seed requires an authenticated user.';
  end if;

  return current_user_id;
end;
$$;

create or replace function public.cleanup_current_dev_switcher_session()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  is_dev_switcher_user boolean := false;
  is_anonymous_user boolean := false;
begin
  if current_user_id is null then
    return jsonb_build_object('cleaned', false, 'reason', 'no_session');
  end if;

  select
    coalesce((raw_user_meta_data->>'dev_role_switcher')::boolean, false),
    coalesce(is_anonymous, false)
  into is_dev_switcher_user, is_anonymous_user
  from auth.users
  where id = current_user_id;

  if not coalesce(is_dev_switcher_user, false) or not coalesce(is_anonymous_user, false) then
    return jsonb_build_object('cleaned', false, 'reason', 'not_dev_switcher_user');
  end if;

  begin
    perform public.clear_dev_data();
  exception
    when others then
      null;
  end;

  delete from public.um_user_profiles
  where id = current_user_id;

  delete from auth.users
  where id = current_user_id
    and coalesce((raw_user_meta_data->>'dev_role_switcher')::boolean, false)
    and coalesce(is_anonymous, false);

  return jsonb_build_object('cleaned', true, 'userId', current_user_id);
end;
$$;

create or replace function public.purge_stale_dev_switcher_sessions(max_age interval default interval '24 hours')
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
  cutoff interval := greatest(max_age, interval '1 hour');
  candidate_ids uuid[];
  deleted_count int := 0;
begin
  select coalesce(array_agg(id), array[]::uuid[])
  into candidate_ids
  from auth.users
  where id <> current_user_id
    and coalesce((raw_user_meta_data->>'dev_role_switcher')::boolean, false)
    and coalesce(is_anonymous, false)
    and created_at < now() - cutoff;

  if cardinality(candidate_ids) = 0 then
    return jsonb_build_object('deleted', 0, 'maxAge', cutoff::text);
  end if;

  delete from public.um_user_profiles
  where id = any(candidate_ids);

  delete from auth.users
  where id = any(candidate_ids)
    and coalesce((raw_user_meta_data->>'dev_role_switcher')::boolean, false)
    and coalesce(is_anonymous, false);

  get diagnostics deleted_count = row_count;

  return jsonb_build_object('deleted', deleted_count, 'maxAge', cutoff::text);
end;
$$;

grant execute on function public.cleanup_current_dev_switcher_session() to authenticated;
grant execute on function public.purge_stale_dev_switcher_sessions(interval) to authenticated;
grant execute on function public.require_dev_seed_admin() to authenticated;
