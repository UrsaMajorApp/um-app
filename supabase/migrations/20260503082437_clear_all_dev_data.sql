-- Миграция Supabase: применяет изменение схемы или seed-данных для clear all dev data.
-- Clear populated dev data across every active dev-data session.
-- The regular clear_dev_data() only restores the current user's snapshot and
-- keeps shared rows around while colleagues still have the toggle enabled.

create or replace function public.clear_all_dev_user_seed_rows()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  delete from public.youth_goal_steps where goal_id in (
    '70000000-0000-4000-a000-000000001201',
    '70000000-0000-4000-a000-000000001202'
  );

  delete from public.user_achievements
  where achievement_id in (
    '70000000-0000-4000-a000-000000001301',
    '70000000-0000-4000-a000-000000001302',
    '70000000-0000-4000-a000-000000001303'
  );

  delete from public.youth_goals where id in (
    '70000000-0000-4000-a000-000000001201',
    '70000000-0000-4000-a000-000000001202'
  );

  delete from public.student_tasks where id in (
    '70000000-0000-4000-a000-000000001101',
    '70000000-0000-4000-a000-000000001102',
    '70000000-0000-4000-a000-000000001103'
  );

  delete from public.child_profiles
  where id in (
    '70000000-0000-4000-a000-000000001401',
    '70000000-0000-4000-a000-000000001402'
  );

  delete from public.parent_profiles
  where user_id in (select user_id from public.dev_data_snapshots)
    or (
      first_name = '[DEV] Dana'
      and last_name = 'Saparova'
      and phone = '+77010000000'
    );
end;
$$;

create or replace function public.clear_all_dev_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  shared_payload jsonb;
  snapshot_count int := 0;
  restored_count int := 0;
  snapshot_record record;
begin
  perform public.require_dev_seed_admin();

  select count(*)
  into snapshot_count
  from public.dev_data_snapshots;

  select snapshot
  into shared_payload
  from public.dev_data_snapshots
  order by created_at asc, user_id asc
  limit 1;

  perform public.clear_all_dev_user_seed_rows();
  perform public.delete_dev_shared_seed_rows();

  if shared_payload is not null then
    perform public.restore_dev_data_snapshot(shared_payload);
  end if;

  for snapshot_record in
    select snapshot
    from public.dev_data_snapshots
    order by created_at asc, user_id asc
  loop
    perform public.restore_dev_user_data_snapshot(snapshot_record.snapshot);
    restored_count := restored_count + 1;
  end loop;

  delete from public.dev_data_snapshots;

  return jsonb_build_object(
    'seeded', false,
    'clearedAll', true,
    'snapshotCount', snapshot_count,
    'restoredSnapshots', restored_count
  );
end;
$$;

grant execute on function public.clear_all_dev_user_seed_rows() to authenticated;
grant execute on function public.clear_all_dev_data() to authenticated;
