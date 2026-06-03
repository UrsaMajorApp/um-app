-- Миграция Supabase: применяет изменение схемы или seed-данных для app data.
-- ============================================================
-- 003_app_data.sql  — conversations, mentor, org, student tables
-- ============================================================

-- ── conversations ─────────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_name text default 'message-circle',
  type text default 'direct' check (type in ('direct','group','system')),
  last_message text,
  last_message_at timestamptz default now(),
  archived boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.um_user_profiles(id) on delete cascade,
  unread_count int default 0,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid,
  body text not null,
  created_at timestamptz default now()
);

-- ── mentor tables ──────────────────────────────────────────
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
  size_label text default '—',
  file_url text,
  color text default '#6C5CE7',
  created_at timestamptz default now()
);

-- ── org tables ─────────────────────────────────────────────
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

create table if not exists public.org_applications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  child_name text not null,
  child_age int,
  parent_name text,
  club text,
  applied_date text,
  status text default 'awaiting_payment' check (status in ('paid','awaiting_payment','activated','completed','rejected')),
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

-- ── student tasks (youth) ──────────────────────────────────
create table if not exists public.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid references public.um_user_profiles(id) on delete cascade,
  title text not null,
  club text,
  xp_reward int default 50,
  done boolean default false,
  created_at timestamptz default now()
);

-- ── mentor feedback ────────────────────────────────────────
create table if not exists public.mentor_feedback (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references public.um_user_profiles(id) on delete set null,
  teacher_name text,
  student_name text,
  tag text,
  text text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.mentor_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.student_goals enable row level security;
alter table public.learning_materials enable row level security;
alter table public.org_staff enable row level security;
alter table public.org_groups enable row level security;
alter table public.org_applications enable row level security;
alter table public.org_tasks enable row level security;
alter table public.student_tasks enable row level security;
alter table public.mentor_feedback enable row level security;

-- conversations: participants can read their own; users can insert; admin all
create policy "conversations_participant_read" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.um_user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
create policy "conversations_insert" on public.conversations
  for insert with check (auth.uid() is not null);

create policy "conversation_participants_read" on public.conversation_participants
  for select using (user_id = auth.uid() or exists (
    select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
create policy "conversation_participants_insert" on public.conversation_participants
  for insert with check (auth.uid() is not null);

create policy "messages_read" on public.messages
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() is not null);

-- mentor tables: mentor_user_id = auth.uid() or admin
create policy "mentor_groups_own" on public.mentor_groups
  for all using (mentor_user_id = auth.uid() or exists (
    select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "group_members_own" on public.group_members
  for all using (
    exists (
      select 1 from public.mentor_groups mg
      where mg.id = group_members.group_id
        and (mg.mentor_user_id = auth.uid() or exists (
          select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "attendance_sessions_own" on public.attendance_sessions
  for all using (
    exists (
      select 1 from public.mentor_groups mg
      where mg.id = attendance_sessions.group_id
        and (mg.mentor_user_id = auth.uid() or exists (
          select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "attendance_records_own" on public.attendance_records
  for all using (
    exists (
      select 1 from public.attendance_sessions ses
      join public.mentor_groups mg on mg.id = ses.group_id
      where ses.id = attendance_records.session_id
        and (mg.mentor_user_id = auth.uid() or exists (
          select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "student_goals_own" on public.student_goals
  for all using (mentor_user_id = auth.uid() or exists (
    select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "learning_materials_own" on public.learning_materials
  for all using (mentor_user_id = auth.uid() or exists (
    select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "mentor_feedback_own" on public.mentor_feedback
  for all using (mentor_user_id = auth.uid() or exists (
    select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- org tables: org owner or admin
create policy "org_staff_owner" on public.org_staff
  for all using (
    exists (
      select 1 from public.organizations o
      where o.id = org_staff.org_id
        and (o.owner_user_id = auth.uid() or exists (
          select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "org_groups_owner" on public.org_groups
  for all using (
    exists (
      select 1 from public.organizations o
      where o.id = org_groups.org_id
        and (o.owner_user_id = auth.uid() or exists (
          select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "org_applications_owner" on public.org_applications
  for all using (
    exists (
      select 1 from public.organizations o
      where o.id = org_applications.org_id
        and (o.owner_user_id = auth.uid() or exists (
          select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "org_tasks_owner" on public.org_tasks
  for all using (
    exists (
      select 1 from public.organizations o
      where o.id = org_tasks.org_id
        and (o.owner_user_id = auth.uid() or exists (
          select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

-- student tasks: student_user_id = auth.uid() or admin
create policy "student_tasks_own" on public.student_tasks
  for all using (student_user_id = auth.uid() or exists (
    select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed conversations (no participant FK required for dev)
insert into public.conversations (id, name, icon_name, type, last_message, last_message_at, archived) values
  ('c0000001-0000-4000-a000-000000000001', 'Ментор Айдар',         'user',     'direct', 'Посмотри отчёт, пожалуйста', now() - interval '1 hour',  false),
  ('c0000001-0000-4000-a000-000000000002', 'Кружок робототехники', 'cpu',      'group',  'Завтра занятие в 18:00',     now() - interval '1 day',   false),
  ('c0000001-0000-4000-a000-000000000003', 'Мама',                 'heart',    'direct', 'Ты поел?',                  now() - interval '1 day',   false),
  ('c0000001-0000-4000-a000-000000000004', 'Администратор UM',     'shield',   'system', 'Подписка активирована',     now() - interval '3 days',  false),
  ('c0000001-0000-4000-a000-000000000005', 'Старый чат',           'archive',  'direct', 'Ок',                        now() - interval '30 days', true),
  ('c0000001-0000-4000-a000-000000000006', 'Тренер по футболу',    'activity', 'direct', 'Сегодня без тренировки',   now() - interval '3 days',  false)
on conflict do nothing;

-- Seed mentor groups for dev mentor (UUID 005 = mentor role)
insert into public.mentor_groups (id, mentor_user_id, name, course, schedule, max_students, active) values
  ('90000001-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000005', 'Старшая группа A', 'Робототехника',    'Пн, Ср 15:00', 20, true),
  ('90000001-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000005', 'Middle Python',    'Программирование', 'Вт, Чт 16:45', 15, true),
  ('90000001-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000005', 'Младшая группа B', 'Робототехника',    'Сб 10:00',     20, false)
on conflict do nothing;

-- Seed group_members for group 1
with g1 as (select '90000001-0000-4000-a000-000000000001'::uuid as gid)
insert into public.group_members (id, group_id, student_name, student_age, level, xp, progress, skills) values
  ('b0000001-0000-4000-a000-000000000001', (select gid from g1), 'Анна Петрова',   8,  5, 1250, 85, '{"com":85,"lead":65,"cre":90,"log":75,"dis":70}'),
  ('b0000001-0000-4000-a000-000000000002', (select gid from g1), 'Максим Иванов',  12, 8, 2450, 78, '{"com":78,"lead":65,"cre":85,"log":80,"dis":72}')
on conflict do nothing;

-- Seed attendance sessions
with g1 as (select '90000001-0000-4000-a000-000000000001'::uuid as gid)
insert into public.attendance_sessions (id, group_id, session_date) values
  ('50000001-0000-4000-a000-000000000001', (select gid from g1), current_date),
  ('50000001-0000-4000-a000-000000000002', (select gid from g1), current_date - 1)
on conflict do nothing;

-- Seed attendance records
insert into public.attendance_records (session_id, member_id, present) values
  ('50000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000001', true),
  ('50000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000002', true),
  ('50000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000001', true),
  ('50000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000002', false)
on conflict do nothing;

-- Seed student goals
insert into public.student_goals (mentor_user_id, student_name, title, deadline_text, progress, color) values
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова',  'Завершить курс по Робототехнике', '30 апреля', 85, '#6C5CE7'),
  ('d0000000-0000-4000-a000-000000000005', 'Максим Иванов', 'Улучшить навык коммуникации',     '15 мая',    60, '#00B894'),
  ('d0000000-0000-4000-a000-000000000005', 'Данияр Сеитов', 'Создать первый проект',            '1 июня',    30, '#F59E0B')
on conflict do nothing;

-- Seed learning materials
insert into public.learning_materials (mentor_user_id, title, material_type, icon_name, size_label, color) values
  ('d0000000-0000-4000-a000-000000000005', 'Введение в робототехнику',          'Презентация', 'file-text', '2.4 MB', '#6C5CE7'),
  ('d0000000-0000-4000-a000-000000000005', 'Основы программирования: Урок 1',   'PDF',         'book',      '1.1 MB', '#3B82F6'),
  ('d0000000-0000-4000-a000-000000000005', 'Задания по логике (Блок 3)',         'Документ',    'clipboard', '0.8 MB', '#F59E0B'),
  ('d0000000-0000-4000-a000-000000000005', 'Видео-урок: Сборка модели',          'Видео',       'video',     '45 MB',  '#00B894')
on conflict do nothing;

-- Seed mentor feedback
insert into public.mentor_feedback (mentor_user_id, teacher_name, student_name, tag, text) values
  ('d0000000-0000-4000-a000-000000000005', 'Смирнов (Шахматы)', 'Максим Иванов', 'Быстро усвоил',      'Отлично решил задачу, хотя отвлекался в начале.'),
  ('d0000000-0000-4000-a000-000000000005', 'Соколов (Роботы)',   'Анна Петрова',  'Проявила лидерство', 'Собрала команду и руководила процессом сборки.')
on conflict do nothing;

-- Seed student tasks for dev youth user (UUID 002 = youth role)
insert into public.student_tasks (student_user_id, title, club, xp_reward, done) values
  ('d0000000-0000-4000-a000-000000000002', 'Нарисовать пейзаж',  'Художественная студия', 50, true),
  ('d0000000-0000-4000-a000-000000000002', 'Домашнее задание',   'Программирование',       40, false),
  ('d0000000-0000-4000-a000-000000000002', 'Выучить 10 слов',    'Английский язык',         30, false),
  ('d0000000-0000-4000-a000-000000000002', 'Пробежать 1 км',     'Футбол',                 45, false)
on conflict do nothing;

-- Seed org_staff for first org (use subquery, will no-op if org not present)
insert into public.org_staff (org_id, full_name, phone, email, specialization, rating, status)
  select id, 'Анна Петрова',   '+7 701 123 45 67', 'anna@example.com',   'Рисование и живопись', 4.9, 'active'
  from public.organizations limit 1
on conflict do nothing;

insert into public.org_staff (org_id, full_name, phone, email, specialization, rating, status)
  select id, 'Игорь Соколов',  '+7 707 987 65 43', 'igor@example.com',   'Робототехника',        4.7, 'invited'
  from public.organizations limit 1
on conflict do nothing;

insert into public.org_staff (org_id, full_name, phone, email, specialization, rating, status)
  select id, 'Марина Иванова', '+7 702 555 11 22', 'marina@example.com', 'Английский язык',      4.8, 'active'
  from public.organizations limit 1
on conflict do nothing;

-- Seed org_groups
insert into public.org_groups (org_id, name, course, schedule, capacity, enrolled, active)
  select id, 'Группа К-1', 'Робототехника',    'Пн, Ср, Пт 15:00', 15, 12, true  from public.organizations limit 1
on conflict do nothing;

insert into public.org_groups (org_id, name, course, schedule, capacity, enrolled, active)
  select id, 'Группа А-3', 'Английский язык', 'Вт, Чт 16:30',      12,  8, true  from public.organizations limit 1
on conflict do nothing;

-- Seed org_applications
insert into public.org_applications (org_id, child_name, child_age, parent_name, club, applied_date, status)
  select id, 'Мария Иванова',   7,  'Екатерина Иванова', 'Художественная студия', '25 фев 2026', 'paid'             from public.organizations limit 1
on conflict do nothing;

insert into public.org_applications (org_id, child_name, child_age, parent_name, club, applied_date, status)
  select id, 'Дмитрий Петров',  14, 'Андрей Петров',     'Футбольная школа',      '26 фев 2026', 'awaiting_payment' from public.organizations limit 1
on conflict do nothing;

insert into public.org_applications (org_id, child_name, child_age, parent_name, club, applied_date, status)
  select id, 'София Смирнова',  10, 'Ольга Смирнова',    'Программирование',      '27 фев 2026', 'paid'             from public.organizations limit 1
on conflict do nothing;

-- Seed org_tasks
insert into public.org_tasks (org_id, title, club, due_date, total_students, completed_students, xp_reward)
  select id, 'Нарисовать пейзаж',          'Художественная студия', '28 фев 2026', 18, 12, 50 from public.organizations limit 1
on conflict do nothing;

insert into public.org_tasks (org_id, title, club, due_date, total_students, completed_students, xp_reward)
  select id, 'Техника ведения мяча',        'Футбол',               '1 мар 2026',  24, 18, 45 from public.organizations limit 1
on conflict do nothing;

insert into public.org_tasks (org_id, title, club, due_date, total_students, completed_students, xp_reward)
  select id, 'Создать простую программу',   'Программирование',     '2 мар 2026',  15,  8, 60 from public.organizations limit 1
on conflict do nothing;
