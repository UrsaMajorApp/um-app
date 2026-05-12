-- ADMIN_MIGRATION: SQL-скрипт Supabase для настройки admin migration.
-- ADMIN_MIGRATION.sql
-- Run in Supabase SQL Editor after COURSES_MIGRATION.sql
-- Enables course moderation flow and admin oversight

-- ── 1. Add 'draft' status to org_courses ─────────────────────────────────────
-- Courses now start as 'draft' and require admin approval before going live.

-- Drop old constraint and re-create with 'draft' included
DO $$
BEGIN
  -- Drop existing check constraint (name may vary, so we drop by scanning)
  EXECUTE (
    SELECT 'ALTER TABLE org_courses DROP CONSTRAINT ' || quote_ident(conname)
    FROM pg_constraint
    WHERE conrelid = 'org_courses'::regclass
      AND contype = 'c'
      AND conname LIKE '%status%'
    LIMIT 1
  );
EXCEPTION WHEN undefined_object THEN
  -- constraint didn't exist, fine
END $$;

ALTER TABLE org_courses
  ADD CONSTRAINT org_courses_status_check
  CHECK (status IN ('draft', 'active', 'archived'));

-- New courses start as draft (pending admin approval)
ALTER TABLE org_courses ALTER COLUMN status SET DEFAULT 'draft';

-- ── 2. Admin RLS policy — read ALL courses regardless of status ───────────────

DROP POLICY IF EXISTS "admin_read_all_courses" ON org_courses;
CREATE POLICY "admin_read_all_courses" ON org_courses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM um_user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can also update status (approve / reject)
DROP POLICY IF EXISTS "admin_update_courses" ON org_courses;
CREATE POLICY "admin_update_courses" ON org_courses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM um_user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── 3. Admin RLS policies for supporting tables ───────────────────────────────
-- (these tables are already fully readable by admin via existing policies,
--  but explicit policies are added for clarity)

-- Allow admin to read all org_groups
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'org_groups'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "admin_read_all_groups" ON org_groups';
    EXECUTE '
      CREATE POLICY "admin_read_all_groups" ON org_groups
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM um_user_profiles
            WHERE id = auth.uid() AND role = ''admin''
          )
        )
    ';
  END IF;
END $$;
