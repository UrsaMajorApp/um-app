-- Миграция Supabase: применяет изменение схемы или seed-данных для move runtime demo data to supabase.
-- Move runtime/demo records out of the app bundle and into Supabase.
-- Static UI vocabulary can stay in code; product data belongs here.

-- ── subscription plan catalog ────────────────────────────────────────────────
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

-- ── wallet transactions and withdrawals ──────────────────────────────────────
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('mentor', 'org')),
  owner_user_id uuid references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  transaction_at timestamptz not null default now(),
  description text,
  student_name text,
  amount_kzt int not null,
  platform_commission_kzt int not null default 0,
  status text not null default 'completed' check (status in ('completed', 'pending', 'withdrawal', 'failed')),
  method text,
  created_at timestamptz not null default now(),
  constraint wallet_transactions_owner_check check (
    (owner_type = 'mentor' and owner_user_id is not null and org_id is null)
    or (owner_type = 'org' and org_id is not null)
  )
);

create index if not exists wallet_transactions_owner_user_idx
  on public.wallet_transactions(owner_user_id, transaction_at desc);
create index if not exists wallet_transactions_org_idx
  on public.wallet_transactions(org_id, transaction_at desc);

alter table public.wallet_transactions enable row level security;

drop policy if exists "wallet owner reads transactions" on public.wallet_transactions;
create policy "wallet owner reads transactions" on public.wallet_transactions
  for select using (
    (owner_type = 'mentor' and owner_user_id = auth.uid())
    or (
      owner_type = 'org'
      and org_id in (
        select id from public.organizations where owner_user_id = auth.uid()
      )
    )
    or public.is_admin()
  );

drop policy if exists "admin manages wallet transactions" on public.wallet_transactions;
create policy "admin manages wallet transactions" on public.wallet_transactions
  for all using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('mentor', 'org')),
  owner_user_id uuid references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  amount_kzt int not null check (amount_kzt > 0),
  iban text,
  bank_name text,
  recipient_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint withdrawal_requests_owner_check check (
    (owner_type = 'mentor' and owner_user_id is not null and org_id is null)
    or (owner_type = 'org' and org_id is not null)
  )
);

alter table public.withdrawal_requests enable row level security;

drop policy if exists "wallet owner manages withdrawals" on public.withdrawal_requests;
create policy "wallet owner manages withdrawals" on public.withdrawal_requests
  for all using (
    (owner_type = 'mentor' and owner_user_id = auth.uid())
    or (
      owner_type = 'org'
      and org_id in (
        select id from public.organizations where owner_user_id = auth.uid()
      )
    )
    or public.is_admin()
  )
  with check (
    (owner_type = 'mentor' and owner_user_id = auth.uid())
    or (
      owner_type = 'org'
      and org_id in (
        select id from public.organizations where owner_user_id = auth.uid()
      )
    )
    or public.is_admin()
  );

-- ── public course details previously mocked in the app ───────────────────────
create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.org_courses(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_display_name text,
  rating int not null default 5 check (rating between 1 and 5),
  body text not null,
  status text not null default 'published' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists course_reviews_course_idx
  on public.course_reviews(course_id, created_at desc);

alter table public.course_reviews enable row level security;

drop policy if exists "public reads published course reviews" on public.course_reviews;
create policy "public reads published course reviews" on public.course_reviews
  for select using (status = 'published');

drop policy if exists "authenticated creates own course reviews" on public.course_reviews;
create policy "authenticated creates own course reviews" on public.course_reviews
  for insert with check (auth.uid() is not null and author_user_id = auth.uid());

drop policy if exists "admin manages course reviews" on public.course_reviews;
create policy "admin manages course reviews" on public.course_reviews
  for all using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.trial_lesson_slots (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.org_courses(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  day_label text not null,
  time_label text not null,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists trial_lesson_slots_course_idx
  on public.trial_lesson_slots(course_id, display_order);

alter table public.trial_lesson_slots enable row level security;

drop policy if exists "public reads active trial slots" on public.trial_lesson_slots;
create policy "public reads active trial slots" on public.trial_lesson_slots
  for select using (active = true);

drop policy if exists "org owner manages trial slots" on public.trial_lesson_slots;
create policy "org owner manages trial slots" on public.trial_lesson_slots
  for all using (
    org_id in (select id from public.organizations where owner_user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    org_id in (select id from public.organizations where owner_user_id = auth.uid())
    or public.is_admin()
  );

-- ── teacher groups and attendance previously mocked in teacher screens ───────
create table if not exists public.teacher_groups (
  id uuid primary key default gen_random_uuid(),
  teacher_user_id uuid not null references auth.users(id) on delete cascade,
  -- Some deployed databases do not have the legacy org_groups table even
  -- though older migration history is present, so keep this as a soft link.
  org_group_id uuid,
  name text not null,
  course_title text,
  schedule text,
  capacity int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists teacher_groups_teacher_idx
  on public.teacher_groups(teacher_user_id, active);

alter table public.teacher_groups enable row level security;

drop policy if exists "teacher owns groups" on public.teacher_groups;
create policy "teacher owns groups" on public.teacher_groups
  for all using (teacher_user_id = auth.uid() or public.is_admin())
  with check (teacher_user_id = auth.uid() or public.is_admin());

create table if not exists public.teacher_group_students (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.teacher_groups(id) on delete cascade,
  student_user_id uuid references auth.users(id) on delete set null,
  student_name text not null,
  student_age int,
  status_label text,
  created_at timestamptz not null default now()
);

create index if not exists teacher_group_students_group_idx
  on public.teacher_group_students(group_id);

alter table public.teacher_group_students enable row level security;

drop policy if exists "teacher reads group students" on public.teacher_group_students;
create policy "teacher reads group students" on public.teacher_group_students
  for select using (
    group_id in (select id from public.teacher_groups where teacher_user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "admin manages teacher group students" on public.teacher_group_students;
create policy "admin manages teacher group students" on public.teacher_group_students
  for all using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.teacher_attendance_entries (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.teacher_groups(id) on delete cascade,
  student_id uuid not null references public.teacher_group_students(id) on delete cascade,
  class_date date not null,
  status text not null check (status in ('present', 'absent')),
  comment text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(group_id, student_id, class_date)
);

alter table public.teacher_attendance_entries enable row level security;

drop policy if exists "teacher manages attendance" on public.teacher_attendance_entries;
create policy "teacher manages attendance" on public.teacher_attendance_entries
  for all using (
    group_id in (select id from public.teacher_groups where teacher_user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    created_by = auth.uid()
    and (
      group_id in (select id from public.teacher_groups where teacher_user_id = auth.uid())
      or public.is_admin()
    )
  );
