-- Let parent/youth catalog screens read available groups for course booking.

alter table public.org_groups enable row level security;

drop policy if exists "public reads active org groups" on public.org_groups;
create policy "public reads active org groups" on public.org_groups
  for select
  using (active = true);
