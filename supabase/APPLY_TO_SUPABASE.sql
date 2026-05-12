-- APPLY_TO_SUPABASE: SQL-скрипт Supabase для настройки apply to supabase.
-- ============================================================
-- CONSOLIDATED SETUP — paste this entire file into
-- https://supabase.com/dashboard/project/mmwqkmwrseeuwhyiftoz/sql
-- and click Run.  Safe to re-run (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- SECTION 0 · Pre-existing table patches
-- ────────────────────────────────────────────────────────────

-- Add tariff column to parent_profiles if missing
alter table public.parent_profiles
  add column if not exists tariff text not null default 'basic';

-- ────────────────────────────────────────────────────────────
-- SECTION 1 · Admin helpers  (from 001_admin_schema.sql)
-- ────────────────────────────────────────────────────────────

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.um_user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.um_user_profiles(id) on delete set null,
  name text not null,
  category text,
  description text,
  org_type text,
  contact_person text,
  email text,
  phone text,
  city text,
  address text,
  capacity int,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  rating numeric(3,2) default 0,
  active_students int default 0,
  commission_pct numeric(4,2) default 15.00,
  created_at timestamptz default now()
);

-- mentor_applications
create table if not exists public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.um_user_profiles(id) on delete set null,
  name text not null,
  specialization text,
  email text,
  phone text,
  experience text,
  education text,
  bio text,
  photo_emoji text default '👤',
  documents_url text,
  workload text,
  expertise text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  rating numeric(3,2) default 0,
  sessions int default 0,
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.um_user_profiles(id) on delete set null
);

-- transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  external_ref text unique,
  parent_user_id uuid references public.um_user_profiles(id) on delete set null,
  org_id uuid references public.organizations(id) on delete set null,
  amount numeric(12,2) not null,
  org_amount numeric(12,2) not null,
  platform_amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','completed','refunded','failed')),
  created_at timestamptz default now()
);

-- tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('complaint','feedback')),
  reporter_user_id uuid references public.um_user_profiles(id) on delete set null,
  target text,
  body text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- ai_rules
create table if not exists public.ai_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  condition text not null,
  recommendation_title text not null,
  recommendation_body text,
  enabled boolean not null default true,
  created_at timestamptz default now()
);

-- test_questions
create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  tag_id uuid references public.tags(id) on delete set null,
  "order" int default 0,
  created_at timestamptz default now()
);

-- RLS
alter table public.organizations enable row level security;
alter table public.mentor_applications enable row level security;
alter table public.transactions enable row level security;
alter table public.tickets enable row level security;
alter table public.tags enable row level security;
alter table public.ai_rules enable row level security;
alter table public.test_questions enable row level security;

drop policy if exists "admin_all" on public.organizations;
create policy "admin_all" on public.organizations for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_all" on public.mentor_applications;
create policy "admin_all" on public.mentor_applications for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_all" on public.transactions;
create policy "admin_all" on public.transactions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_all" on public.tickets;
create policy "admin_all" on public.tickets for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_all" on public.tags;
create policy "admin_all" on public.tags for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_all" on public.ai_rules;
create policy "admin_all" on public.ai_rules for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_all" on public.test_questions;
create policy "admin_all" on public.test_questions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public_read_verified" on public.organizations;
create policy "public_read_verified" on public.organizations for select using (status = 'verified');
drop policy if exists "public_read_tags" on public.tags;
create policy "public_read_tags" on public.tags for select using (true);
drop policy if exists "public_read_questions" on public.test_questions;
create policy "public_read_questions" on public.test_questions for select using (true);

drop policy if exists "self_insert_application" on public.mentor_applications;
create policy "self_insert_application" on public.mentor_applications
  for insert with check (auth.uid() = user_id);
drop policy if exists "self_read_application" on public.mentor_applications;
create policy "self_read_application" on public.mentor_applications
  for select using (auth.uid() = user_id);

drop policy if exists "self_read_tx" on public.transactions;
create policy "self_read_tx" on public.transactions
  for select using (auth.uid() = parent_user_id);

drop policy if exists "self_insert_ticket" on public.tickets;
create policy "self_insert_ticket" on public.tickets
  for insert with check (auth.uid() = reporter_user_id);

drop policy if exists "self_insert_org" on public.organizations;
create policy "self_insert_org" on public.organizations
  for insert with check (auth.uid() = owner_user_id);
drop policy if exists "self_read_org" on public.organizations;
create policy "self_read_org" on public.organizations
  for select using (auth.uid() = owner_user_id);

-- Seed (001)
insert into public.tags (name) values
  ('#коммуникация'),('#лидерство'),('#логика'),('#робототехника'),('#спорт'),('#арт'),('#музыка')
on conflict (name) do nothing;

insert into public.tags (name) values
  ('#коммуникация'),('#лидерство'),('#логика'),('#робототехника'),('#спорт'),('#арт'),('#музыка')
on conflict (name) do nothing;

insert into public.mentor_applications (name, specialization, email, phone, experience, education, bio, photo_emoji, status)
values
  ('Асель Нурбекова','Детский психолог','asel.nurbekova@example.com','+7 (777) 123-4567','8 лет','КазНУ им. аль-Фараби','Помогаю детям раскрыть потенциал и найти свой путь.','👩‍🏫','pending'),
  ('Дмитрий Иванов','Карьерный консультант','dmitry.ivanov@example.com','+7 (701) 234-5678','5 лет','МГУ, Психология','Помогаю подросткам определиться с выбором профессии.','👨‍💼','pending')
on conflict do nothing;

insert into public.tickets (kind, target, body, status)
values
  ('complaint','Школа Шахмат ''Белая Ладья''','Преподаватель опоздал на 20 минут.','open'),
  ('feedback','Максим (Подопечный)','Прогресс отличный, но нужно больше практики.','resolved')
on conflict do nothing;

insert into public.ai_rules (name, condition, recommendation_title, recommendation_body)
values
  ('Инженерный потенциал','[Ответ: Да] на Вопрос #1 AND [Тег: #логика > 50%]','Робототехника / Программирование','Ребёнок проявляет склонность к инженерному мышлению.')
on conflict do nothing;

insert into public.test_questions (question, "order") values
  ('Тебе нравится разбирать игрушки, чтобы узнать, как они работают?',1),
  ('Часто ли ты рисуешь на полях тетради?',2),
  ('Трудно ли тебе усидеть на месте больше 20 минут?',3)
on conflict do nothing;

-- ────────────────────────────────────────────────────────────
-- SECTION 2 · App data tables  (from 003_app_data.sql)
-- ────────────────────────────────────────────────────────────

-- conversations
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

-- NOTE: column is "body" (not "content") to match the app's useChats hook
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid,
  body text not null,
  created_at timestamptz default now()
);

-- mentor tables
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

-- org tables
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
  parent_user_id uuid references auth.users(id) on delete set null,
  child_profile_id uuid,
  group_id uuid references public.org_groups(id) on delete set null,
  child_name text not null,
  child_age int,
  parent_name text,
  club text,
  group_name text,
  group_schedule text,
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

-- student tasks (youth)
create table if not exists public.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid references public.um_user_profiles(id) on delete cascade,
  title text not null,
  club text,
  xp_reward int default 50,
  done boolean default false,
  created_at timestamptz default now()
);

-- mentor feedback
create table if not exists public.mentor_feedback (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid references public.um_user_profiles(id) on delete set null,
  teacher_name text,
  student_name text,
  tag text,
  text text not null,
  created_at timestamptz default now()
);

-- RLS (003)
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

drop policy if exists "conversations_participant_read" on public.conversations;
create policy "conversations_participant_read" on public.conversations
  for select using (
    exists (select 1 from public.conversation_participants cp where cp.conversation_id = conversations.id and cp.user_id = auth.uid())
    or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin')
  );
drop policy if exists "conversations_insert" on public.conversations;
create policy "conversations_insert" on public.conversations
  for insert with check (auth.uid() is not null);

drop policy if exists "conversation_participants_read" on public.conversation_participants;
create policy "conversation_participants_read" on public.conversation_participants
  for select using (user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "conversation_participants_insert" on public.conversation_participants;
create policy "conversation_participants_insert" on public.conversation_participants
  for insert with check (auth.uid() is not null);

drop policy if exists "messages_read" on public.messages;
create policy "messages_read" on public.messages
  for select using (
    exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
    or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin')
  );
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() is not null);

drop policy if exists "mentor_groups_own" on public.mentor_groups;
create policy "mentor_groups_own" on public.mentor_groups
  for all using (mentor_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "group_members_own" on public.group_members;
create policy "group_members_own" on public.group_members
  for all using (exists (select 1 from public.mentor_groups mg where mg.id = group_members.group_id and (mg.mentor_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'))));

drop policy if exists "attendance_sessions_own" on public.attendance_sessions;
create policy "attendance_sessions_own" on public.attendance_sessions
  for all using (exists (select 1 from public.mentor_groups mg where mg.id = attendance_sessions.group_id and (mg.mentor_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'))));

drop policy if exists "attendance_records_own" on public.attendance_records;
create policy "attendance_records_own" on public.attendance_records
  for all using (exists (select 1 from public.attendance_sessions ses join public.mentor_groups mg on mg.id = ses.group_id where ses.id = attendance_records.session_id and (mg.mentor_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'))));

drop policy if exists "student_goals_own" on public.student_goals;
create policy "student_goals_own" on public.student_goals
  for all using (mentor_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "learning_materials_own" on public.learning_materials;
create policy "learning_materials_own" on public.learning_materials
  for all using (mentor_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "mentor_feedback_own" on public.mentor_feedback;
create policy "mentor_feedback_own" on public.mentor_feedback
  for all using (mentor_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "org_staff_owner" on public.org_staff;
create policy "org_staff_owner" on public.org_staff
  for all using (exists (select 1 from public.organizations o where o.id = org_staff.org_id and (o.owner_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'))));

drop policy if exists "org_groups_owner" on public.org_groups;
create policy "org_groups_owner" on public.org_groups
  for all using (exists (select 1 from public.organizations o where o.id = org_groups.org_id and (o.owner_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'))));

drop policy if exists "org_applications_owner" on public.org_applications;
create policy "org_applications_owner" on public.org_applications
  for all using (exists (select 1 from public.organizations o where o.id = org_applications.org_id and (o.owner_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'))));

drop policy if exists "parent_read_own_applications" on public.org_applications;
create policy "parent_read_own_applications" on public.org_applications
  for select using (parent_user_id = auth.uid());

drop policy if exists "authenticated_insert_applications" on public.org_applications;
create policy "authenticated_insert_applications" on public.org_applications
  for insert with check (auth.role() = 'authenticated' and (parent_user_id is null or parent_user_id = auth.uid()));

drop policy if exists "org_tasks_owner" on public.org_tasks;
create policy "org_tasks_owner" on public.org_tasks
  for all using (exists (select 1 from public.organizations o where o.id = org_tasks.org_id and (o.owner_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'))));

drop policy if exists "student_tasks_own" on public.student_tasks;
create policy "student_tasks_own" on public.student_tasks
  for all using (student_user_id = auth.uid() or exists (select 1 from public.um_user_profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ────────────────────────────────────────────────────────────
-- SECTION 3 · Extended tables  (from 004_extended_data.sql)
-- ────────────────────────────────────────────────────────────

create table if not exists public.learning_path_steps (
  id             uuid default gen_random_uuid() primary key,
  mentor_user_id uuid references public.um_user_profiles(id) on delete cascade,
  student_name   text not null default '',
  phase          text not null,
  phase_order    int  not null default 0,
  status         text not null default 'active',
  item_text      text not null,
  done           boolean not null default false,
  created_at     timestamptz default now()
);
alter table public.learning_path_steps enable row level security;
drop policy if exists "mentor owns steps" on public.learning_path_steps;
create policy "mentor owns steps" on public.learning_path_steps
  for all using (mentor_user_id = auth.uid() or public.is_admin());

create table if not exists public.youth_goals (
  id              uuid default gen_random_uuid() primary key,
  student_user_id uuid references public.um_user_profiles(id) on delete cascade,
  title           text not null,
  progress        int  not null default 0,
  color           text not null default '#6C5CE7',
  created_at      timestamptz default now()
);
alter table public.youth_goals enable row level security;
drop policy if exists "student owns goals" on public.youth_goals;
create policy "student owns goals" on public.youth_goals
  for all using (student_user_id = auth.uid() or public.is_admin());

create table if not exists public.youth_goal_steps (
  id         uuid default gen_random_uuid() primary key,
  goal_id    uuid references public.youth_goals(id) on delete cascade,
  text       text not null,
  done       boolean not null default false,
  step_order int  not null default 0
);
alter table public.youth_goal_steps enable row level security;
drop policy if exists "student owns goal steps" on public.youth_goal_steps;
create policy "student owns goal steps" on public.youth_goal_steps
  for all using (goal_id in (select id from public.youth_goals where student_user_id = auth.uid()) or public.is_admin());

create table if not exists public.achievements_catalog (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  icon_name   text not null default 'award',
  description text
);
alter table public.achievements_catalog enable row level security;
drop policy if exists "anyone reads catalog" on public.achievements_catalog;
create policy "anyone reads catalog" on public.achievements_catalog for select using (true);
drop policy if exists "admin manages catalog" on public.achievements_catalog;
create policy "admin manages catalog" on public.achievements_catalog for all using (public.is_admin());

create table if not exists public.user_achievements (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references public.um_user_profiles(id) on delete cascade,
  achievement_id uuid references public.achievements_catalog(id) on delete cascade,
  unlocked       boolean not null default false,
  unlocked_at    timestamptz,
  unique(user_id, achievement_id)
);
alter table public.user_achievements enable row level security;
drop policy if exists "user owns achievements" on public.user_achievements;
create policy "user owns achievements" on public.user_achievements
  for all using (user_id = auth.uid() or public.is_admin());

create table if not exists public.org_schedule_items (
  id           uuid default gen_random_uuid() primary key,
  org_id       uuid references public.organizations(id) on delete cascade,
  time_label   text not null,
  subject      text not null,
  group_name   text not null default '',
  teacher_name text not null default '',
  room         text not null default '',
  color        text not null default '#6C5CE7',
  day_of_week  int  not null default 0,
  created_at   timestamptz default now()
);
alter table public.org_schedule_items enable row level security;
drop policy if exists "org owner reads schedule" on public.org_schedule_items;
create policy "org owner reads schedule" on public.org_schedule_items
  for all using (org_id in (select id from public.organizations where owner_user_id = auth.uid()) or public.is_admin());

create table if not exists public.child_skill_snapshots (
  id             uuid default gen_random_uuid() primary key,
  parent_user_id uuid references public.um_user_profiles(id) on delete cascade,
  child_name     text not null,
  skill_label    text not null,
  current_value  int  not null default 0,
  prev_value     int  not null default 0,
  color          text not null default '#6C5CE7'
);
alter table public.child_skill_snapshots enable row level security;
drop policy if exists "parent owns skill snapshots" on public.child_skill_snapshots;
create policy "parent owns skill snapshots" on public.child_skill_snapshots
  for all using (parent_user_id = auth.uid() or public.is_admin());

create table if not exists public.child_attendance_monthly (
  id             uuid default gen_random_uuid() primary key,
  parent_user_id uuid references public.um_user_profiles(id) on delete cascade,
  child_name     text not null,
  month_label    text not null,
  attendance_pct int  not null default 0,
  month_order    int  not null default 0
);
alter table public.child_attendance_monthly enable row level security;
drop policy if exists "parent owns attendance" on public.child_attendance_monthly;
create policy "parent owns attendance" on public.child_attendance_monthly
  for all using (parent_user_id = auth.uid() or public.is_admin());

create table if not exists public.mentorship_requests (
  id             uuid default gen_random_uuid() primary key,
  mentor_user_id uuid references public.um_user_profiles(id) on delete cascade,
  request_type   text not null default 'mentorship',
  parent_name    text,
  child_name     text,
  interest_text  text,
  status         text not null default 'pending',
  slots          text[],
  created_at     timestamptz default now()
);
alter table public.mentorship_requests enable row level security;
drop policy if exists "mentor owns requests" on public.mentorship_requests;
create policy "mentor owns requests" on public.mentorship_requests
  for all using (mentor_user_id = auth.uid() or public.is_admin());

-- ────────────────────────────────────────────────────────────
-- SECTION 4 · Dev user profiles
-- These rows let the dev role-switcher work without a real session.
-- RLS on um_user_profiles requires auth.uid()=id, so we insert via
-- the SQL editor (service-role context, bypasses RLS).
-- ────────────────────────────────────────────────────────────

-- Dev UUID map (matches AuthContext.tsx devLogin):
--   001 = parent | 002 = youth | 003 = child | 004 = young-adult
--   005 = mentor  | 006 = org   | 007 = teacher | 008 = admin

insert into public.um_user_profiles (id, phone, role, first_name, last_name)
values
  ('d0000000-0000-4000-a000-000000000001', '+70000000001', 'parent',      'Dev', 'Parent'),
  ('d0000000-0000-4000-a000-000000000002', '+70000000002', 'youth',       'Dev', 'Youth'),
  ('d0000000-0000-4000-a000-000000000003', '+70000000003', 'child',       'Dev', 'Child'),
  ('d0000000-0000-4000-a000-000000000004', '+70000000004', 'young-adult', 'Dev', 'YoungAdult'),
  ('d0000000-0000-4000-a000-000000000005', '+70000000005', 'mentor',      'Dev', 'Mentor'),
  ('d0000000-0000-4000-a000-000000000006', '+70000000006', 'org',         'Dev', 'Org'),
  ('d0000000-0000-4000-a000-000000000007', '+70000000007', 'teacher',     'Dev', 'Teacher'),
  ('d0000000-0000-4000-a000-000000000008', '+70000000008', 'admin',       'Dev', 'Admin')
on conflict (id) do update set
  role       = excluded.role,
  first_name = excluded.first_name,
  last_name  = excluded.last_name;

-- ────────────────────────────────────────────────────────────
-- SECTION 5 · Seed data
-- ────────────────────────────────────────────────────────────

-- Organizations: one verified (admin seed), one owned by dev org user
insert into public.organizations (id, owner_user_id, name, category, status, rating, active_students, commission_pct)
values
  ('o0000001-0000-4000-a000-000000000001', null,                                        'Клуб Робототехники Alpha',       'Технологии', 'verified', 4.80, 120, 15.00),
  ('o0000001-0000-4000-a000-000000000002', null,                                        'Школа Шахмат ''Белая Ладья''',   'Интеллект',  'pending',  0,    0,   15.00),
  ('o0000001-0000-4000-a000-000000000003', null,                                        'Академия Художеств',             'Творчество', 'verified', 4.90, 85,  12.00),
  ('o0000001-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000006'::uuid, 'Dev Org (Dev User)',             'Технологии', 'verified', 5.00, 10,  10.00)
on conflict (id) do nothing;

-- Conversations
insert into public.conversations (id, name, icon_name, type, last_message, last_message_at, archived) values
  ('c0000001-0000-4000-a000-000000000001', 'Ментор Айдар',         'user',     'direct', 'Посмотри отчёт, пожалуйста', now() - interval '1 hour',  false),
  ('c0000001-0000-4000-a000-000000000002', 'Кружок робототехники', 'cpu',      'group',  'Завтра занятие в 18:00',     now() - interval '1 day',   false),
  ('c0000001-0000-4000-a000-000000000003', 'Мама',                 'heart',    'direct', 'Ты поел?',                  now() - interval '1 day',   false),
  ('c0000001-0000-4000-a000-000000000004', 'Администратор UM',     'shield',   'system', 'Подписка активирована',     now() - interval '3 days',  false),
  ('c0000001-0000-4000-a000-000000000005', 'Старый чат',           'archive',  'direct', 'Ок',                        now() - interval '30 days', true),
  ('c0000001-0000-4000-a000-000000000006', 'Тренер по футболу',    'activity', 'direct', 'Сегодня без тренировки',   now() - interval '3 days',  false)
on conflict (id) do nothing;

-- Mentor groups (dev mentor = UUID 005)
insert into public.mentor_groups (id, mentor_user_id, name, course, schedule, max_students, active) values
  ('g0000001-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000005', 'Старшая группа A', 'Робототехника',    'Пн, Ср 15:00', 20, true),
  ('g0000001-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000005', 'Middle Python',    'Программирование', 'Вт, Чт 16:45', 15, true),
  ('g0000001-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000005', 'Младшая группа B', 'Робототехника',    'Сб 10:00',     20, false)
on conflict (id) do nothing;

-- Group members
insert into public.group_members (id, group_id, student_name, student_age, level, xp, progress, skills) values
  ('m0000001-0000-4000-a000-000000000001', 'g0000001-0000-4000-a000-000000000001', 'Анна Петрова',   8,  5, 1250, 85, '{"com":85,"lead":65,"cre":90,"log":75,"dis":70}'),
  ('m0000001-0000-4000-a000-000000000002', 'g0000001-0000-4000-a000-000000000001', 'Максим Иванов',  12, 8, 2450, 78, '{"com":78,"lead":65,"cre":85,"log":80,"dis":72}')
on conflict (id) do nothing;

-- Attendance
insert into public.attendance_sessions (id, group_id, session_date) values
  ('s0000001-0000-4000-a000-000000000001', 'g0000001-0000-4000-a000-000000000001', current_date),
  ('s0000001-0000-4000-a000-000000000002', 'g0000001-0000-4000-a000-000000000001', current_date - 1)
on conflict (id) do nothing;

insert into public.attendance_records (session_id, member_id, present) values
  ('s0000001-0000-4000-a000-000000000001', 'm0000001-0000-4000-a000-000000000001', true),
  ('s0000001-0000-4000-a000-000000000001', 'm0000001-0000-4000-a000-000000000002', true),
  ('s0000001-0000-4000-a000-000000000002', 'm0000001-0000-4000-a000-000000000001', true),
  ('s0000001-0000-4000-a000-000000000002', 'm0000001-0000-4000-a000-000000000002', false)
on conflict do nothing;

-- Student goals
insert into public.student_goals (mentor_user_id, student_name, title, deadline_text, progress, color) values
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова',  'Завершить курс по Робототехнике', '30 апреля', 85, '#6C5CE7'),
  ('d0000000-0000-4000-a000-000000000005', 'Максим Иванов', 'Улучшить навык коммуникации',     '15 мая',    60, '#00B894'),
  ('d0000000-0000-4000-a000-000000000005', 'Данияр Сеитов', 'Создать первый проект',            '1 июня',    30, '#F59E0B')
on conflict do nothing;

-- Learning materials
insert into public.learning_materials (mentor_user_id, title, material_type, icon_name, size_label, color) values
  ('d0000000-0000-4000-a000-000000000005', 'Введение в робототехнику',        'Презентация', 'file-text', '2.4 MB', '#6C5CE7'),
  ('d0000000-0000-4000-a000-000000000005', 'Основы программирования: Урок 1', 'PDF',         'book',      '1.1 MB', '#3B82F6'),
  ('d0000000-0000-4000-a000-000000000005', 'Задания по логике (Блок 3)',       'Документ',    'clipboard', '0.8 MB', '#F59E0B'),
  ('d0000000-0000-4000-a000-000000000005', 'Видео-урок: Сборка модели',        'Видео',       'video',     '45 MB',  '#00B894')
on conflict do nothing;

-- Mentor feedback
insert into public.mentor_feedback (mentor_user_id, teacher_name, student_name, tag, text) values
  ('d0000000-0000-4000-a000-000000000005', 'Смирнов (Шахматы)', 'Максим Иванов', 'Быстро усвоил',      'Отлично решил задачу, хотя отвлекался в начале.'),
  ('d0000000-0000-4000-a000-000000000005', 'Соколов (Роботы)',   'Анна Петрова',  'Проявила лидерство', 'Собрала команду и руководила процессом сборки.')
on conflict do nothing;

-- Student tasks (dev youth = UUID 002)
insert into public.student_tasks (student_user_id, title, club, xp_reward, done) values
  ('d0000000-0000-4000-a000-000000000002', 'Нарисовать пейзаж', 'Художественная студия', 50, true),
  ('d0000000-0000-4000-a000-000000000002', 'Домашнее задание',  'Программирование',       40, false),
  ('d0000000-0000-4000-a000-000000000002', 'Выучить 10 слов',   'Английский язык',         30, false),
  ('d0000000-0000-4000-a000-000000000002', 'Пробежать 1 км',    'Футбол',                 45, false)
on conflict do nothing;

-- Org staff (for dev org)
insert into public.org_staff (org_id, full_name, phone, email, specialization, rating, status) values
  ('o0000001-0000-4000-a000-000000000004', 'Анна Петрова',   '+7 701 123 45 67', 'anna@example.com',   'Рисование и живопись', 4.9, 'active'),
  ('o0000001-0000-4000-a000-000000000004', 'Игорь Соколов',  '+7 707 987 65 43', 'igor@example.com',   'Робототехника',        4.7, 'invited'),
  ('o0000001-0000-4000-a000-000000000004', 'Марина Иванова', '+7 702 555 11 22', 'marina@example.com', 'Английский язык',      4.8, 'active')
on conflict do nothing;

-- Org groups
insert into public.org_groups (org_id, name, course, schedule, capacity, enrolled, active) values
  ('o0000001-0000-4000-a000-000000000004', 'Группа К-1', 'Робототехника',   'Пн, Ср, Пт 15:00', 15, 12, true),
  ('o0000001-0000-4000-a000-000000000004', 'Группа А-3', 'Английский язык', 'Вт, Чт 16:30',      12,  8, true)
on conflict do nothing;

-- Org applications
insert into public.org_applications (org_id, child_name, child_age, parent_name, club, applied_date, status) values
  ('o0000001-0000-4000-a000-000000000004', 'Мария Иванова',  7,  'Екатерина Иванова', 'Художественная студия', '25 фев 2026', 'paid'),
  ('o0000001-0000-4000-a000-000000000004', 'Дмитрий Петров', 14, 'Андрей Петров',     'Футбольная школа',      '26 фев 2026', 'awaiting_payment'),
  ('o0000001-0000-4000-a000-000000000004', 'София Смирнова', 10, 'Ольга Смирнова',    'Программирование',      '27 фев 2026', 'paid')
on conflict do nothing;

-- Org tasks
insert into public.org_tasks (org_id, title, club, due_date, total_students, completed_students, xp_reward) values
  ('o0000001-0000-4000-a000-000000000004', 'Нарисовать пейзаж',        'Художественная студия', '28 фев 2026', 18, 12, 50),
  ('o0000001-0000-4000-a000-000000000004', 'Техника ведения мяча',      'Футбол',               '1 мар 2026',  24, 18, 45),
  ('o0000001-0000-4000-a000-000000000004', 'Создать простую программу', 'Программирование',     '2 мар 2026',  15,  8, 60)
on conflict do nothing;

-- Org schedule
insert into public.org_schedule_items (org_id, time_label, subject, group_name, teacher_name, room, color, day_of_week) values
  ('o0000001-0000-4000-a000-000000000004', '09:00', 'Робототехника',   'Группа К-1', 'Соколов И.',   '204', '#6C5CE7', 0),
  ('o0000001-0000-4000-a000-000000000004', '11:00', 'Английский язык', 'Группа А-3', 'Иванова М.',   '108', '#3B82F6', 0),
  ('o0000001-0000-4000-a000-000000000004', '14:00', 'Программирование','Группа К-1', 'Соколов И.',   '204', '#F59E0B', 1),
  ('o0000001-0000-4000-a000-000000000004', '10:00', 'Рисование',       'Группа А-3', 'Петрова А.',   '302', '#00B894', 2),
  ('o0000001-0000-4000-a000-000000000004', '14:00', 'Программирование','Группа К-1', 'Соколов И.',   '204', '#F59E0B', 3),
  ('o0000001-0000-4000-a000-000000000004', '11:00', 'Английский язык', 'Группа А-3', 'Иванова М.',   '108', '#3B82F6', 3)
on conflict do nothing;

-- Learning path steps (dev mentor = UUID 005)
insert into public.learning_path_steps (mentor_user_id, student_name, phase, phase_order, status, item_text, done)
values
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова', 'Текущие навыки',         1, 'completed', 'Креативность: высокий уровень',         true),
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова', 'Текущие навыки',         1, 'completed', 'Коммуникация: средний уровень',         true),
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова', 'Цели развития',          2, 'active',    'Развить навыки публичных выступлений',   true),
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова', 'Цели развития',          2, 'active',    'Улучшить командную работу',              false),
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова', 'Рекомендованные кружки', 3, 'active',    'Театральная студия',                     false),
  ('d0000000-0000-4000-a000-000000000005', 'Анна Петрова', 'Рекомендованные кружки', 3, 'active',    'Ораторское искусство',                   false)
on conflict do nothing;

-- Mentorship requests
insert into public.mentorship_requests (mentor_user_id, request_type, parent_name, child_name, interest_text, status, slots)
values
  ('d0000000-0000-4000-a000-000000000005', 'session',    'Елена',  'Иван',   'Запрос на согласование времени', 'pending', array['Пн 18:00', 'Вт 10:00', 'Сб 12:00']),
  ('d0000000-0000-4000-a000-000000000005', 'mentorship', null,     'Данияр', 'Хочет развивать логику',         'pending', null)
on conflict do nothing;

-- Achievements catalog
insert into public.achievements_catalog (id, name, icon_name, description) values
  ('a0000001-0000-4000-a000-000000000001', 'Первые шаги', 'log-in',   'Начало пути'),
  ('a0000001-0000-4000-a000-000000000002', 'Художник',    'edit-3',   'Творческий подход'),
  ('a0000001-0000-4000-a000-000000000003', 'Спортсмен',   'activity', 'Физическая активность'),
  ('a0000001-0000-4000-a000-000000000004', 'Гений',       'cpu',      'Интеллект'),
  ('a0000001-0000-4000-a000-000000000005', 'Легенда',     'shield',   'Легендарный статус'),
  ('a0000001-0000-4000-a000-000000000006', 'Мастер',      'award',    'Мастерство')
on conflict (id) do nothing;

-- Subscription catalog from diploma project table 4
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('parent', 'youth', 'org')),
  title text not null,
  price_kzt int not null default 0,
  billing_period text not null default 'month',
  features text[] not null default '{}',
  popular boolean not null default false,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscription_plans_role_title_idx
  on public.subscription_plans(role, title);

alter table public.subscription_plans enable row level security;

drop policy if exists "public reads active subscription plans" on public.subscription_plans;
create policy "public reads active subscription plans" on public.subscription_plans
  for select using (active = true);

drop policy if exists "admin manages subscription plans" on public.subscription_plans;
create policy "admin manages subscription plans" on public.subscription_plans
  for all using (public.is_admin())
  with check (public.is_admin());

insert into public.subscription_plans (
  id, role, title, price_kzt, billing_period, features, popular, active, display_order
)
values
  (
    '71000000-0000-4000-a000-000000000201',
    'parent',
    'Free',
    0,
    'free',
    array['Первичная диагностика (BASIC)', 'Каталог кружков', 'Онлайн-запись на кружки', 'Календарь занятий'],
    false,
    true,
    10
  ),
  (
    '71000000-0000-4000-a000-000000000202',
    'parent',
    'Pro',
    19900,
    'quarter',
    array['Глубокое тестирование (PRO)', 'Полный профиль «Паутина талантов»', 'Персонализированные ИИ-рекомендации', 'Карьерный трек для возраста 15-17 лет', 'Все возможности Free'],
    true,
    true,
    20
  ),
  (
    '71000000-0000-4000-a000-000000000203',
    'parent',
    'Premium',
    44900,
    'quarter',
    array['Персональный ментор: 1 сессия в месяц', 'Полный трекинг прогресса', 'Регулярный фидбек от образовательных организаций', 'Все возможности Pro'],
    false,
    true,
    30
  ),
  (
    '71000000-0000-4000-a000-000000000301',
    'youth',
    'Free',
    0,
    'free',
    array['Первичная диагностика (BASIC)', 'Каталог кружков', 'Онлайн-запись на кружки', 'Календарь занятий'],
    false,
    true,
    10
  ),
  (
    '71000000-0000-4000-a000-000000000302',
    'youth',
    'Pro',
    19900,
    'quarter',
    array['Глубокое тестирование (PRO)', 'Полный профиль «Паутина талантов»', 'Персонализированные ИИ-рекомендации', 'Карьерный трек для возраста 15-17 лет', 'Все возможности Free'],
    true,
    true,
    20
  ),
  (
    '71000000-0000-4000-a000-000000000303',
    'youth',
    'Premium',
    44900,
    'quarter',
    array['Персональный ментор: 1 сессия в месяц', 'Полный трекинг прогресса', 'Регулярный фидбек от образовательных организаций', 'Все возможности Pro'],
    false,
    true,
    30
  ),
  (
    '71000000-0000-4000-a000-000000000401',
    'org',
    'Партнёрство (B2B)',
    50000,
    'month',
    array['Приоритетное размещение', 'Расширенная аналитика', 'Инструменты управления онлайн-записями', '10-15% комиссия с каждой онлайн-записи'],
    true,
    true,
    10
  )
on conflict (role, title) do update set
  price_kzt = excluded.price_kzt,
  billing_period = excluded.billing_period,
  features = excluded.features,
  popular = excluded.popular,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();

-- Parent-controlled youth subscription requests
create table if not exists public.subscription_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  parent_id uuid references auth.users(id) on delete cascade,

  requested_plan_id uuid references public.subscription_plans(id) on delete set null,
  requested_plan_title text not null,
  requested_plan_role text not null default 'youth'
    check (requested_plan_role in ('youth', 'parent')),
  price_kzt int not null default 0,
  billing_period text not null default 'month',

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_at timestamptz,
  rejected_at timestamptz,
  cancelled_at timestamptz,

  notification_sent boolean not null default false,
  notification_read boolean not null default false
);

create index if not exists subscription_requests_student_idx
  on public.subscription_requests(student_id, status);

create index if not exists subscription_requests_parent_idx
  on public.subscription_requests(parent_id, status);

create index if not exists subscription_requests_plan_idx
  on public.subscription_requests(requested_plan_id);

alter table public.subscription_requests enable row level security;

drop policy if exists "students read own subscription requests" on public.subscription_requests;
create policy "students read own subscription requests"
  on public.subscription_requests
  for select
  to authenticated
  using ((select auth.uid()) = student_id);

drop policy if exists "students create own subscription requests" on public.subscription_requests;
create policy "students create own subscription requests"
  on public.subscription_requests
  for insert
  to authenticated
  with check (
    (select auth.uid()) = student_id
    and requested_plan_role = 'youth'
    and status = 'pending'
  );

drop policy if exists "parents read child subscription requests" on public.subscription_requests;
create policy "parents read child subscription requests"
  on public.subscription_requests
  for select
  to authenticated
  using ((select auth.uid()) = parent_id);

drop policy if exists "parents update child subscription requests" on public.subscription_requests;
create policy "parents update child subscription requests"
  on public.subscription_requests
  for update
  to authenticated
  using ((select auth.uid()) = parent_id)
  with check (
    (select auth.uid()) = parent_id
    and status in ('pending', 'approved', 'rejected')
  );

drop policy if exists "admins manage subscription requests" on public.subscription_requests;
create policy "admins manage subscription requests"
  on public.subscription_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- Done.  All tables created, RLS enabled, seed data inserted.
-- ────────────────────────────────────────────────────────────
