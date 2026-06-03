-- Forward repair for cloud databases whose migration history includes the
-- legacy 003/004 files but whose schema is missing their demo dependency
-- tables. These are required by seed_dev_extra_data() and the parent showcase.

create table if not exists public.mentor_groups (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references public.um_user_profiles(id) on delete set null,
  name text not null,
  course text not null,
  schedule text,
  max_students int default 20,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.mentor_groups(id) on delete cascade,
  student_name text not null,
  student_age int,
  level int default 1,
  xp int default 0,
  progress int default 0,
  skills jsonb default '{"com":50,"lead":50,"cre":50,"log":50,"dis":50}',
  enrolled_at timestamptz default now()
);

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.mentor_groups(id) on delete cascade,
  session_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.attendance_sessions(id) on delete cascade,
  member_id uuid references public.group_members(id) on delete cascade,
  present boolean default true
);

create table if not exists public.student_goals (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references public.um_user_profiles(id) on delete set null,
  student_name text not null,
  title text not null,
  deadline_text text,
  progress int default 0 check (progress between 0 and 100),
  color text default '#6C5CE7',
  created_at timestamptz default now()
);

create table if not exists public.learning_materials (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references public.um_user_profiles(id) on delete set null,
  title text not null,
  material_type text default 'Документ',
  icon_name text default 'file-text',
  size_label text default '-',
  file_url text,
  color text default '#6C5CE7',
  created_at timestamptz default now()
);

create table if not exists public.mentor_feedback (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references public.um_user_profiles(id) on delete set null,
  teacher_name text,
  student_name text,
  tag text,
  text text not null,
  created_at timestamptz default now()
);

create table if not exists public.org_staff (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  specialization text,
  rating numeric(3,2) default 0,
  status text default 'active' check (status in ('active','invited','inactive')),
  created_at timestamptz default now()
);

create table if not exists public.org_tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  club text,
  due_date text,
  total_students int default 0,
  completed_students int default 0,
  xp_reward int default 50,
  created_at timestamptz default now()
);

create table if not exists public.learning_path_steps (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references auth.users(id) on delete cascade,
  student_name text not null default '',
  phase text not null,
  phase_order int not null default 0,
  status text not null default 'active',
  item_text text not null,
  done boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.org_schedule_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  time_label text not null,
  subject text not null,
  group_name text not null default '',
  teacher_name text not null default '',
  room text not null default '',
  color text not null default '#6C5CE7',
  day_of_week int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references auth.users(id) on delete cascade,
  request_type text not null default 'mentorship',
  parent_name text,
  child_name text,
  interest_text text,
  status text not null default 'pending',
  slots text[],
  created_at timestamptz default now()
);

alter table public.mentor_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.student_goals enable row level security;
alter table public.learning_materials enable row level security;
alter table public.mentor_feedback enable row level security;
alter table public.org_staff enable row level security;
alter table public.org_tasks enable row level security;
alter table public.learning_path_steps enable row level security;
alter table public.org_schedule_items enable row level security;
alter table public.mentorship_requests enable row level security;

drop policy if exists "mentor_groups_own" on public.mentor_groups;
create policy "mentor_groups_own" on public.mentor_groups
  for all using (mentor_user_id = auth.uid() or public.is_admin());

drop policy if exists "group_members_own" on public.group_members;
create policy "group_members_own" on public.group_members
  for all using (
    exists (
      select 1
      from public.mentor_groups mg
      where mg.id = group_members.group_id
        and (mg.mentor_user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "attendance_sessions_own" on public.attendance_sessions;
create policy "attendance_sessions_own" on public.attendance_sessions
  for all using (
    exists (
      select 1
      from public.mentor_groups mg
      where mg.id = attendance_sessions.group_id
        and (mg.mentor_user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "attendance_records_own" on public.attendance_records;
create policy "attendance_records_own" on public.attendance_records
  for all using (
    exists (
      select 1
      from public.attendance_sessions ses
      join public.mentor_groups mg on mg.id = ses.group_id
      where ses.id = attendance_records.session_id
        and (mg.mentor_user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "student_goals_own" on public.student_goals;
create policy "student_goals_own" on public.student_goals
  for all using (mentor_user_id = auth.uid() or public.is_admin());

drop policy if exists "learning_materials_own" on public.learning_materials;
create policy "learning_materials_own" on public.learning_materials
  for all using (mentor_user_id = auth.uid() or public.is_admin());

drop policy if exists "mentor_feedback_own" on public.mentor_feedback;
create policy "mentor_feedback_own" on public.mentor_feedback
  for all using (mentor_user_id = auth.uid() or public.is_admin());

drop policy if exists "org_staff_owner" on public.org_staff;
create policy "org_staff_owner" on public.org_staff
  for all using (
    exists (
      select 1
      from public.organizations o
      where o.id = org_staff.org_id
        and (o.owner_user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "org_tasks_owner" on public.org_tasks;
create policy "org_tasks_owner" on public.org_tasks
  for all using (
    exists (
      select 1
      from public.organizations o
      where o.id = org_tasks.org_id
        and (o.owner_user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "mentor owns steps" on public.learning_path_steps;
create policy "mentor owns steps" on public.learning_path_steps
  for all using (mentor_user_id = auth.uid());

drop policy if exists "admin bypass lps" on public.learning_path_steps;
create policy "admin bypass lps" on public.learning_path_steps
  for all using (public.is_admin());

drop policy if exists "org owner reads schedule" on public.org_schedule_items;
create policy "org owner reads schedule" on public.org_schedule_items
  for all using (
    org_id in (select id from public.organizations where owner_user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "mentor owns requests" on public.mentorship_requests;
create policy "mentor owns requests" on public.mentorship_requests
  for all using (mentor_user_id = auth.uid());

drop policy if exists "admin bypass mr" on public.mentorship_requests;
create policy "admin bypass mr" on public.mentorship_requests
  for all using (public.is_admin());
