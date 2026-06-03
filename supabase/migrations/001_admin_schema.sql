-- Миграция Supabase: применяет изменение схемы или seed-данных для admin schema.
-- UM admin-panel schema. Run in Supabase SQL Editor.
-- Assumes um_user_profiles, parent_profiles, child_profiles already exist.

-- ============ base app profiles ============
-- These profile tables are referenced by the legacy 001..009 migrations. Keep
-- them here so a clean local Supabase database can apply the full chain.
create table if not exists public.um_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  role text not null default 'parent',
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.um_user_profiles(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  tariff text not null default 'basic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.um_user_profiles(id) on delete cascade,
  name text not null,
  age int,
  age_category text,
  interests text[] not null default '{}',
  talent_profile jsonb,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists child_profiles_parent_user_idx
  on public.child_profiles(parent_user_id);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
values
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000001', 'authenticated', 'authenticated', 'parent@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"parent","dev_role_switcher":true}', now(), now(), false, true),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000002', 'authenticated', 'authenticated', 'youth@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"youth","dev_role_switcher":true}', now(), now(), false, true),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000003', 'authenticated', 'authenticated', 'child@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"child","dev_role_switcher":true}', now(), now(), false, true),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000004', 'authenticated', 'authenticated', 'young-adult@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"young-adult","dev_role_switcher":true}', now(), now(), false, true),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000005', 'authenticated', 'authenticated', 'mentor@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"mentor","dev_role_switcher":true}', now(), now(), false, true),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000006', 'authenticated', 'authenticated', 'org@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"org","dev_role_switcher":true}', now(), now(), false, true),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000007', 'authenticated', 'authenticated', 'teacher@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"teacher","dev_role_switcher":true}', now(), now(), false, true),
  ('00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-a000-000000000008', 'authenticated', 'authenticated', 'admin@dev.local', '', now(), '{"provider":"email","providers":["email"]}', '{"role":"admin","dev_role_switcher":true}', now(), now(), false, true)
on conflict (id) do update set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into public.um_user_profiles (id, phone, role, first_name, last_name, updated_at)
values
  ('d0000000-0000-4000-a000-000000000001', '+77010000000', 'parent', 'Dev', 'Parent', now()),
  ('d0000000-0000-4000-a000-000000000002', '+77020000000', 'youth', 'Dev', 'Youth', now()),
  ('d0000000-0000-4000-a000-000000000003', '+77030000000', 'child', 'Dev', 'Child', now()),
  ('d0000000-0000-4000-a000-000000000004', '+77040000000', 'young-adult', 'Dev', 'Young Adult', now()),
  ('d0000000-0000-4000-a000-000000000005', '+77050000000', 'mentor', 'Dev', 'Mentor', now()),
  ('d0000000-0000-4000-a000-000000000006', '+77060000000', 'org', 'Dev', 'Org', now()),
  ('d0000000-0000-4000-a000-000000000007', '+77070000000', 'teacher', 'Dev', 'Teacher', now()),
  ('d0000000-0000-4000-a000-000000000008', '+77080000000', 'admin', 'Dev', 'Admin', now())
on conflict (id) do update set
  phone = excluded.phone,
  role = excluded.role,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  updated_at = now();

-- ============ helpers ============
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.um_user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============ organizations ============
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.um_user_profiles(id) on delete set null,
  name text not null,
  category text,
  description text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  rating numeric(3,2) default 0,
  active_students int default 0,
  commission_pct numeric(4,2) default 15.00,
  created_at timestamptz default now()
);

create table if not exists public.org_courses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  level text not null default 'beginner' check (level in ('beginner','intermediate','advanced')),
  price int not null default 0,
  icon text not null default 'book-open',
  skills text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','active','archived')),
  age_min int,
  age_max int,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ mentor_applications (includes approved mentors) ============
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
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  rating numeric(3,2) default 0,
  sessions int default 0,
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.um_user_profiles(id) on delete set null
);

-- ============ transactions ============
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

-- ============ tickets ============
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

-- ============ tags ============
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- ============ ai_rules ============
create table if not exists public.ai_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  condition text not null,
  recommendation_title text not null,
  recommendation_body text,
  enabled boolean not null default true,
  created_at timestamptz default now()
);

-- ============ test_questions ============
create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  tag_id uuid references public.tags(id) on delete set null,
  "order" int default 0,
  created_at timestamptz default now()
);

-- ============ RLS ============
alter table public.organizations enable row level security;
alter table public.org_courses enable row level security;
alter table public.mentor_applications enable row level security;
alter table public.transactions enable row level security;
alter table public.tickets enable row level security;
alter table public.tags enable row level security;
alter table public.ai_rules enable row level security;
alter table public.test_questions enable row level security;

-- admin: full access on everything
do $$ begin
  perform 1;
end $$;

drop policy if exists "admin_all" on public.organizations;
create policy "admin_all" on public.organizations for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_all" on public.org_courses;
create policy "admin_all" on public.org_courses for all using (public.is_admin()) with check (public.is_admin());
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

-- public read for orgs (catalog) and tags (UI)
drop policy if exists "public_read_verified" on public.organizations;
create policy "public_read_verified" on public.organizations for select using (status = 'verified');
drop policy if exists "public_read_active_courses" on public.org_courses;
create policy "public_read_active_courses" on public.org_courses for select using (status = 'active');
drop policy if exists "org_owner_manage_courses" on public.org_courses;
create policy "org_owner_manage_courses" on public.org_courses
  for all using (
    org_id in (select id from public.organizations where owner_user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    org_id in (select id from public.organizations where owner_user_id = auth.uid())
    or public.is_admin()
  );
drop policy if exists "public_read_tags" on public.tags;
create policy "public_read_tags" on public.tags for select using (true);
drop policy if exists "public_read_questions" on public.test_questions;
create policy "public_read_questions" on public.test_questions for select using (true);

-- mentor self-insert (apply)
drop policy if exists "self_insert_application" on public.mentor_applications;
create policy "self_insert_application" on public.mentor_applications
  for insert with check (auth.uid() = user_id);
drop policy if exists "self_read_application" on public.mentor_applications;
create policy "self_read_application" on public.mentor_applications
  for select using (auth.uid() = user_id);

-- parent read own transactions
drop policy if exists "self_read_tx" on public.transactions;
create policy "self_read_tx" on public.transactions
  for select using (auth.uid() = parent_user_id);

-- anyone can file a ticket
drop policy if exists "self_insert_ticket" on public.tickets;
create policy "self_insert_ticket" on public.tickets
  for insert with check (auth.uid() = reporter_user_id);

-- ============ seed data ============
insert into public.tags (name) values
  ('#коммуникация'),('#лидерство'),('#логика'),('#робототехника'),('#спорт'),('#арт'),('#музыка')
on conflict (name) do nothing;

insert into public.organizations (name, category, status, rating, active_students, commission_pct)
values
  ('Клуб Робототехники Alpha','Технологии','verified',4.80,120,15.00),
  ('Школа Шахмат ''Белая Ладья''','Интеллект','pending',0,0,15.00),
  ('Академия Художеств','Творчество','verified',4.90,85,12.00)
on conflict do nothing;

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
