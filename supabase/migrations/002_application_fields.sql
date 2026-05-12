-- Миграция Supabase: применяет изменение схемы или seed-данных для application fields.
-- Add columns captured by mentor/org registration forms.

alter table public.mentor_applications
  add column if not exists workload text,
  add column if not exists expertise text;

alter table public.organizations
  add column if not exists org_type text,
  add column if not exists contact_person text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists capacity int;

-- Allow org owners to self-insert their org (status will be 'pending').
drop policy if exists "self_insert_org" on public.organizations;
create policy "self_insert_org" on public.organizations
  for insert with check (auth.uid() = owner_user_id);

drop policy if exists "self_read_org" on public.organizations;
create policy "self_read_org" on public.organizations
  for select using (auth.uid() = owner_user_id);
