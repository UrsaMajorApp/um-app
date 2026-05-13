-- Миграция Supabase: применяет изменение схемы или seed-данных для dev seed toggle functions.
-- Dev-only seed helpers used by the in-app developer switcher.
-- Rows are deterministic and removable by ID, so turning the toggle off only
-- deletes records created by this seed.

create or replace function public.require_dev_seed_admin()
returns uuid
language plpgsql
security definer
set search_path = public
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

create or replace function public.clear_dev_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
begin
  delete from public.teacher_attendance_entries
  where id in (
    '70000000-0000-4000-a000-000000000501',
    '70000000-0000-4000-a000-000000000502',
    '70000000-0000-4000-a000-000000000503',
    '70000000-0000-4000-a000-000000000504'
  );

  delete from public.teacher_group_students
  where id in (
    '70000000-0000-4000-a000-000000000401',
    '70000000-0000-4000-a000-000000000402',
    '70000000-0000-4000-a000-000000000403'
  );

  delete from public.teacher_groups
  where id in (
    '70000000-0000-4000-a000-000000000301'
  );

  delete from public.messages
  where conversation_id in (
    '70000000-0000-4000-a000-000000000601'
  );

  delete from public.conversation_participants
  where conversation_id in (
    '70000000-0000-4000-a000-000000000601'
  );

  delete from public.conversations
  where id in (
    '70000000-0000-4000-a000-000000000601'
  );

  delete from public.wallet_transactions
  where id in (
    '70000000-0000-4000-a000-000000000701',
    '70000000-0000-4000-a000-000000000702',
    '70000000-0000-4000-a000-000000000703',
    '70000000-0000-4000-a000-000000000704'
  );

  delete from public.trial_lesson_slots
  where id in (
    '70000000-0000-4000-a000-000000000801',
    '70000000-0000-4000-a000-000000000802',
    '70000000-0000-4000-a000-000000000803'
  );

  delete from public.course_reviews
  where id in (
    '70000000-0000-4000-a000-000000000901',
    '70000000-0000-4000-a000-000000000902'
  );

  delete from public.org_applications
  where id in (
    '70000000-0000-4000-a000-000000001001',
    '70000000-0000-4000-a000-000000001002',
    '70000000-0000-4000-a000-000000001003'
  );

  delete from public.org_courses
  where id in (
    '70000000-0000-4000-a000-000000000101',
    '70000000-0000-4000-a000-000000000102'
  );

  delete from public.organizations
  where id = '70000000-0000-4000-a000-000000000001'
    and owner_user_id = current_user_id;

  return jsonb_build_object('seeded', false);
end;
$$;

create or replace function public.seed_dev_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
begin
  perform public.clear_dev_data();

  insert into public.organizations (
    id, owner_user_id, name, category, description, status, rating, active_students, commission_pct
  )
  values (
    '70000000-0000-4000-a000-000000000001',
    current_user_id,
    '[DEV] Ursa Major Academy',
    'Технологии',
    'Seeded organization for local development and demo flows.',
    'verified',
    4.85,
    18,
    12.00
  )
  on conflict (id) do update set
    owner_user_id = excluded.owner_user_id,
    name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    status = excluded.status,
    rating = excluded.rating,
    active_students = excluded.active_students,
    commission_pct = excluded.commission_pct;

  insert into public.org_courses (
    id, org_id, title, description, level, price, icon, skills, status, age_min, age_max
  )
  values
    (
      '70000000-0000-4000-a000-000000000101',
      '70000000-0000-4000-a000-000000000001',
      '[DEV] Robotics Lab',
      'Build small robots, sensors, and logic skills through weekly challenges.',
      'beginner',
      32000,
      'cpu',
      array['логика', 'робототехника', 'командная работа'],
      'active',
      9,
      14
    ),
    (
      '70000000-0000-4000-a000-000000000102',
      '70000000-0000-4000-a000-000000000001',
      '[DEV] Creative Coding',
      'Make games and interactive stories while learning programming basics.',
      'intermediate',
      28000,
      'code',
      array['креативность', 'логика', 'дизайн'],
      'active',
      11,
      16
    )
  on conflict (id) do update set
    org_id = excluded.org_id,
    title = excluded.title,
    description = excluded.description,
    level = excluded.level,
    price = excluded.price,
    icon = excluded.icon,
    skills = excluded.skills,
    status = excluded.status,
    age_min = excluded.age_min,
    age_max = excluded.age_max,
    updated_at = now();

  insert into public.trial_lesson_slots (
    id, course_id, org_id, day_label, time_label, active, display_order
  )
  values
    (
      '70000000-0000-4000-a000-000000000801',
      '70000000-0000-4000-a000-000000000101',
      '70000000-0000-4000-a000-000000000001',
      'Понедельник',
      '16:00',
      true,
      1
    ),
    (
      '70000000-0000-4000-a000-000000000802',
      '70000000-0000-4000-a000-000000000101',
      '70000000-0000-4000-a000-000000000001',
      'Среда',
      '18:00',
      true,
      2
    ),
    (
      '70000000-0000-4000-a000-000000000803',
      '70000000-0000-4000-a000-000000000102',
      '70000000-0000-4000-a000-000000000001',
      'Суббота',
      '11:00',
      true,
      3
    )
  on conflict (id) do update set
    course_id = excluded.course_id,
    org_id = excluded.org_id,
    day_label = excluded.day_label,
    time_label = excluded.time_label,
    active = excluded.active,
    display_order = excluded.display_order;

  insert into public.course_reviews (
    id, course_id, author_user_id, author_display_name, rating, body, status
  )
  values
    (
      '70000000-0000-4000-a000-000000000901',
      '70000000-0000-4000-a000-000000000101',
      current_user_id,
      '[DEV] Aigerim',
      5,
      'My child came home explaining sensors after the second lesson.',
      'published'
    ),
    (
      '70000000-0000-4000-a000-000000000902',
      '70000000-0000-4000-a000-000000000102',
      current_user_id,
      '[DEV] Timur',
      5,
      'A warm format for learning code without turning it into homework.',
      'published'
    )
  on conflict (id) do update set
    course_id = excluded.course_id,
    author_user_id = excluded.author_user_id,
    author_display_name = excluded.author_display_name,
    rating = excluded.rating,
    body = excluded.body,
    status = excluded.status;

  insert into public.org_applications (
    id, org_id, child_name, child_age, parent_name, club, applied_date, status,
    parent_user_id, group_name, group_schedule
  )
  values
    (
      '70000000-0000-4000-a000-000000001001',
      '70000000-0000-4000-a000-000000000001',
      '[DEV] Amina',
      10,
      '[DEV] Dana',
      '[DEV] Robotics Lab',
      '2 May 2026',
      'paid',
      current_user_id,
      '[DEV] Group R-1',
      'Mon, Wed 16:00'
    ),
    (
      '70000000-0000-4000-a000-000000001002',
      '70000000-0000-4000-a000-000000000001',
      '[DEV] Arman',
      12,
      '[DEV] Marat',
      '[DEV] Creative Coding',
      '2 May 2026',
      'activated',
      current_user_id,
      '[DEV] Group C-2',
      'Sat 11:00'
    ),
    (
      '70000000-0000-4000-a000-000000001003',
      '70000000-0000-4000-a000-000000000001',
      '[DEV] Lina',
      9,
      '[DEV] Asem',
      '[DEV] Robotics Lab',
      '2 May 2026',
      'awaiting_payment',
      current_user_id,
      '[DEV] Group R-1',
      'Mon, Wed 16:00'
    )
  on conflict (id) do update set
    org_id = excluded.org_id,
    child_name = excluded.child_name,
    child_age = excluded.child_age,
    parent_name = excluded.parent_name,
    club = excluded.club,
    applied_date = excluded.applied_date,
    status = excluded.status,
    parent_user_id = excluded.parent_user_id,
    group_name = excluded.group_name,
    group_schedule = excluded.group_schedule;

  insert into public.wallet_transactions (
    id, owner_type, owner_user_id, org_id, transaction_at, description,
    student_name, amount_kzt, platform_commission_kzt, status, method
  )
  values
    (
      '70000000-0000-4000-a000-000000000701',
      'org',
      null,
      '70000000-0000-4000-a000-000000000001',
      now() - interval '2 days',
      '[DEV] Robotics Lab enrollment',
      '[DEV] Amina',
      32000,
      3840,
      'completed',
      'Kaspi'
    ),
    (
      '70000000-0000-4000-a000-000000000702',
      'org',
      null,
      '70000000-0000-4000-a000-000000000001',
      now() - interval '1 day',
      '[DEV] Creative Coding enrollment',
      '[DEV] Arman',
      28000,
      3360,
      'completed',
      'Card'
    ),
    (
      '70000000-0000-4000-a000-000000000703',
      'mentor',
      current_user_id,
      null,
      now() - interval '3 days',
      '[DEV] Mentor session payout',
      '[DEV] Amina',
      12000,
      1200,
      'completed',
      'Wallet'
    ),
    (
      '70000000-0000-4000-a000-000000000704',
      'mentor',
      current_user_id,
      null,
      now() - interval '5 hours',
      '[DEV] Group review payout',
      '[DEV] Arman',
      9000,
      900,
      'pending',
      'Wallet'
    )
  on conflict (id) do update set
    owner_type = excluded.owner_type,
    owner_user_id = excluded.owner_user_id,
    org_id = excluded.org_id,
    transaction_at = excluded.transaction_at,
    description = excluded.description,
    student_name = excluded.student_name,
    amount_kzt = excluded.amount_kzt,
    platform_commission_kzt = excluded.platform_commission_kzt,
    status = excluded.status,
    method = excluded.method;

  insert into public.teacher_groups (
    id, teacher_user_id, org_group_id, name, course_title, schedule, capacity, active
  )
  values (
    '70000000-0000-4000-a000-000000000301',
    current_user_id,
    null,
    '[DEV] Group R-1',
    '[DEV] Robotics Lab',
    'Mon, Wed 16:00',
    12,
    true
  )
  on conflict (id) do update set
    teacher_user_id = excluded.teacher_user_id,
    org_group_id = excluded.org_group_id,
    name = excluded.name,
    course_title = excluded.course_title,
    schedule = excluded.schedule,
    capacity = excluded.capacity,
    active = excluded.active;

  insert into public.teacher_group_students (
    id, group_id, student_user_id, student_name, student_age, status_label
  )
  values
    (
      '70000000-0000-4000-a000-000000000401',
      '70000000-0000-4000-a000-000000000301',
      null,
      '[DEV] Amina',
      10,
      'active'
    ),
    (
      '70000000-0000-4000-a000-000000000402',
      '70000000-0000-4000-a000-000000000301',
      null,
      '[DEV] Lina',
      9,
      'trial'
    ),
    (
      '70000000-0000-4000-a000-000000000403',
      '70000000-0000-4000-a000-000000000301',
      null,
      '[DEV] Arman',
      12,
      'active'
    )
  on conflict (id) do update set
    group_id = excluded.group_id,
    student_user_id = excluded.student_user_id,
    student_name = excluded.student_name,
    student_age = excluded.student_age,
    status_label = excluded.status_label;

  insert into public.teacher_attendance_entries (
    id, group_id, student_id, class_date, status, comment, created_by
  )
  values
    (
      '70000000-0000-4000-a000-000000000501',
      '70000000-0000-4000-a000-000000000301',
      '70000000-0000-4000-a000-000000000401',
      current_date,
      'present',
      '[DEV] Built first sensor circuit',
      current_user_id
    ),
    (
      '70000000-0000-4000-a000-000000000502',
      '70000000-0000-4000-a000-000000000301',
      '70000000-0000-4000-a000-000000000402',
      current_date,
      'absent',
      '[DEV] Parent warned in advance',
      current_user_id
    ),
    (
      '70000000-0000-4000-a000-000000000503',
      '70000000-0000-4000-a000-000000000301',
      '70000000-0000-4000-a000-000000000403',
      current_date,
      'present',
      '[DEV] Helped another student debug',
      current_user_id
    ),
    (
      '70000000-0000-4000-a000-000000000504',
      '70000000-0000-4000-a000-000000000301',
      '70000000-0000-4000-a000-000000000401',
      current_date - 2,
      'present',
      '[DEV] Completed warm-up task',
      current_user_id
    )
  on conflict (group_id, student_id, class_date) do update set
    status = excluded.status,
    comment = excluded.comment,
    created_by = excluded.created_by,
    updated_at = now();

  insert into public.conversations (
    id, name, icon_name, type, last_message, last_message_at, archived
  )
  values (
    '70000000-0000-4000-a000-000000000601',
    '[DEV] Parent and mentor',
    'message-circle',
    'direct',
    '[DEV] Next session confirmed for Wednesday.',
    now(),
    false
  )
  on conflict (id) do update set
    name = excluded.name,
    icon_name = excluded.icon_name,
    type = excluded.type,
    last_message = excluded.last_message,
    last_message_at = excluded.last_message_at,
    archived = excluded.archived;

  insert into public.conversation_participants (
    conversation_id, user_id, unread_count
  )
  values (
    '70000000-0000-4000-a000-000000000601',
    current_user_id,
    1
  )
  on conflict (conversation_id, user_id) do update set
    unread_count = excluded.unread_count;

  insert into public.messages (
    id, conversation_id, sender_id, body, created_at
  )
  values
    (
      '70000000-0000-4000-a000-000000000611',
      '70000000-0000-4000-a000-000000000601',
      current_user_id,
      '[DEV] Amina did well with the sensor task today.',
      now() - interval '20 minutes'
    ),
    (
      '70000000-0000-4000-a000-000000000612',
      '70000000-0000-4000-a000-000000000601',
      current_user_id,
      '[DEV] Next session confirmed for Wednesday.',
      now() - interval '5 minutes'
    )
  on conflict (id) do update set
    conversation_id = excluded.conversation_id,
    sender_id = excluded.sender_id,
    body = excluded.body,
    created_at = excluded.created_at;

  return jsonb_build_object('seeded', true);
end;
$$;

create or replace function public.is_dev_data_seeded()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizations
    where id = '70000000-0000-4000-a000-000000000001'
  );
$$;

grant execute on function public.require_dev_seed_admin() to authenticated;
grant execute on function public.seed_dev_data() to authenticated;
grant execute on function public.clear_dev_data() to authenticated;
grant execute on function public.is_dev_data_seeded() to authenticated;
