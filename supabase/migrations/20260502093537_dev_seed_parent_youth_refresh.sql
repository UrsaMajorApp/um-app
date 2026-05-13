-- Миграция Supabase: применяет изменение схемы или seed-данных для dev seed parent youth refresh.
-- Expand populated dev data beyond org/teacher flows, and allow any
-- anonymous dev-switcher session to run the toggle instead of requiring the
-- in-app role to be admin.

create table if not exists public.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid references public.um_user_profiles(id) on delete cascade,
  title text not null,
  club text,
  xp_reward int default 50,
  done boolean default false,
  created_at timestamptz default now()
);
alter table public.student_tasks enable row level security;
drop policy if exists "student owns tasks" on public.student_tasks;
create policy "student owns tasks" on public.student_tasks
  for all using (student_user_id = auth.uid() or public.is_admin())
  with check (student_user_id = auth.uid() or public.is_admin());

create table if not exists public.youth_goals (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid references public.um_user_profiles(id) on delete cascade,
  title text not null,
  progress int not null default 0,
  color text not null default '#6C5CE7',
  created_at timestamptz default now()
);
alter table public.youth_goals enable row level security;
drop policy if exists "student owns goals" on public.youth_goals;
create policy "student owns goals" on public.youth_goals
  for all using (student_user_id = auth.uid() or public.is_admin())
  with check (student_user_id = auth.uid() or public.is_admin());

create table if not exists public.youth_goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.youth_goals(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  step_order int not null default 0
);
alter table public.youth_goal_steps enable row level security;
drop policy if exists "student owns goal steps" on public.youth_goal_steps;
create policy "student owns goal steps" on public.youth_goal_steps
  for all using (
    goal_id in (select id from public.youth_goals where student_user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    goal_id in (select id from public.youth_goals where student_user_id = auth.uid())
    or public.is_admin()
  );

create table if not exists public.achievements_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_name text not null default 'award',
  description text
);
alter table public.achievements_catalog enable row level security;
drop policy if exists "anyone reads catalog" on public.achievements_catalog;
create policy "anyone reads catalog" on public.achievements_catalog
  for select using (true);
drop policy if exists "admin manages catalog" on public.achievements_catalog;
create policy "admin manages catalog" on public.achievements_catalog
  for all using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.um_user_profiles(id) on delete cascade,
  achievement_id uuid references public.achievements_catalog(id) on delete cascade,
  unlocked boolean not null default false,
  unlocked_at timestamptz,
  unique(user_id, achievement_id)
);
alter table public.user_achievements enable row level security;
drop policy if exists "user owns achievements" on public.user_achievements;
create policy "user owns achievements" on public.user_achievements
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

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

create or replace function public.dev_seed_snapshot_payload()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
begin
  return jsonb_build_object(
    'parent_profiles',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.parent_profiles t where t.user_id = current_user_id), '[]'::jsonb),
    'child_profiles',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.child_profiles t where t.id in (
        '70000000-0000-4000-a000-000000001401',
        '70000000-0000-4000-a000-000000001402'
      )), '[]'::jsonb),
    'student_tasks',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.student_tasks t where t.id in (
        '70000000-0000-4000-a000-000000001101',
        '70000000-0000-4000-a000-000000001102',
        '70000000-0000-4000-a000-000000001103'
      )), '[]'::jsonb),
    'youth_goals',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.youth_goals t where t.id in (
        '70000000-0000-4000-a000-000000001201',
        '70000000-0000-4000-a000-000000001202'
      )), '[]'::jsonb),
    'youth_goal_steps',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.youth_goal_steps t where t.goal_id in (
        '70000000-0000-4000-a000-000000001201',
        '70000000-0000-4000-a000-000000001202'
      )), '[]'::jsonb),
    'achievements_catalog',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.achievements_catalog t where t.id in (
        '70000000-0000-4000-a000-000000001301',
        '70000000-0000-4000-a000-000000001302',
        '70000000-0000-4000-a000-000000001303'
      )), '[]'::jsonb),
    'user_achievements',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.user_achievements t where t.user_id = current_user_id and t.achievement_id in (
        '70000000-0000-4000-a000-000000001301',
        '70000000-0000-4000-a000-000000001302',
        '70000000-0000-4000-a000-000000001303'
      )), '[]'::jsonb),
    'organizations',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.organizations t where t.id = '70000000-0000-4000-a000-000000000001'), '[]'::jsonb),
    'org_courses',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.org_courses t where t.id in (
        '70000000-0000-4000-a000-000000000101',
        '70000000-0000-4000-a000-000000000102'
      )), '[]'::jsonb),
    'teacher_groups',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.teacher_groups t where t.id = '70000000-0000-4000-a000-000000000301'), '[]'::jsonb),
    'teacher_group_students',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.teacher_group_students t where t.id in (
        '70000000-0000-4000-a000-000000000401',
        '70000000-0000-4000-a000-000000000402',
        '70000000-0000-4000-a000-000000000403'
      )), '[]'::jsonb),
    'teacher_attendance_entries',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.teacher_attendance_entries t where t.id in (
        '70000000-0000-4000-a000-000000000501',
        '70000000-0000-4000-a000-000000000502',
        '70000000-0000-4000-a000-000000000503',
        '70000000-0000-4000-a000-000000000504'
      )), '[]'::jsonb),
    'conversations',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.conversations t where t.id = '70000000-0000-4000-a000-000000000601'), '[]'::jsonb),
    'conversation_participants',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.conversation_participants t where t.conversation_id = '70000000-0000-4000-a000-000000000601'), '[]'::jsonb),
    'messages',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.messages t where t.conversation_id = '70000000-0000-4000-a000-000000000601'), '[]'::jsonb),
    'wallet_transactions',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.wallet_transactions t where t.id in (
        '70000000-0000-4000-a000-000000000701',
        '70000000-0000-4000-a000-000000000702',
        '70000000-0000-4000-a000-000000000703',
        '70000000-0000-4000-a000-000000000704'
      )), '[]'::jsonb),
    'trial_lesson_slots',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.trial_lesson_slots t where t.id in (
        '70000000-0000-4000-a000-000000000801',
        '70000000-0000-4000-a000-000000000802',
        '70000000-0000-4000-a000-000000000803'
      )), '[]'::jsonb),
    'course_reviews',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.course_reviews t where t.id in (
        '70000000-0000-4000-a000-000000000901',
        '70000000-0000-4000-a000-000000000902'
      )), '[]'::jsonb),
    'org_applications',
      coalesce((select jsonb_agg(to_jsonb(t)) from public.org_applications t where t.id in (
        '70000000-0000-4000-a000-000000001001',
        '70000000-0000-4000-a000-000000001002',
        '70000000-0000-4000-a000-000000001003'
      )), '[]'::jsonb)
  );
end;
$$;

create or replace function public.delete_dev_seed_rows()
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
  delete from public.achievements_catalog where id in (
    '70000000-0000-4000-a000-000000001301',
    '70000000-0000-4000-a000-000000001302',
    '70000000-0000-4000-a000-000000001303'
  );
  delete from public.child_profiles where id in ('70000000-0000-4000-a000-000000001401', '70000000-0000-4000-a000-000000001402');
  delete from public.parent_profiles where user_id = current_user_id;

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
  delete from public.teacher_groups where id = '70000000-0000-4000-a000-000000000301';
  delete from public.messages where conversation_id = '70000000-0000-4000-a000-000000000601';
  delete from public.conversation_participants where conversation_id = '70000000-0000-4000-a000-000000000601';
  delete from public.conversations where id = '70000000-0000-4000-a000-000000000601';
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
  delete from public.organizations
  where id = '70000000-0000-4000-a000-000000000001'
    and owner_user_id = current_user_id;
end;
$$;

create or replace function public.restore_dev_data_snapshot(snapshot_payload jsonb)
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

  insert into public.achievements_catalog
  select * from jsonb_populate_recordset(null::public.achievements_catalog, snapshot_payload->'achievements_catalog')
  on conflict (id) do update set
    name = excluded.name,
    icon_name = excluded.icon_name,
    description = excluded.description;

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

  insert into public.organizations
  select * from jsonb_populate_recordset(null::public.organizations, snapshot_payload->'organizations')
  on conflict (id) do update set owner_user_id = excluded.owner_user_id, name = excluded.name, category = excluded.category, description = excluded.description, status = excluded.status, rating = excluded.rating, active_students = excluded.active_students, commission_pct = excluded.commission_pct, created_at = excluded.created_at;

  insert into public.org_courses
  select * from jsonb_populate_recordset(null::public.org_courses, snapshot_payload->'org_courses')
  on conflict (id) do update set org_id = excluded.org_id, title = excluded.title, description = excluded.description, level = excluded.level, price = excluded.price, icon = excluded.icon, skills = excluded.skills, status = excluded.status, age_min = excluded.age_min, age_max = excluded.age_max, created_at = excluded.created_at, updated_at = excluded.updated_at, rejection_reason = excluded.rejection_reason;

  insert into public.teacher_groups
  select * from jsonb_populate_recordset(null::public.teacher_groups, snapshot_payload->'teacher_groups')
  on conflict (id) do update set teacher_user_id = excluded.teacher_user_id, org_group_id = excluded.org_group_id, name = excluded.name, course_title = excluded.course_title, schedule = excluded.schedule, capacity = excluded.capacity, active = excluded.active, created_at = excluded.created_at;

  insert into public.teacher_group_students
  select * from jsonb_populate_recordset(null::public.teacher_group_students, snapshot_payload->'teacher_group_students')
  on conflict (id) do update set group_id = excluded.group_id, student_user_id = excluded.student_user_id, student_name = excluded.student_name, student_age = excluded.student_age, status_label = excluded.status_label, created_at = excluded.created_at;

  insert into public.teacher_attendance_entries
  select * from jsonb_populate_recordset(null::public.teacher_attendance_entries, snapshot_payload->'teacher_attendance_entries')
  on conflict (group_id, student_id, class_date) do update set id = excluded.id, status = excluded.status, comment = excluded.comment, created_by = excluded.created_by, created_at = excluded.created_at, updated_at = excluded.updated_at;

  insert into public.conversations
  select * from jsonb_populate_recordset(null::public.conversations, snapshot_payload->'conversations')
  on conflict (id) do update set name = excluded.name, icon_name = excluded.icon_name, type = excluded.type, last_message = excluded.last_message, last_message_at = excluded.last_message_at, archived = excluded.archived, created_at = excluded.created_at;

  insert into public.conversation_participants
  select * from jsonb_populate_recordset(null::public.conversation_participants, snapshot_payload->'conversation_participants')
  on conflict (conversation_id, user_id) do update set unread_count = excluded.unread_count;

  insert into public.messages
  select * from jsonb_populate_recordset(null::public.messages, snapshot_payload->'messages')
  on conflict (id) do update set conversation_id = excluded.conversation_id, sender_id = excluded.sender_id, body = excluded.body, created_at = excluded.created_at;

  insert into public.wallet_transactions
  select * from jsonb_populate_recordset(null::public.wallet_transactions, snapshot_payload->'wallet_transactions')
  on conflict (id) do update set owner_type = excluded.owner_type, owner_user_id = excluded.owner_user_id, org_id = excluded.org_id, transaction_at = excluded.transaction_at, description = excluded.description, student_name = excluded.student_name, amount_kzt = excluded.amount_kzt, platform_commission_kzt = excluded.platform_commission_kzt, status = excluded.status, method = excluded.method, created_at = excluded.created_at;

  insert into public.trial_lesson_slots
  select * from jsonb_populate_recordset(null::public.trial_lesson_slots, snapshot_payload->'trial_lesson_slots')
  on conflict (id) do update set course_id = excluded.course_id, org_id = excluded.org_id, day_label = excluded.day_label, time_label = excluded.time_label, active = excluded.active, display_order = excluded.display_order, created_at = excluded.created_at;

  insert into public.course_reviews
  select * from jsonb_populate_recordset(null::public.course_reviews, snapshot_payload->'course_reviews')
  on conflict (id) do update set course_id = excluded.course_id, author_user_id = excluded.author_user_id, author_display_name = excluded.author_display_name, rating = excluded.rating, body = excluded.body, status = excluded.status, created_at = excluded.created_at;

  insert into public.org_applications
  select * from jsonb_populate_recordset(null::public.org_applications, snapshot_payload->'org_applications')
  on conflict (id) do update set org_id = excluded.org_id, child_name = excluded.child_name, child_age = excluded.child_age, parent_name = excluded.parent_name, club = excluded.club, applied_date = excluded.applied_date, status = excluded.status, created_at = excluded.created_at, parent_user_id = excluded.parent_user_id, child_profile_id = excluded.child_profile_id, group_id = excluded.group_id, group_name = excluded.group_name, group_schedule = excluded.group_schedule;
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
  perform public.save_dev_data_snapshot();
  perform public.delete_dev_seed_rows();

  insert into public.parent_profiles (user_id, first_name, last_name, phone, tariff, updated_at)
  values (current_user_id, '[DEV] Dana', 'Saparova', '+77010000000', 'pro', now())
  on conflict (user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    tariff = excluded.tariff,
    updated_at = excluded.updated_at;

  insert into public.child_profiles (
    id, parent_user_id, name, age, age_category, interests, talent_profile,
    phone, qr_pin, qr_pin_expires_at, qr_pin_one_time_use, updated_at
  )
  values
    (
      '70000000-0000-4000-a000-000000001401',
      current_user_id,
      '[DEV] Amina',
      10,
      'child',
      array['робототехника', 'рисование', 'головоломки'],
      jsonb_build_object(
        'scores', jsonb_build_object('social', 74, 'creative', 82, 'logical', 91, 'physical', 58, 'linguistic', 69),
        'recommendedConstellation', 'Architects',
        'completedAt', now()
      ),
      null,
      '424242',
      now() + interval '15 minutes',
      false,
      now()
    ),
    (
      '70000000-0000-4000-a000-000000001402',
      current_user_id,
      '[DEV] Arman',
      14,
      'teen',
      array['кодинг', 'игры', 'дизайн'],
      jsonb_build_object(
        'scores', jsonb_build_object('social', 62, 'creative', 88, 'logical', 84, 'physical', 46, 'linguistic', 72),
        'recommendedConstellation', 'Creators',
        'completedAt', now()
      ),
      null,
      '737373',
      now() + interval '15 minutes',
      false,
      now()
    )
  on conflict (id) do update set
    parent_user_id = excluded.parent_user_id,
    name = excluded.name,
    age = excluded.age,
    age_category = excluded.age_category,
    interests = excluded.interests,
    talent_profile = excluded.talent_profile,
    phone = excluded.phone,
    qr_pin = excluded.qr_pin,
    qr_pin_expires_at = excluded.qr_pin_expires_at,
    qr_pin_one_time_use = excluded.qr_pin_one_time_use,
    updated_at = excluded.updated_at;

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
    ('70000000-0000-4000-a000-000000000101', '70000000-0000-4000-a000-000000000001', '[DEV] Robotics Lab', 'Build small robots, sensors, and logic skills through weekly challenges.', 'beginner', 32000, 'cpu', array['логика', 'робототехника', 'командная работа'], 'active', 9, 14),
    ('70000000-0000-4000-a000-000000000102', '70000000-0000-4000-a000-000000000001', '[DEV] Creative Coding', 'Make games and interactive stories while learning programming basics.', 'intermediate', 28000, 'code', array['креативность', 'логика', 'дизайн'], 'active', 11, 16)
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

  insert into public.trial_lesson_slots (id, course_id, org_id, day_label, time_label, active, display_order)
  values
    ('70000000-0000-4000-a000-000000000801', '70000000-0000-4000-a000-000000000101', '70000000-0000-4000-a000-000000000001', 'Понедельник', '16:00', true, 1),
    ('70000000-0000-4000-a000-000000000802', '70000000-0000-4000-a000-000000000101', '70000000-0000-4000-a000-000000000001', 'Среда', '18:00', true, 2),
    ('70000000-0000-4000-a000-000000000803', '70000000-0000-4000-a000-000000000102', '70000000-0000-4000-a000-000000000001', 'Суббота', '11:00', true, 3)
  on conflict (id) do update set course_id = excluded.course_id, org_id = excluded.org_id, day_label = excluded.day_label, time_label = excluded.time_label, active = excluded.active, display_order = excluded.display_order;

  insert into public.course_reviews (id, course_id, author_user_id, author_display_name, rating, body, status)
  values
    ('70000000-0000-4000-a000-000000000901', '70000000-0000-4000-a000-000000000101', current_user_id, '[DEV] Aigerim', 5, 'My child came home explaining sensors after the second lesson.', 'published'),
    ('70000000-0000-4000-a000-000000000902', '70000000-0000-4000-a000-000000000102', current_user_id, '[DEV] Timur', 5, 'A warm format for learning code without turning it into homework.', 'published')
  on conflict (id) do update set course_id = excluded.course_id, author_user_id = excluded.author_user_id, author_display_name = excluded.author_display_name, rating = excluded.rating, body = excluded.body, status = excluded.status;

  insert into public.org_applications (
    id, org_id, child_name, child_age, parent_name, club, applied_date, status,
    parent_user_id, child_profile_id, group_name, group_schedule
  )
  values
    ('70000000-0000-4000-a000-000000001001', '70000000-0000-4000-a000-000000000001', '[DEV] Amina', 10, '[DEV] Dana', '[DEV] Robotics Lab', '2 May 2026', 'paid', current_user_id, '70000000-0000-4000-a000-000000001401', '[DEV] Group R-1', 'Mon, Wed 16:00'),
    ('70000000-0000-4000-a000-000000001002', '70000000-0000-4000-a000-000000000001', '[DEV] Arman', 14, '[DEV] Dana', '[DEV] Creative Coding', '2 May 2026', 'activated', current_user_id, '70000000-0000-4000-a000-000000001402', '[DEV] Group C-2', 'Sat 11:00'),
    ('70000000-0000-4000-a000-000000001003', '70000000-0000-4000-a000-000000000001', '[DEV] Lina', 9, '[DEV] Asem', '[DEV] Robotics Lab', '2 May 2026', 'awaiting_payment', current_user_id, null, '[DEV] Group R-1', 'Mon, Wed 16:00')
  on conflict (id) do update set org_id = excluded.org_id, child_name = excluded.child_name, child_age = excluded.child_age, parent_name = excluded.parent_name, club = excluded.club, applied_date = excluded.applied_date, status = excluded.status, parent_user_id = excluded.parent_user_id, child_profile_id = excluded.child_profile_id, group_name = excluded.group_name, group_schedule = excluded.group_schedule;

  insert into public.student_tasks (id, student_user_id, title, club, xp_reward, done, created_at)
  values
    ('70000000-0000-4000-a000-000000001101', current_user_id, '[DEV] Finish robot sensor challenge', '[DEV] Robotics Lab', 80, false, now() - interval '2 days'),
    ('70000000-0000-4000-a000-000000001102', current_user_id, '[DEV] Sketch game character states', '[DEV] Creative Coding', 60, true, now() - interval '1 day'),
    ('70000000-0000-4000-a000-000000001103', current_user_id, '[DEV] Reflect on this week''s lesson', null, 30, false, now())
  on conflict (id) do update set student_user_id = excluded.student_user_id, title = excluded.title, club = excluded.club, xp_reward = excluded.xp_reward, done = excluded.done, created_at = excluded.created_at;

  insert into public.youth_goals (id, student_user_id, title, progress, color, created_at)
  values
    ('70000000-0000-4000-a000-000000001201', current_user_id, '[DEV] Build a small game prototype', 45, '#6C5CE7', now() - interval '3 days'),
    ('70000000-0000-4000-a000-000000001202', current_user_id, '[DEV] Present a robotics project', 70, '#10B981', now() - interval '2 days')
  on conflict (id) do update set student_user_id = excluded.student_user_id, title = excluded.title, progress = excluded.progress, color = excluded.color, created_at = excluded.created_at;

  insert into public.youth_goal_steps (id, goal_id, text, done, step_order)
  values
    ('70000000-0000-4000-a000-000000001211', '70000000-0000-4000-a000-000000001201', '[DEV] Choose the game idea', true, 1),
    ('70000000-0000-4000-a000-000000001212', '70000000-0000-4000-a000-000000001201', '[DEV] Create the first playable level', false, 2),
    ('70000000-0000-4000-a000-000000001221', '70000000-0000-4000-a000-000000001202', '[DEV] Prepare three slides', true, 1),
    ('70000000-0000-4000-a000-000000001222', '70000000-0000-4000-a000-000000001202', '[DEV] Practice the demo', false, 2)
  on conflict (id) do update set goal_id = excluded.goal_id, text = excluded.text, done = excluded.done, step_order = excluded.step_order;

  insert into public.achievements_catalog (id, name, icon_name, description)
  values
    ('70000000-0000-4000-a000-000000001301', '[DEV] First Spark', 'zap', 'Completed the first learning task.'),
    ('70000000-0000-4000-a000-000000001302', '[DEV] Team Builder', 'users', 'Worked with a group on a project.'),
    ('70000000-0000-4000-a000-000000001303', '[DEV] Logic Streak', 'cpu', 'Solved three logic challenges.')
  on conflict (id) do update set name = excluded.name, icon_name = excluded.icon_name, description = excluded.description;

  insert into public.user_achievements (id, user_id, achievement_id, unlocked, unlocked_at)
  values
    ('70000000-0000-4000-a000-000000001311', current_user_id, '70000000-0000-4000-a000-000000001301', true, now() - interval '1 day'),
    ('70000000-0000-4000-a000-000000001312', current_user_id, '70000000-0000-4000-a000-000000001302', false, null),
    ('70000000-0000-4000-a000-000000001313', current_user_id, '70000000-0000-4000-a000-000000001303', true, now())
  on conflict (user_id, achievement_id) do update set id = excluded.id, unlocked = excluded.unlocked, unlocked_at = excluded.unlocked_at;

  insert into public.wallet_transactions (
    id, owner_type, owner_user_id, org_id, transaction_at, description,
    student_name, amount_kzt, platform_commission_kzt, status, method
  )
  values
    ('70000000-0000-4000-a000-000000000701', 'org', null, '70000000-0000-4000-a000-000000000001', now() - interval '2 days', '[DEV] Robotics Lab enrollment', '[DEV] Amina', 32000, 3840, 'completed', 'Kaspi'),
    ('70000000-0000-4000-a000-000000000702', 'org', null, '70000000-0000-4000-a000-000000000001', now() - interval '1 day', '[DEV] Creative Coding enrollment', '[DEV] Arman', 28000, 3360, 'completed', 'Card'),
    ('70000000-0000-4000-a000-000000000703', 'mentor', current_user_id, null, now() - interval '3 days', '[DEV] Mentor session payout', '[DEV] Amina', 12000, 1200, 'completed', 'Wallet'),
    ('70000000-0000-4000-a000-000000000704', 'mentor', current_user_id, null, now() - interval '5 hours', '[DEV] Group review payout', '[DEV] Arman', 9000, 900, 'pending', 'Wallet')
  on conflict (id) do update set owner_type = excluded.owner_type, owner_user_id = excluded.owner_user_id, org_id = excluded.org_id, transaction_at = excluded.transaction_at, description = excluded.description, student_name = excluded.student_name, amount_kzt = excluded.amount_kzt, platform_commission_kzt = excluded.platform_commission_kzt, status = excluded.status, method = excluded.method;

  insert into public.teacher_groups (id, teacher_user_id, org_group_id, name, course_title, schedule, capacity, active)
  values ('70000000-0000-4000-a000-000000000301', current_user_id, null, '[DEV] Group R-1', '[DEV] Robotics Lab', 'Mon, Wed 16:00', 12, true)
  on conflict (id) do update set teacher_user_id = excluded.teacher_user_id, org_group_id = excluded.org_group_id, name = excluded.name, course_title = excluded.course_title, schedule = excluded.schedule, capacity = excluded.capacity, active = excluded.active;

  insert into public.teacher_group_students (id, group_id, student_user_id, student_name, student_age, status_label)
  values
    ('70000000-0000-4000-a000-000000000401', '70000000-0000-4000-a000-000000000301', null, '[DEV] Amina', 10, 'active'),
    ('70000000-0000-4000-a000-000000000402', '70000000-0000-4000-a000-000000000301', null, '[DEV] Lina', 9, 'trial'),
    ('70000000-0000-4000-a000-000000000403', '70000000-0000-4000-a000-000000000301', null, '[DEV] Arman', 12, 'active')
  on conflict (id) do update set group_id = excluded.group_id, student_user_id = excluded.student_user_id, student_name = excluded.student_name, student_age = excluded.student_age, status_label = excluded.status_label;

  insert into public.teacher_attendance_entries (id, group_id, student_id, class_date, status, comment, created_by)
  values
    ('70000000-0000-4000-a000-000000000501', '70000000-0000-4000-a000-000000000301', '70000000-0000-4000-a000-000000000401', current_date, 'present', '[DEV] Built first sensor circuit', current_user_id),
    ('70000000-0000-4000-a000-000000000502', '70000000-0000-4000-a000-000000000301', '70000000-0000-4000-a000-000000000402', current_date, 'absent', '[DEV] Parent warned in advance', current_user_id),
    ('70000000-0000-4000-a000-000000000503', '70000000-0000-4000-a000-000000000301', '70000000-0000-4000-a000-000000000403', current_date, 'present', '[DEV] Helped another student debug', current_user_id),
    ('70000000-0000-4000-a000-000000000504', '70000000-0000-4000-a000-000000000301', '70000000-0000-4000-a000-000000000401', current_date - 2, 'present', '[DEV] Completed warm-up task', current_user_id)
  on conflict (group_id, student_id, class_date) do update set status = excluded.status, comment = excluded.comment, created_by = excluded.created_by, updated_at = now();

  insert into public.conversations (id, name, icon_name, type, last_message, last_message_at, archived)
  values ('70000000-0000-4000-a000-000000000601', '[DEV] Parent and mentor', 'message-circle', 'direct', '[DEV] Next session confirmed for Wednesday.', now(), false)
  on conflict (id) do update set name = excluded.name, icon_name = excluded.icon_name, type = excluded.type, last_message = excluded.last_message, last_message_at = excluded.last_message_at, archived = excluded.archived;

  insert into public.conversation_participants (conversation_id, user_id, unread_count)
  values ('70000000-0000-4000-a000-000000000601', current_user_id, 1)
  on conflict (conversation_id, user_id) do update set unread_count = excluded.unread_count;

  insert into public.messages (id, conversation_id, sender_id, body, created_at)
  values
    ('70000000-0000-4000-a000-000000000611', '70000000-0000-4000-a000-000000000601', current_user_id, '[DEV] Amina did well with the sensor task today.', now() - interval '20 minutes'),
    ('70000000-0000-4000-a000-000000000612', '70000000-0000-4000-a000-000000000601', current_user_id, '[DEV] Next session confirmed for Wednesday.', now() - interval '5 minutes')
  on conflict (id) do update set conversation_id = excluded.conversation_id, sender_id = excluded.sender_id, body = excluded.body, created_at = excluded.created_at;

  return jsonb_build_object('seeded', true, 'snapshot', true);
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
begin
  select snapshot into payload
  from public.dev_data_snapshots
  where user_id = current_user_id;

  perform public.delete_dev_seed_rows();

  if payload is not null then
    perform public.restore_dev_data_snapshot(payload);
    delete from public.dev_data_snapshots where user_id = current_user_id;
    return jsonb_build_object('seeded', false, 'restored', true);
  end if;

  return jsonb_build_object('seeded', false, 'restored', false);
end;
$$;

grant execute on function public.require_dev_seed_admin() to authenticated;
grant execute on function public.dev_seed_snapshot_payload() to authenticated;
grant execute on function public.delete_dev_seed_rows() to authenticated;
grant execute on function public.restore_dev_data_snapshot(jsonb) to authenticated;
grant execute on function public.seed_dev_data() to authenticated;
grant execute on function public.clear_dev_data() to authenticated;
