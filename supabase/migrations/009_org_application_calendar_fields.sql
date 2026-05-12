-- Миграция Supabase: применяет изменение схемы или seed-данных для org application calendar fields.
-- Store the selected group on organisation applications so parent calendars
-- can render recurring activated classes.

ALTER TABLE public.org_applications
  ADD COLUMN IF NOT EXISTS parent_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS child_profile_id uuid,
  ADD COLUMN IF NOT EXISTS group_id uuid,
  ADD COLUMN IF NOT EXISTS group_name text,
  ADD COLUMN IF NOT EXISTS group_schedule text;

CREATE INDEX IF NOT EXISTS org_applications_parent_calendar_idx
  ON public.org_applications(parent_user_id, child_profile_id, status);

DROP POLICY IF EXISTS "parent_read_own_applications" ON public.org_applications;
CREATE POLICY "parent_read_own_applications" ON public.org_applications
  FOR SELECT
  USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_insert_applications" ON public.org_applications;
CREATE POLICY "authenticated_insert_applications" ON public.org_applications
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (parent_user_id IS NULL OR parent_user_id = auth.uid())
  );
