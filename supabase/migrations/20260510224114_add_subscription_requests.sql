-- Requests from parent-controlled youth accounts to activate a paid subscription.
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
