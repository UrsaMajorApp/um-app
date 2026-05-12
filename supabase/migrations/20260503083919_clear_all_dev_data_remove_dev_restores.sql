-- Миграция Supabase: применяет изменение схемы или seed-данных для clear all dev data remove dev restores.
-- Older snapshots may already contain populated [DEV] rows if a developer
-- enabled the toggle before snapshot support was fixed. Clear-all should remove
-- those restored dev rows too.

create or replace function public.delete_dev_named_seed_rows()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  delete from public.messages
  where conversation_id = '70000000-0000-4000-a000-000000000601'
    or body like '[DEV]%';

  delete from public.conversation_participants
  where conversation_id in (
    select id
    from public.conversations
    where id = '70000000-0000-4000-a000-000000000601'
      or name like '[DEV]%'
  );

  delete from public.conversations
  where id = '70000000-0000-4000-a000-000000000601'
    or name like '[DEV]%';

  delete from public.course_reviews
  where id in (
    '70000000-0000-4000-a000-000000000901',
    '70000000-0000-4000-a000-000000000902'
  )
    or author_display_name like '[DEV]%'
    or body like '[DEV]%';

  delete from public.wallet_transactions
  where id in (
    '70000000-0000-4000-a000-000000000701',
    '70000000-0000-4000-a000-000000000702',
    '70000000-0000-4000-a000-000000000703',
    '70000000-0000-4000-a000-000000000704'
  )
    or description like '[DEV]%'
    or student_name like '[DEV]%';

  delete from public.org_applications
  where id in (
    '70000000-0000-4000-a000-000000001001',
    '70000000-0000-4000-a000-000000001002',
    '70000000-0000-4000-a000-000000001003'
  )
    or child_name like '[DEV]%'
    or parent_name like '[DEV]%'
    or club like '[DEV]%'
    or group_name like '[DEV]%';

  delete from public.trial_lesson_slots
  where id in (
    '70000000-0000-4000-a000-000000000801',
    '70000000-0000-4000-a000-000000000802',
    '70000000-0000-4000-a000-000000000803'
  );

  delete from public.org_courses
  where id in (
    '70000000-0000-4000-a000-000000000101',
    '70000000-0000-4000-a000-000000000102'
  )
    or title like '[DEV]%';

  delete from public.organizations
  where id = '70000000-0000-4000-a000-000000000001'
    or name like '[DEV]%';
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

  perform public.delete_dev_named_seed_rows();

  delete from public.dev_data_snapshots
  where true;

  return jsonb_build_object(
    'seeded', false,
    'clearedAll', true,
    'snapshotCount', snapshot_count,
    'restoredSnapshots', restored_count
  );
end;
$$;

grant execute on function public.delete_dev_named_seed_rows() to authenticated;
grant execute on function public.clear_all_dev_data() to authenticated;
