-- Add fields submitted by the mentor create-profile flow.
-- Keep language/skill values as text because the current client serializes
-- arrays before insert.

alter table public.mentor_applications
  add column if not exists city text,
  add column if not exists languages text not null default '[]',
  add column if not exists skills text not null default '[]',
  add column if not exists pitch text,
  add column if not exists price integer not null default 0;

notify pgrst, 'reload schema';
