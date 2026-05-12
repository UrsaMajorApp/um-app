-- Миграция Supabase: применяет изменение схемы или seed-данных для dev seed active sessions.
-- Keep shared populated-dev rows alive until the last active dev-data session
-- turns the toggle off. Per-user seed rows are still restored for the user who
-- disables the toggle.

create or replace function public.delete_dev_user_seed_rows()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
begin
  delete from public.youth_goal_steps where goal_id in (
    '70000000-0000-4000-a000-000000001201',
    '70000000-0000-4000-a000-000000001202'
  );

  delete from public.user_achievements
  where user_id = current_user_id
    and achievement_id in (
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
  )
  and parent_user_id = current_user_id;

  delete from public.parent_profiles
  where user_id = current_user_id;
end;
$$;

create or replace function public.delete_dev_shared_seed_rows()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  delete from public.teacher_attendance_entries where id in (
    '70000000-0000-4000-a000-000000000501',
    '70000000-0000-4000-a000-000000000502',
    '70000000-0000-4000-a000-000000000503',
    '70000000-0000-4000-a000-000000000504'
  );

  delete from public.teacher_group_students where id in (
    '70000000-0000-4000-a000-000000000401',
    '70000000-0000-4000-a000-000000000402',
    '70000000-0000-4000-a000-000000000403'
  );

  delete from public.teacher_groups
  where id = '70000000-0000-4000-a000-000000000301';

  delete from public.messages
  where conversation_id = '70000000-0000-4000-a000-000000000601';

  delete from public.conversation_participants
  where conversation_id = '70000000-0000-4000-a000-000000000601';

  delete from public.conversations
  where id = '70000000-0000-4000-a000-000000000601';

  delete from public.wallet_transactions where id in (
    '70000000-0000-4000-a000-000000000701',
    '70000000-0000-4000-a000-000000000702',
    '70000000-0000-4000-a000-000000000703',
    '70000000-0000-4000-a000-000000000704'
  );

  delete from public.trial_lesson_slots where id in (
    '70000000-0000-4000-a000-000000000801',
    '70000000-0000-4000-a000-000000000802',
    '70000000-0000-4000-a000-000000000803'
  );

  delete from public.course_reviews where id in (
    '70000000-0000-4000-a000-000000000901',
    '70000000-0000-4000-a000-000000000902'
  );

  delete from public.org_applications where id in (
    '70000000-0000-4000-a000-000000001001',
    '70000000-0000-4000-a000-000000001002',
    '70000000-0000-4000-a000-000000001003'
  );

  delete from public.org_courses where id in (
    '70000000-0000-4000-a000-000000000101',
    '70000000-0000-4000-a000-000000000102'
  );

  delete from public.subscription_plans where id in (
    '70000000-0000-4000-a000-000000000201',
    '70000000-0000-4000-a000-000000000202',
    '70000000-0000-4000-a000-000000000203'
  );

  delete from public.achievements_catalog where id in (
    '70000000-0000-4000-a000-000000001301',
    '70000000-0000-4000-a000-000000001302',
    '70000000-0000-4000-a000-000000001303'
  );

  delete from public.organizations
  where id = '70000000-0000-4000-a000-000000000001';
end;
$$;

create or replace function public.restore_dev_user_data_snapshot(snapshot_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  insert into public.parent_profiles
  select * from jsonb_populate_recordset(null::public.parent_profiles, snapshot_payload->'parent_profiles')
  on conflict (user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    updated_at = excluded.updated_at,
    tariff = excluded.tariff;

  insert into public.child_profiles
  select * from jsonb_populate_recordset(null::public.child_profiles, snapshot_payload->'child_profiles')
  on conflict (id) do update set
    parent_user_id = excluded.parent_user_id,
    name = excluded.name,
    age = excluded.age,
    age_category = excluded.age_category,
    interests = excluded.interests,
    talent_profile = excluded.talent_profile,
    phone = excluded.phone,
    qr_token = excluded.qr_token,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at,
    qr_pin = excluded.qr_pin,
    qr_pin_expires_at = excluded.qr_pin_expires_at,
    qr_pin_one_time_use = excluded.qr_pin_one_time_use;

  insert into public.student_tasks
  select * from jsonb_populate_recordset(null::public.student_tasks, snapshot_payload->'student_tasks')
  on conflict (id) do update set
    student_user_id = excluded.student_user_id,
    title = excluded.title,
    club = excluded.club,
    xp_reward = excluded.xp_reward,
    done = excluded.done,
    created_at = excluded.created_at;

  insert into public.youth_goals
  select * from jsonb_populate_recordset(null::public.youth_goals, snapshot_payload->'youth_goals')
  on conflict (id) do update set
    student_user_id = excluded.student_user_id,
    title = excluded.title,
    progress = excluded.progress,
    color = excluded.color,
    created_at = excluded.created_at;

  insert into public.youth_goal_steps
  select * from jsonb_populate_recordset(null::public.youth_goal_steps, snapshot_payload->'youth_goal_steps')
  on conflict (id) do update set
    goal_id = excluded.goal_id,
    text = excluded.text,
    done = excluded.done,
    step_order = excluded.step_order;

  insert into public.user_achievements
  select * from jsonb_populate_recordset(null::public.user_achievements, snapshot_payload->'user_achievements')
  on conflict (user_id, achievement_id) do update set
    id = excluded.id,
    unlocked = excluded.unlocked,
    unlocked_at = excluded.unlocked_at;
end;
$$;

create or replace function public.clear_dev_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
  payload jsonb;
  other_active_sessions int := 0;
begin
  select snapshot
  into payload
  from public.dev_data_snapshots
  where user_id = current_user_id;

  select count(*)
  into other_active_sessions
  from public.dev_data_snapshots
  where user_id <> current_user_id;

  perform public.delete_dev_user_seed_rows();

  if payload is not null then
    if other_active_sessions > 0 then
      perform public.restore_dev_user_data_snapshot(payload);
    else
      perform public.delete_dev_shared_seed_rows();
      perform public.restore_dev_data_snapshot(payload);
    end if;

    delete from public.dev_data_snapshots
    where user_id = current_user_id;

    return jsonb_build_object(
      'seeded', false,
      'restored', true,
      'sharedCleared', other_active_sessions = 0,
      'otherActiveSessions', other_active_sessions
    );
  end if;

  if other_active_sessions = 0 then
    perform public.delete_dev_shared_seed_rows();
  end if;

  return jsonb_build_object(
    'seeded', false,
    'restored', false,
    'sharedCleared', other_active_sessions = 0,
    'otherActiveSessions', other_active_sessions
  );
end;
$$;

grant execute on function public.delete_dev_user_seed_rows() to authenticated;
grant execute on function public.delete_dev_shared_seed_rows() to authenticated;
grant execute on function public.restore_dev_user_data_snapshot(jsonb) to authenticated;
grant execute on function public.clear_dev_data() to authenticated;
