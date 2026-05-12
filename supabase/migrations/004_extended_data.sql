-- Миграция Supabase: применяет изменение схемы или seed-данных для extended data.
-- ─── 004_extended_data.sql ────────────────────────────────────────────────
-- Additional tables for: learning paths, youth goals/achievements,
-- org schedule, parent child reports, mentorship requests, chat messages fix

-- ── learning_path_steps ────────────────────────────────────────────────────
create table if not exists public.learning_path_steps (
  id           uuid default gen_random_uuid() primary key,
  mentor_user_id uuid references auth.users(id) on delete cascade,
  student_name text not null default '',
  phase        text not null,
  phase_order  int  not null default 0,
  status       text not null default 'active', -- 'active' | 'completed'
  item_text    text not null,
  done         boolean not null default false,
  created_at   timestamptz default now()
);
alter table public.learning_path_steps enable row level security;
create policy "mentor owns steps" on public.learning_path_steps
  for all using (mentor_user_id = auth.uid());
create policy "admin bypass lps" on public.learning_path_steps
  for all using (public.is_admin());

-- ── youth_goals ───────────────────────────────────────────────────────────
create table if not exists public.youth_goals (
  id              uuid default gen_random_uuid() primary key,
  student_user_id uuid references auth.users(id) on delete cascade,
  title           text not null,
  progress        int  not null default 0,
  color           text not null default '#6C5CE7',
  created_at      timestamptz default now()
);
alter table public.youth_goals enable row level security;
create policy "student owns goals" on public.youth_goals
  for all using (student_user_id = auth.uid());
create policy "admin bypass yg" on public.youth_goals
  for all using (public.is_admin());

create table if not exists public.youth_goal_steps (
  id         uuid default gen_random_uuid() primary key,
  goal_id    uuid references public.youth_goals(id) on delete cascade,
  text       text not null,
  done       boolean not null default false,
  step_order int  not null default 0
);
alter table public.youth_goal_steps enable row level security;
create policy "student owns goal steps" on public.youth_goal_steps
  for all using (
    goal_id in (
      select id from public.youth_goals where student_user_id = auth.uid()
    )
  );
create policy "admin bypass ygs" on public.youth_goal_steps
  for all using (public.is_admin());

-- ── achievements ──────────────────────────────────────────────────────────
create table if not exists public.achievements_catalog (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  icon_name   text not null default 'award',
  description text
);
alter table public.achievements_catalog enable row level security;
create policy "anyone reads catalog" on public.achievements_catalog
  for select using (true);
create policy "admin manages catalog" on public.achievements_catalog
  for all using (public.is_admin());

create table if not exists public.user_achievements (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade,
  achievement_id uuid references public.achievements_catalog(id) on delete cascade,
  unlocked       boolean not null default false,
  unlocked_at    timestamptz,
  unique(user_id, achievement_id)
);
alter table public.user_achievements enable row level security;
create policy "user owns achievements" on public.user_achievements
  for all using (user_id = auth.uid());
create policy "admin bypass ua" on public.user_achievements
  for all using (public.is_admin());

-- ── org_schedule_items ────────────────────────────────────────────────────
create table if not exists public.org_schedule_items (
  id           uuid default gen_random_uuid() primary key,
  org_id       uuid references public.organizations(id) on delete cascade,
  time_label   text not null,
  subject      text not null,
  group_name   text not null default '',
  teacher_name text not null default '',
  room         text not null default '',
  color        text not null default '#6C5CE7',
  day_of_week  int  not null default 0, -- 0=Mon … 6=Sun
  created_at   timestamptz default now()
);
alter table public.org_schedule_items enable row level security;
create policy "org owner reads schedule" on public.org_schedule_items
  for all using (
    org_id in (
      select id from public.organizations where owner_user_id = auth.uid()
    )
  );
create policy "admin bypass osi" on public.org_schedule_items
  for all using (public.is_admin());

-- ── child_skill_snapshots ─────────────────────────────────────────────────
create table if not exists public.child_skill_snapshots (
  id             uuid default gen_random_uuid() primary key,
  parent_user_id uuid references auth.users(id) on delete cascade,
  child_name     text not null,
  skill_label    text not null,
  current_value  int  not null default 0,
  prev_value     int  not null default 0,
  color          text not null default '#6C5CE7'
);
alter table public.child_skill_snapshots enable row level security;
create policy "parent owns skill snapshots" on public.child_skill_snapshots
  for all using (parent_user_id = auth.uid());
create policy "admin bypass css" on public.child_skill_snapshots
  for all using (public.is_admin());

-- ── child_attendance_monthly ──────────────────────────────────────────────
create table if not exists public.child_attendance_monthly (
  id             uuid default gen_random_uuid() primary key,
  parent_user_id uuid references auth.users(id) on delete cascade,
  child_name     text not null,
  month_label    text not null,
  attendance_pct int  not null default 0,
  month_order    int  not null default 0
);
alter table public.child_attendance_monthly enable row level security;
create policy "parent owns attendance" on public.child_attendance_monthly
  for all using (parent_user_id = auth.uid());
create policy "admin bypass cam" on public.child_attendance_monthly
  for all using (public.is_admin());

-- ── mentorship_requests ───────────────────────────────────────────────────
create table if not exists public.mentorship_requests (
  id              uuid default gen_random_uuid() primary key,
  mentor_user_id  uuid references auth.users(id) on delete cascade,
  request_type    text not null default 'mentorship', -- 'mentorship' | 'session'
  parent_name     text,
  child_name      text,
  interest_text   text,
  status          text not null default 'pending', -- 'pending' | 'accepted' | 'rejected'
  slots           text[],
  created_at      timestamptz default now()
);
alter table public.mentorship_requests enable row level security;
create policy "mentor owns requests" on public.mentorship_requests
  for all using (mentor_user_id = auth.uid());
create policy "admin bypass mr" on public.mentorship_requests
  for all using (public.is_admin());

-- ── SEED DATA (dev mentor UUID) ───────────────────────────────────────────
do $$
declare
  mentor_id uuid := 'd0000000-0000-4000-a000-000000000005'::uuid;
begin

-- learning_path_steps
insert into public.learning_path_steps
  (mentor_user_id, student_name, phase, phase_order, status, item_text, done)
values
  (mentor_id, 'Анна Петрова', 'Текущие навыки',         1, 'completed', 'Креативность: высокий уровень',                true),
  (mentor_id, 'Анна Петрова', 'Текущие навыки',         1, 'completed', 'Коммуникация: средний уровень',                true),
  (mentor_id, 'Анна Петрова', 'Цели развития',          2, 'active',    'Развить навыки публичных выступлений',          true),
  (mentor_id, 'Анна Петрова', 'Цели развития',          2, 'active',    'Улучшить командную работу',                     false),
  (mentor_id, 'Анна Петрова', 'Рекомендованные кружки', 3, 'active',    'Театральная студия',                            false),
  (mentor_id, 'Анна Петрова', 'Рекомендованные кружки', 3, 'active',    'Ораторское искусство',                          false);

-- mentorship_requests
insert into public.mentorship_requests
  (mentor_user_id, request_type, parent_name, child_name, interest_text, status, slots)
values
  (mentor_id, 'session',     'Елена',   'Иван',    'Запрос на согласование времени', 'pending',
   array['Пн 18:00', 'Вт 10:00', 'Сб 12:00']),
  (mentor_id, 'mentorship',  null,      'Данияр',  'Хочет развивать логику',         'pending', null);

-- achievements_catalog
insert into public.achievements_catalog (id, name, icon_name, description)
values
  ('a0000001-0000-4000-a000-000000000001'::uuid, 'Первые шаги', 'log-in',   'Начало пути'),
  ('a0000001-0000-4000-a000-000000000002'::uuid, 'Художник',    'edit-3',   'Творческий подход'),
  ('a0000001-0000-4000-a000-000000000003'::uuid, 'Спортсмен',   'activity', 'Физическая активность'),
  ('a0000001-0000-4000-a000-000000000004'::uuid, 'Гений',       'cpu',      'Интеллект'),
  ('a0000001-0000-4000-a000-000000000005'::uuid, 'Легенда',     'shield',   'Легендарный статус'),
  ('a0000001-0000-4000-a000-000000000006'::uuid, 'Мастер',      'award',    'Мастерство')
on conflict (id) do nothing;

end $$;
