-- Миграция Supabase: применяет изменение схемы или seed-данных для conversations type compat.
-- Some linked databases have the conversations table from an older migration
-- shape. The dev seed helper writes this column, and chat code can safely use
-- direct/group/system once present.

alter table if exists public.conversations
  add column if not exists type text default 'direct';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'conversations'
      and column_name = 'type'
  ) then
    update public.conversations
    set type = 'direct'
    where type is null;

    alter table public.conversations
      alter column type set default 'direct';

    if not exists (
      select 1
      from pg_constraint
      where conname = 'conversations_type_check'
        and conrelid = 'public.conversations'::regclass
    ) then
      alter table public.conversations
        add constraint conversations_type_check
        check (type in ('direct', 'group', 'system'));
    end if;
  end if;
end $$;
