-- Миграция Supabase: применяет изменение схемы или seed-данных для clear all dev data safe delete.
-- pg_safeupdate rejects DELETE statements without a WHERE clause.

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

grant execute on function public.clear_all_dev_data() to authenticated;
