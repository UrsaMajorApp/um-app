-- Миграция Supabase: применяет изменение схемы или seed-данных для org courses rejection reason.
alter table public.org_courses
  add column if not exists rejection_reason text;
