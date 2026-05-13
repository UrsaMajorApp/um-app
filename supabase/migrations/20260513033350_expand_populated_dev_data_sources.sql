-- Expand the "Populated Dev Data" toggle with records for more app surfaces:
-- public course catalog, parent reports, org cabinet, mentor cabinet, and requests.

create table if not exists public.org_groups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  course text,
  schedule text,
  capacity int default 20,
  enrolled int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.org_groups
  add column if not exists course_id uuid;

do $$
begin
  if to_regclass('public.org_courses') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'org_groups_course_id_fkey'
        and conrelid = 'public.org_groups'::regclass
    )
  then
    alter table public.org_groups
      add constraint org_groups_course_id_fkey
      foreign key (course_id) references public.org_courses(id) on delete set null;
  end if;
end $$;

create table if not exists public.trial_lesson_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  child_id text,
  child_name text not null,
  child_age int,
  parent_id uuid references auth.users(id) on delete cascade,
  parent_name text,
  org_id uuid references public.organizations(id) on delete cascade,
  course_id uuid references public.org_courses(id) on delete set null,
  course_title text not null,
  mentor_id uuid references auth.users(id) on delete set null,
  requested_slots jsonb not null default '[]'::jsonb,
  confirmed_slot jsonb,
  confirmed_at timestamptz,
  status text not null default 'pending',
  outcome text,
  mentor_notes text,
  parent_notes text
);

do $$
declare
  child_profiles_reg oid := to_regclass('public.child_profiles');
  existing_child_ref oid;
  child_profile_id_type text;
  request_child_id_type text;
begin
  select c.confrelid
    into existing_child_ref
  from pg_constraint c
  where c.conname = 'trial_lesson_requests_child_id_fkey'
    and c.conrelid = 'public.trial_lesson_requests'::regclass
    and c.contype = 'f'
  limit 1;

  if child_profiles_reg is not null then
    select format_type(a.atttypid, a.atttypmod)
      into child_profile_id_type
    from pg_attribute a
    where a.attrelid = child_profiles_reg
      and a.attname = 'id'
      and not a.attisdropped;

    select format_type(a.atttypid, a.atttypmod)
      into request_child_id_type
    from pg_attribute a
    where a.attrelid = 'public.trial_lesson_requests'::regclass
      and a.attname = 'child_id'
      and not a.attisdropped;
  end if;

  if child_profiles_reg is not null
    and existing_child_ref is not null
    and existing_child_ref <> child_profiles_reg
  then
    alter table public.trial_lesson_requests
      drop constraint trial_lesson_requests_child_id_fkey;
    existing_child_ref := null;
  end if;

  if child_profiles_reg is not null
    and existing_child_ref is null
    and child_profile_id_type = 'text'
    and request_child_id_type <> 'text'
  then
    alter table public.trial_lesson_requests
      alter column child_id type text using child_id::text;
    request_child_id_type := 'text';
  end if;

  if child_profiles_reg is not null
    and existing_child_ref is null
    and child_profile_id_type = 'uuid'
    and request_child_id_type <> 'uuid'
  then
    alter table public.trial_lesson_requests
      alter column child_id type uuid using nullif(child_id, '')::uuid;
    request_child_id_type := 'uuid';
  end if;

  if child_profiles_reg is not null
    and existing_child_ref is null
    and child_profile_id_type = request_child_id_type
  then
    alter table public.trial_lesson_requests
      add constraint trial_lesson_requests_child_id_fkey
      foreign key (child_id) references public.child_profiles(id) on delete set null
      not valid;
  end if;
end $$;

create index if not exists trial_requests_mentor_idx
  on public.trial_lesson_requests(mentor_id, status);
create index if not exists trial_requests_parent_idx
  on public.trial_lesson_requests(parent_id);
create index if not exists trial_requests_org_idx
  on public.trial_lesson_requests(org_id);

alter table public.trial_lesson_requests enable row level security;

drop policy if exists trial_requests_parent_select on public.trial_lesson_requests;
create policy trial_requests_parent_select
  on public.trial_lesson_requests
  for select
  to authenticated
  using ((select auth.uid()) = parent_id);

drop policy if exists trial_requests_parent_insert on public.trial_lesson_requests;
create policy trial_requests_parent_insert
  on public.trial_lesson_requests
  for insert
  to authenticated
  with check ((select auth.uid()) = parent_id);

drop policy if exists trial_requests_mentor_select on public.trial_lesson_requests;
create policy trial_requests_mentor_select
  on public.trial_lesson_requests
  for select
  to authenticated
  using ((select auth.uid()) = mentor_id);

drop policy if exists trial_requests_mentor_update on public.trial_lesson_requests;
create policy trial_requests_mentor_update
  on public.trial_lesson_requests
  for update
  to authenticated
  using ((select auth.uid()) = mentor_id);

drop policy if exists trial_requests_org_select on public.trial_lesson_requests;
create policy trial_requests_org_select
  on public.trial_lesson_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.organizations
      where id = trial_lesson_requests.org_id
        and owner_user_id = (select auth.uid())
    )
  );

create or replace function public.clear_dev_extra_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  delete from public.attendance_records where id in (
    '70000000-0000-4000-a000-000000002831',
    '70000000-0000-4000-a000-000000002832',
    '70000000-0000-4000-a000-000000002833',
    '70000000-0000-4000-a000-000000002834',
    '70000000-0000-4000-a000-000000002835',
    '70000000-0000-4000-a000-000000002836',
    '70000000-0000-4000-a000-000000002837',
    '70000000-0000-4000-a000-000000002838'
  );
  delete from public.attendance_sessions where id in (
    '70000000-0000-4000-a000-000000002821',
    '70000000-0000-4000-a000-000000002822',
    '70000000-0000-4000-a000-000000002823'
  );
  delete from public.group_members where id in (
    '70000000-0000-4000-a000-000000002811',
    '70000000-0000-4000-a000-000000002812',
    '70000000-0000-4000-a000-000000002813',
    '70000000-0000-4000-a000-000000002814',
    '70000000-0000-4000-a000-000000002815'
  );
  delete from public.mentor_groups where id in (
    '70000000-0000-4000-a000-000000002801',
    '70000000-0000-4000-a000-000000002802'
  );
  delete from public.learning_path_steps where id in (
    '70000000-0000-4000-a000-000000002891',
    '70000000-0000-4000-a000-000000002892',
    '70000000-0000-4000-a000-000000002893',
    '70000000-0000-4000-a000-000000002894',
    '70000000-0000-4000-a000-000000002895',
    '70000000-0000-4000-a000-000000002896'
  );
  delete from public.student_goals where id in (
    '70000000-0000-4000-a000-000000002851',
    '70000000-0000-4000-a000-000000002852',
    '70000000-0000-4000-a000-000000002853'
  );
  delete from public.learning_materials where id in (
    '70000000-0000-4000-a000-000000002861',
    '70000000-0000-4000-a000-000000002862',
    '70000000-0000-4000-a000-000000002863',
    '70000000-0000-4000-a000-000000002864'
  );
  delete from public.mentor_feedback where id in (
    '70000000-0000-4000-a000-000000002871',
    '70000000-0000-4000-a000-000000002872',
    '70000000-0000-4000-a000-000000002873'
  );
  delete from public.mentorship_requests where id in (
    '70000000-0000-4000-a000-000000002881',
    '70000000-0000-4000-a000-000000002882',
    '70000000-0000-4000-a000-000000002883'
  );

  delete from public.child_skill_snapshots where id in (
    '70000000-0000-4000-a000-000000002601',
    '70000000-0000-4000-a000-000000002602',
    '70000000-0000-4000-a000-000000002603',
    '70000000-0000-4000-a000-000000002604',
    '70000000-0000-4000-a000-000000002605',
    '70000000-0000-4000-a000-000000002606',
    '70000000-0000-4000-a000-000000002607',
    '70000000-0000-4000-a000-000000002608'
  );
  delete from public.child_attendance_monthly where id in (
    '70000000-0000-4000-a000-000000002701',
    '70000000-0000-4000-a000-000000002702',
    '70000000-0000-4000-a000-000000002703',
    '70000000-0000-4000-a000-000000002704',
    '70000000-0000-4000-a000-000000002705',
    '70000000-0000-4000-a000-000000002706',
    '70000000-0000-4000-a000-000000002707',
    '70000000-0000-4000-a000-000000002708'
  );

  delete from public.subscription_requests where id in (
    '70000000-0000-4000-a000-000000002941',
    '70000000-0000-4000-a000-000000002942'
  );
  delete from public.org_schedule_items where id in (
    '70000000-0000-4000-a000-000000002401',
    '70000000-0000-4000-a000-000000002402',
    '70000000-0000-4000-a000-000000002403',
    '70000000-0000-4000-a000-000000002404',
    '70000000-0000-4000-a000-000000002405'
  );
  delete from public.org_tasks where id in (
    '70000000-0000-4000-a000-000000002501',
    '70000000-0000-4000-a000-000000002502',
    '70000000-0000-4000-a000-000000002503',
    '70000000-0000-4000-a000-000000002504'
  );
  delete from public.org_groups where id in (
    '70000000-0000-4000-a000-000000002301',
    '70000000-0000-4000-a000-000000002302',
    '70000000-0000-4000-a000-000000002303',
    '70000000-0000-4000-a000-000000002304'
  );
  delete from public.org_staff where id in (
    '70000000-0000-4000-a000-000000002201',
    '70000000-0000-4000-a000-000000002202',
    '70000000-0000-4000-a000-000000002203'
  );

  delete from public.trial_lesson_slots where id in (
    '70000000-0000-4000-a000-000000002901',
    '70000000-0000-4000-a000-000000002902',
    '70000000-0000-4000-a000-000000002903',
    '70000000-0000-4000-a000-000000002904',
    '70000000-0000-4000-a000-000000002905',
    '70000000-0000-4000-a000-000000002906'
  );
  delete from public.course_reviews where id in (
    '70000000-0000-4000-a000-000000002921',
    '70000000-0000-4000-a000-000000002922',
    '70000000-0000-4000-a000-000000002923',
    '70000000-0000-4000-a000-000000002924',
    '70000000-0000-4000-a000-000000002925'
  );
  delete from public.org_courses where id in (
    '70000000-0000-4000-a000-000000002101',
    '70000000-0000-4000-a000-000000002102',
    '70000000-0000-4000-a000-000000002103',
    '70000000-0000-4000-a000-000000002104',
    '70000000-0000-4000-a000-000000002105'
  );
  delete from public.organizations where id in (
    '70000000-0000-4000-a000-000000002001',
    '70000000-0000-4000-a000-000000002002'
  );

  return jsonb_build_object('clearedExtra', true);
end;
$$;

create or replace function public.seed_dev_extra_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
begin
  perform public.clear_dev_extra_data();

  insert into public.organizations (
    id, owner_user_id, name, category, description, status, rating, active_students, commission_pct
  )
  values
    (
      '70000000-0000-4000-a000-000000002001',
      current_user_id,
      '[DEV] Nova Art Studio',
      'Искусство',
      'Studio for illustration, speaking, and visual storytelling demos.',
      'verified',
      4.72,
      34,
      14.00
    ),
    (
      '70000000-0000-4000-a000-000000002002',
      current_user_id,
      '[DEV] GreenLab Science Club',
      'Наука',
      'Hands-on science club with biology, eco engineering, and research tracks.',
      'verified',
      4.91,
      29,
      12.50
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
    ('70000000-0000-4000-a000-000000002101', '70000000-0000-4000-a000-000000002001', '[DEV] Digital Illustration', 'Characters, storyboards, and tablet drawing from sketch to portfolio.', 'beginner', 26000, 'palette', array['Креативность', 'Дизайн', 'Визуальное мышление'], 'active', 10, 16),
    ('70000000-0000-4000-a000-000000002102', '70000000-0000-4000-a000-000000002001', '[DEV] Public Speaking Lab', 'Voice, argument structure, debate games, and confident presentation practice.', 'intermediate', 24000, 'mic', array['Коммуникация', 'Лидерство', 'Социум'], 'active', 12, 17),
    ('70000000-0000-4000-a000-000000002103', '70000000-0000-4000-a000-000000002002', '[DEV] Bio Lab', 'Microscopes, field notes, and simple experiments for curious teens.', 'beginner', 30000, 'flask-conical', array['Наука', 'Аналитика', 'Внимательность'], 'active', 11, 15),
    ('70000000-0000-4000-a000-000000002104', '70000000-0000-4000-a000-000000002002', '[DEV] Eco Engineering', 'Build water filters, sensors, and mini climate projects in teams.', 'advanced', 36000, 'leaf', array['Инженерия', 'Команда', 'Крит. мышление'], 'active', 13, 17),
    ('70000000-0000-4000-a000-000000002105', '70000000-0000-4000-a000-000000000001', '[DEV] Math Quest', 'Logic puzzles, Olympiad-style strategy, and visual math challenges.', 'intermediate', 22000, 'sigma', array['Математика', 'Логика', 'Стратегия'], 'active', 10, 14)
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

  insert into public.org_staff (
    id, org_id, full_name, phone, email, specialization, rating, status
  )
  values
    ('70000000-0000-4000-a000-000000002201', '70000000-0000-4000-a000-000000000001', '[DEV] Mira Ilyasova', '+77015550101', 'mira.dev@example.com', 'Robotics mentor', 4.84, 'active'),
    ('70000000-0000-4000-a000-000000002202', '70000000-0000-4000-a000-000000000001', '[DEV] Askar Toleu', '+77015550102', 'askar.dev@example.com', 'Creative coding', 4.77, 'active'),
    ('70000000-0000-4000-a000-000000002203', '70000000-0000-4000-a000-000000000001', '[DEV] Laila Chen', '+77015550103', 'laila.dev@example.com', 'Math quests', 4.69, 'invited')
  on conflict (id) do update set
    org_id = excluded.org_id,
    full_name = excluded.full_name,
    phone = excluded.phone,
    email = excluded.email,
    specialization = excluded.specialization,
    rating = excluded.rating,
    status = excluded.status;

  insert into public.org_groups (
    id, org_id, course_id, name, course, schedule, capacity, enrolled, active
  )
  values
    ('70000000-0000-4000-a000-000000002301', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000000101', '[DEV] Robotics R-2', '[DEV] Robotics Lab', 'Tue, Thu 17:00', 14, 11, true),
    ('70000000-0000-4000-a000-000000002302', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000002105', '[DEV] Math Quest M-1', '[DEV] Math Quest', 'Sat 10:00', 12, 8, true),
    ('70000000-0000-4000-a000-000000002303', '70000000-0000-4000-a000-000000002001', '70000000-0000-4000-a000-000000002101', '[DEV] Illustration I-1', '[DEV] Digital Illustration', 'Mon, Wed 18:00', 10, 7, true),
    ('70000000-0000-4000-a000-000000002304', '70000000-0000-4000-a000-000000002002', '70000000-0000-4000-a000-000000002104', '[DEV] Eco Engineering E-1', '[DEV] Eco Engineering', 'Fri 16:30', 16, 13, true)
  on conflict (id) do update set
    org_id = excluded.org_id,
    course_id = excluded.course_id,
    name = excluded.name,
    course = excluded.course,
    schedule = excluded.schedule,
    capacity = excluded.capacity,
    enrolled = excluded.enrolled,
    active = excluded.active;

  insert into public.org_schedule_items (
    id, org_id, time_label, subject, group_name, teacher_name, room, color, day_of_week
  )
  values
    ('70000000-0000-4000-a000-000000002401', '70000000-0000-4000-a000-000000000001', '16:00', '[DEV] Sensor build', '[DEV] Group R-1', '[DEV] Mira Ilyasova', 'Lab 2', '#6C5CE7', 0),
    ('70000000-0000-4000-a000-000000002402', '70000000-0000-4000-a000-000000000001', '17:00', '[DEV] Robotics R-2', '[DEV] Robotics R-2', '[DEV] Mira Ilyasova', 'Lab 1', '#10B981', 1),
    ('70000000-0000-4000-a000-000000002403', '70000000-0000-4000-a000-000000000001', '18:30', '[DEV] Creative coding jam', '[DEV] Group C-2', '[DEV] Askar Toleu', 'Studio 4', '#3B82F6', 2),
    ('70000000-0000-4000-a000-000000002404', '70000000-0000-4000-a000-000000000001', '10:00', '[DEV] Math Quest', '[DEV] Math Quest M-1', '[DEV] Laila Chen', 'Room 12', '#F59E0B', 5),
    ('70000000-0000-4000-a000-000000002405', '70000000-0000-4000-a000-000000000001', '12:30', '[DEV] Parent open day', '[DEV] Mixed demo', '[DEV] Dana Saparova', 'Main hall', '#EC4899', 5)
  on conflict (id) do update set
    org_id = excluded.org_id,
    time_label = excluded.time_label,
    subject = excluded.subject,
    group_name = excluded.group_name,
    teacher_name = excluded.teacher_name,
    room = excluded.room,
    color = excluded.color,
    day_of_week = excluded.day_of_week;

  insert into public.org_tasks (
    id, org_id, title, club, due_date, total_students, completed_students, xp_reward
  )
  values
    ('70000000-0000-4000-a000-000000002501', '70000000-0000-4000-a000-000000000001', '[DEV] Upload robotics rubric', '[DEV] Robotics Lab', 'Fri', 14, 9, 60),
    ('70000000-0000-4000-a000-000000002502', '70000000-0000-4000-a000-000000000001', '[DEV] Check coding prototypes', '[DEV] Creative Coding', 'Tomorrow', 12, 5, 70),
    ('70000000-0000-4000-a000-000000002503', '70000000-0000-4000-a000-000000000001', '[DEV] Prepare open day kits', '[DEV] Mixed demo', 'Sat', 20, 13, 40),
    ('70000000-0000-4000-a000-000000002504', '70000000-0000-4000-a000-000000000001', '[DEV] Send parent progress notes', '[DEV] Math Quest', 'Mon', 8, 2, 50)
  on conflict (id) do update set
    org_id = excluded.org_id,
    title = excluded.title,
    club = excluded.club,
    due_date = excluded.due_date,
    total_students = excluded.total_students,
    completed_students = excluded.completed_students,
    xp_reward = excluded.xp_reward;

  insert into public.child_skill_snapshots (
    id, parent_user_id, child_name, skill_label, current_value, prev_value, color
  )
  values
    ('70000000-0000-4000-a000-000000002601', current_user_id, '[DEV] Amina', 'Логика', 91, 84, '#6C5CE7'),
    ('70000000-0000-4000-a000-000000002602', current_user_id, '[DEV] Amina', 'Креативность', 82, 76, '#EC4899'),
    ('70000000-0000-4000-a000-000000002603', current_user_id, '[DEV] Amina', 'Командность', 74, 68, '#10B981'),
    ('70000000-0000-4000-a000-000000002604', current_user_id, '[DEV] Amina', 'Коммуникация', 69, 62, '#3B82F6'),
    ('70000000-0000-4000-a000-000000002605', current_user_id, '[DEV] Arman', 'Креативность', 88, 81, '#EC4899'),
    ('70000000-0000-4000-a000-000000002606', current_user_id, '[DEV] Arman', 'Аналитика', 84, 78, '#6C5CE7'),
    ('70000000-0000-4000-a000-000000002607', current_user_id, '[DEV] Arman', 'Языки', 72, 66, '#F59E0B'),
    ('70000000-0000-4000-a000-000000002608', current_user_id, '[DEV] Arman', 'Социум', 62, 58, '#10B981')
  on conflict (id) do update set
    parent_user_id = excluded.parent_user_id,
    child_name = excluded.child_name,
    skill_label = excluded.skill_label,
    current_value = excluded.current_value,
    prev_value = excluded.prev_value,
    color = excluded.color;

  insert into public.child_attendance_monthly (
    id, parent_user_id, child_name, month_label, attendance_pct, month_order
  )
  values
    ('70000000-0000-4000-a000-000000002701', current_user_id, '[DEV] Amina', 'Фев', 75, 1),
    ('70000000-0000-4000-a000-000000002702', current_user_id, '[DEV] Amina', 'Мар', 88, 2),
    ('70000000-0000-4000-a000-000000002703', current_user_id, '[DEV] Amina', 'Апр', 92, 3),
    ('70000000-0000-4000-a000-000000002704', current_user_id, '[DEV] Amina', 'Май', 86, 4),
    ('70000000-0000-4000-a000-000000002705', current_user_id, '[DEV] Arman', 'Фев', 67, 1),
    ('70000000-0000-4000-a000-000000002706', current_user_id, '[DEV] Arman', 'Мар', 79, 2),
    ('70000000-0000-4000-a000-000000002707', current_user_id, '[DEV] Arman', 'Апр', 84, 3),
    ('70000000-0000-4000-a000-000000002708', current_user_id, '[DEV] Arman', 'Май', 81, 4)
  on conflict (id) do update set
    parent_user_id = excluded.parent_user_id,
    child_name = excluded.child_name,
    month_label = excluded.month_label,
    attendance_pct = excluded.attendance_pct,
    month_order = excluded.month_order;

  insert into public.mentor_groups (
    id, mentor_user_id, name, course, schedule, max_students, active
  )
  values
    ('70000000-0000-4000-a000-000000002801', current_user_id, '[DEV] Mentor Lab A', '[DEV] Public Speaking Lab', 'Tue, Thu 18:00', 12, true),
    ('70000000-0000-4000-a000-000000002802', current_user_id, '[DEV] Mentor Lab B', '[DEV] Bio Lab', 'Sat 12:00', 10, true)
  on conflict (id) do update set
    mentor_user_id = excluded.mentor_user_id,
    name = excluded.name,
    course = excluded.course,
    schedule = excluded.schedule,
    max_students = excluded.max_students,
    active = excluded.active;

  insert into public.group_members (
    id, group_id, student_name, student_age, level, xp, progress, skills
  )
  values
    ('70000000-0000-4000-a000-000000002811', '70000000-0000-4000-a000-000000002801', '[DEV] Amina', 10, 4, 1240, 78, '{"com":76,"lead":62,"cre":84,"log":88,"dis":70}'::jsonb),
    ('70000000-0000-4000-a000-000000002812', '70000000-0000-4000-a000-000000002801', '[DEV] Arman', 14, 5, 1560, 86, '{"com":68,"lead":74,"cre":91,"log":83,"dis":64}'::jsonb),
    ('70000000-0000-4000-a000-000000002813', '70000000-0000-4000-a000-000000002801', '[DEV] Lina', 12, 3, 980, 61, '{"com":82,"lead":59,"cre":79,"log":65,"dis":72}'::jsonb),
    ('70000000-0000-4000-a000-000000002814', '70000000-0000-4000-a000-000000002802', '[DEV] Daniyar', 13, 4, 1180, 73, '{"com":60,"lead":57,"cre":66,"log":86,"dis":81}'::jsonb),
    ('70000000-0000-4000-a000-000000002815', '70000000-0000-4000-a000-000000002802', '[DEV] Sofia', 11, 2, 720, 49, '{"com":71,"lead":54,"cre":69,"log":74,"dis":76}'::jsonb)
  on conflict (id) do update set
    group_id = excluded.group_id,
    student_name = excluded.student_name,
    student_age = excluded.student_age,
    level = excluded.level,
    xp = excluded.xp,
    progress = excluded.progress,
    skills = excluded.skills;

  insert into public.attendance_sessions (id, group_id, session_date, notes)
  values
    ('70000000-0000-4000-a000-000000002821', '70000000-0000-4000-a000-000000002801', current_date - 7, '[DEV] Debate warm-up and argument map'),
    ('70000000-0000-4000-a000-000000002822', '70000000-0000-4000-a000-000000002801', current_date, '[DEV] Pitch rehearsal'),
    ('70000000-0000-4000-a000-000000002823', '70000000-0000-4000-a000-000000002802', current_date - 2, '[DEV] Microscopy practice')
  on conflict (id) do update set
    group_id = excluded.group_id,
    session_date = excluded.session_date,
    notes = excluded.notes;

  insert into public.attendance_records (id, session_id, member_id, present)
  values
    ('70000000-0000-4000-a000-000000002831', '70000000-0000-4000-a000-000000002821', '70000000-0000-4000-a000-000000002811', true),
    ('70000000-0000-4000-a000-000000002832', '70000000-0000-4000-a000-000000002821', '70000000-0000-4000-a000-000000002812', true),
    ('70000000-0000-4000-a000-000000002833', '70000000-0000-4000-a000-000000002821', '70000000-0000-4000-a000-000000002813', false),
    ('70000000-0000-4000-a000-000000002834', '70000000-0000-4000-a000-000000002822', '70000000-0000-4000-a000-000000002811', true),
    ('70000000-0000-4000-a000-000000002835', '70000000-0000-4000-a000-000000002822', '70000000-0000-4000-a000-000000002812', true),
    ('70000000-0000-4000-a000-000000002836', '70000000-0000-4000-a000-000000002822', '70000000-0000-4000-a000-000000002813', true),
    ('70000000-0000-4000-a000-000000002837', '70000000-0000-4000-a000-000000002823', '70000000-0000-4000-a000-000000002814', true),
    ('70000000-0000-4000-a000-000000002838', '70000000-0000-4000-a000-000000002823', '70000000-0000-4000-a000-000000002815', false)
  on conflict (id) do update set
    session_id = excluded.session_id,
    member_id = excluded.member_id,
    present = excluded.present;

  insert into public.student_goals (
    id, mentor_user_id, student_name, title, deadline_text, progress, color
  )
  values
    ('70000000-0000-4000-a000-000000002851', current_user_id, '[DEV] Amina', '[DEV] Present project without notes', '2 weeks', 64, '#6C5CE7'),
    ('70000000-0000-4000-a000-000000002852', current_user_id, '[DEV] Arman', '[DEV] Structure a five-minute pitch', 'Friday', 82, '#10B981'),
    ('70000000-0000-4000-a000-000000002853', current_user_id, '[DEV] Daniyar', '[DEV] Write clean lab observations', 'Next session', 45, '#3B82F6')
  on conflict (id) do update set
    mentor_user_id = excluded.mentor_user_id,
    student_name = excluded.student_name,
    title = excluded.title,
    deadline_text = excluded.deadline_text,
    progress = excluded.progress,
    color = excluded.color;

  insert into public.learning_materials (
    id, mentor_user_id, title, material_type, icon_name, size_label, file_url, color
  )
  values
    ('70000000-0000-4000-a000-000000002861', current_user_id, '[DEV] Debate structure cheat sheet', 'PDF', 'file-text', '1.2 MB', null, '#6C5CE7'),
    ('70000000-0000-4000-a000-000000002862', current_user_id, '[DEV] Lab notebook template', 'Документ', 'book-open', '840 KB', null, '#10B981'),
    ('70000000-0000-4000-a000-000000002863', current_user_id, '[DEV] Pitch rehearsal checklist', 'Checklist', 'check-square', '420 KB', null, '#F59E0B'),
    ('70000000-0000-4000-a000-000000002864', current_user_id, '[DEV] Creative reflection cards', 'Карточки', 'layers', '18 cards', null, '#EC4899')
  on conflict (id) do update set
    mentor_user_id = excluded.mentor_user_id,
    title = excluded.title,
    material_type = excluded.material_type,
    icon_name = excluded.icon_name,
    size_label = excluded.size_label,
    file_url = excluded.file_url,
    color = excluded.color;

  insert into public.mentor_feedback (
    id, mentor_user_id, teacher_name, student_name, tag, text
  )
  values
    ('70000000-0000-4000-a000-000000002871', current_user_id, '[DEV] Mira Ilyasova', '[DEV] Amina', 'logic', '[DEV] Quickly found the weak spot in the robot sensor chain.'),
    ('70000000-0000-4000-a000-000000002872', current_user_id, '[DEV] Askar Toleu', '[DEV] Arman', 'creative', '[DEV] Strong visual idea, needs a tighter presentation rhythm.'),
    ('70000000-0000-4000-a000-000000002873', current_user_id, '[DEV] Laila Chen', '[DEV] Daniyar', 'discipline', '[DEV] Good notes today; next step is finishing the observation table.')
  on conflict (id) do update set
    mentor_user_id = excluded.mentor_user_id,
    teacher_name = excluded.teacher_name,
    student_name = excluded.student_name,
    tag = excluded.tag,
    text = excluded.text;

  insert into public.learning_path_steps (
    id, mentor_user_id, student_name, phase, phase_order, status, item_text, done
  )
  values
    ('70000000-0000-4000-a000-000000002891', current_user_id, '[DEV] Amina', 'Текущие навыки', 1, 'completed', '[DEV] Логика: сильная сторона', true),
    ('70000000-0000-4000-a000-000000002892', current_user_id, '[DEV] Amina', 'Текущие навыки', 1, 'completed', '[DEV] Креативность: растет стабильно', true),
    ('70000000-0000-4000-a000-000000002893', current_user_id, '[DEV] Amina', 'Цели развития', 2, 'active', '[DEV] Добавить больше структуры в выступления', false),
    ('70000000-0000-4000-a000-000000002894', current_user_id, '[DEV] Arman', 'Текущие навыки', 1, 'completed', '[DEV] Дизайн-мышление: высокий уровень', true),
    ('70000000-0000-4000-a000-000000002895', current_user_id, '[DEV] Arman', 'Цели развития', 2, 'active', '[DEV] Доводить прототип до демо-версии', false),
    ('70000000-0000-4000-a000-000000002896', current_user_id, '[DEV] Arman', 'Рекомендованные кружки', 3, 'active', '[DEV] Creative Coding или Public Speaking Lab', false)
  on conflict (id) do update set
    mentor_user_id = excluded.mentor_user_id,
    student_name = excluded.student_name,
    phase = excluded.phase,
    phase_order = excluded.phase_order,
    status = excluded.status,
    item_text = excluded.item_text,
    done = excluded.done;

  insert into public.mentorship_requests (
    id, mentor_user_id, request_type, parent_name, child_name, interest_text, status, slots
  )
  values
    ('70000000-0000-4000-a000-000000002881', current_user_id, 'mentorship', '[DEV] Dana', '[DEV] Amina', '[DEV] Wants a mentor for robotics presentation confidence.', 'pending', array['Вт 18:00', 'Чт 18:00', 'Сб 11:00']),
    ('70000000-0000-4000-a000-000000002882', current_user_id, 'session', '[DEV] Dana', '[DEV] Arman', '[DEV] One-off sync about creative coding path.', 'accepted', array['Пт 17:00', 'Сб 12:00']),
    ('70000000-0000-4000-a000-000000002883', current_user_id, 'mentorship', '[DEV] Asem', '[DEV] Lina', '[DEV] Needs support choosing between design and public speaking.', 'pending', array['Пн 19:00', 'Ср 17:30'])
  on conflict (id) do update set
    mentor_user_id = excluded.mentor_user_id,
    request_type = excluded.request_type,
    parent_name = excluded.parent_name,
    child_name = excluded.child_name,
    interest_text = excluded.interest_text,
    status = excluded.status,
    slots = excluded.slots;

  insert into public.trial_lesson_slots (
    id, course_id, org_id, day_label, time_label, active, display_order
  )
  values
    ('70000000-0000-4000-a000-000000002901', '70000000-0000-4000-a000-000000002101', '70000000-0000-4000-a000-000000002001', 'Понедельник', '18:00', true, 1),
    ('70000000-0000-4000-a000-000000002902', '70000000-0000-4000-a000-000000002101', '70000000-0000-4000-a000-000000002001', 'Суббота', '12:00', true, 2),
    ('70000000-0000-4000-a000-000000002903', '70000000-0000-4000-a000-000000002102', '70000000-0000-4000-a000-000000002001', 'Вторник', '17:30', true, 1),
    ('70000000-0000-4000-a000-000000002904', '70000000-0000-4000-a000-000000002103', '70000000-0000-4000-a000-000000002002', 'Среда', '16:00', true, 1),
    ('70000000-0000-4000-a000-000000002905', '70000000-0000-4000-a000-000000002104', '70000000-0000-4000-a000-000000002002', 'Пятница', '16:30', true, 1),
    ('70000000-0000-4000-a000-000000002906', '70000000-0000-4000-a000-000000002105', '70000000-0000-4000-a000-000000000001', 'Суббота', '10:00', true, 1)
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
    ('70000000-0000-4000-a000-000000002921', '70000000-0000-4000-a000-000000002101', current_user_id, '[DEV] Madina', 5, '[DEV] Portfolio feedback was specific and kind.', 'published'),
    ('70000000-0000-4000-a000-000000002922', '70000000-0000-4000-a000-000000002102', current_user_id, '[DEV] Erbol', 4, '[DEV] The debate format helped my son speak more calmly.', 'published'),
    ('70000000-0000-4000-a000-000000002923', '70000000-0000-4000-a000-000000002103', current_user_id, '[DEV] Zhanar', 5, '[DEV] Lots of real experiments, not just slides.', 'published'),
    ('70000000-0000-4000-a000-000000002924', '70000000-0000-4000-a000-000000002104', current_user_id, '[DEV] Ruslan', 5, '[DEV] Strong team projects and very practical tasks.', 'published'),
    ('70000000-0000-4000-a000-000000002925', '70000000-0000-4000-a000-000000002105', current_user_id, '[DEV] Aigerim', 4, '[DEV] Math finally felt like a game, in a good way.', 'published')
  on conflict (id) do update set
    course_id = excluded.course_id,
    author_user_id = excluded.author_user_id,
    author_display_name = excluded.author_display_name,
    rating = excluded.rating,
    body = excluded.body,
    status = excluded.status;

  insert into public.subscription_requests (
    id, student_id, student_name, parent_id, requested_plan_id,
    requested_plan_title, requested_plan_role, price_kzt, billing_period,
    status, notification_sent, notification_read
  )
  values
    ('70000000-0000-4000-a000-000000002941', current_user_id, '[DEV] Amina', current_user_id, '70000000-0000-4000-a000-000000000202', '[DEV] Young Explorer', 'youth', 2900, 'month', 'pending', true, false),
    ('70000000-0000-4000-a000-000000002942', current_user_id, '[DEV] Arman', current_user_id, '70000000-0000-4000-a000-000000000202', '[DEV] Young Explorer', 'youth', 2900, 'month', 'approved', true, true)
  on conflict (id) do update set
    student_id = excluded.student_id,
    student_name = excluded.student_name,
    parent_id = excluded.parent_id,
    requested_plan_id = excluded.requested_plan_id,
    requested_plan_title = excluded.requested_plan_title,
    requested_plan_role = excluded.requested_plan_role,
    price_kzt = excluded.price_kzt,
    billing_period = excluded.billing_period,
    status = excluded.status,
    notification_sent = excluded.notification_sent,
    notification_read = excluded.notification_read,
    updated_at = now();

  return jsonb_build_object('seededExtra', true);
end;
$$;

grant execute on function public.clear_dev_extra_data() to authenticated;
grant execute on function public.seed_dev_extra_data() to authenticated;
