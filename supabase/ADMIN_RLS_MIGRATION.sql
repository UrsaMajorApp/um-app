-- ADMIN_RLS_MIGRATION: SQL-скрипт Supabase для настройки admin rls migration.
-- ADMIN_RLS_MIGRATION.sql
-- Grants the admin role full read/write access to every table the admin
-- panel queries. Uses a SECURITY DEFINER helper so the role check itself
-- doesn't get blocked by RLS on um_user_profiles.
--
-- Run this once in Supabase SQL Editor. Safe to re-run.

-- ── 0. Helper: is_admin() ────────────────────────────────────────────────────
-- SECURITY DEFINER means it runs as the postgres superuser, bypassing RLS on
-- um_user_profiles so the check always works even before other policies exist.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.um_user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── 1. um_user_profiles ──────────────────────────────────────────────────────

ALTER TABLE um_user_profiles ENABLE ROW LEVEL SECURITY;

-- Every user can read/update their own row
DROP POLICY IF EXISTS "self_read_own_profile" ON um_user_profiles;
CREATE POLICY "self_read_own_profile" ON um_user_profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "self_update_own_profile" ON um_user_profiles;
CREATE POLICY "self_update_own_profile" ON um_user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Admin sees and manages everyone
DROP POLICY IF EXISTS "admin_all_user_profiles" ON um_user_profiles;
CREATE POLICY "admin_all_user_profiles" ON um_user_profiles
  FOR ALL USING (public.is_admin());

-- ── 2. parent_profiles ───────────────────────────────────────────────────────

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "self_read_parent_profile" ON parent_profiles;
CREATE POLICY "self_read_parent_profile" ON parent_profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "self_write_parent_profile" ON parent_profiles;
CREATE POLICY "self_write_parent_profile" ON parent_profiles
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_parent_profiles" ON parent_profiles;
CREATE POLICY "admin_all_parent_profiles" ON parent_profiles
  FOR ALL USING (public.is_admin());

-- ── 3. child_profiles ────────────────────────────────────────────────────────

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_read_own_children" ON child_profiles;
CREATE POLICY "parent_read_own_children" ON child_profiles
  FOR SELECT USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS "parent_write_own_children" ON child_profiles;
CREATE POLICY "parent_write_own_children" ON child_profiles
  FOR ALL USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_child_profiles" ON child_profiles;
CREATE POLICY "admin_all_child_profiles" ON child_profiles
  FOR ALL USING (public.is_admin());

-- ── 4. mentor_applications ───────────────────────────────────────────────────

ALTER TABLE mentor_applications ENABLE ROW LEVEL SECURITY;

-- Only the admin policy is guaranteed safe (no assumption about column names).
-- If your mentor_applications table has a user_id column pointing to the
-- applicant, add a self-read policy manually.
DROP POLICY IF EXISTS "authenticated_insert_mentor_application" ON mentor_applications;
CREATE POLICY "authenticated_insert_mentor_application" ON mentor_applications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_all_mentor_applications" ON mentor_applications;
CREATE POLICY "admin_all_mentor_applications" ON mentor_applications
  FOR ALL USING (public.is_admin());

-- ── 5. organizations ─────────────────────────────────────────────────────────
-- public_read_organizations already exists (added in COURSES_MIGRATION).
-- Admin needs full write access too.

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_organizations" ON organizations;
CREATE POLICY "admin_all_organizations" ON organizations
  FOR ALL USING (public.is_admin());

-- ── 6. transactions ──────────────────────────────────────────────────────────

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_transactions" ON transactions;
CREATE POLICY "admin_all_transactions" ON transactions
  FOR ALL USING (public.is_admin());

-- Parents can read their own transactions
DROP POLICY IF EXISTS "parent_read_own_transactions" ON transactions;
CREATE POLICY "parent_read_own_transactions" ON transactions
  FOR SELECT USING (parent_user_id = auth.uid());

-- ── 7. tickets ───────────────────────────────────────────────────────────────

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reporter_read_own_tickets" ON tickets;
CREATE POLICY "reporter_read_own_tickets" ON tickets
  FOR SELECT USING (reporter_user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_insert_tickets" ON tickets;
CREATE POLICY "authenticated_insert_tickets" ON tickets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_all_tickets" ON tickets;
CREATE POLICY "admin_all_tickets" ON tickets
  FOR ALL USING (public.is_admin());

-- ── 8. tags ──────────────────────────────────────────────────────────────────

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_read_tags" ON tags;
CREATE POLICY "anyone_read_tags" ON tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_write_tags" ON tags;
CREATE POLICY "admin_write_tags" ON tags
  FOR ALL USING (public.is_admin());

-- ── 9. ai_rules ──────────────────────────────────────────────────────────────

ALTER TABLE ai_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_read_ai_rules" ON ai_rules;
CREATE POLICY "anyone_read_ai_rules" ON ai_rules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_write_ai_rules" ON ai_rules;
CREATE POLICY "admin_write_ai_rules" ON ai_rules
  FOR ALL USING (public.is_admin());

-- ── 10. test_questions ───────────────────────────────────────────────────────

ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_read_test_questions" ON test_questions;
CREATE POLICY "anyone_read_test_questions" ON test_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_write_test_questions" ON test_questions;
CREATE POLICY "admin_write_test_questions" ON test_questions
  FOR ALL USING (public.is_admin());

-- ── 11. org_courses — update admin policies to use is_admin() ────────────────
-- (ADMIN_MIGRATION.sql may have used a raw subquery; replace with the helper)

DROP POLICY IF EXISTS "admin_read_all_courses" ON org_courses;
CREATE POLICY "admin_read_all_courses" ON org_courses
  FOR SELECT USING (public.is_admin() OR status = 'active');

DROP POLICY IF EXISTS "admin_update_courses" ON org_courses;
CREATE POLICY "admin_update_courses" ON org_courses
  FOR UPDATE USING (public.is_admin());

-- ── 12. org_applications — update to use is_admin() ─────────────────────────

DROP POLICY IF EXISTS "admin_all_applications" ON org_applications;
CREATE POLICY "admin_all_applications" ON org_applications
  FOR ALL USING (public.is_admin());

-- ── 13. org_groups (if it exists) ────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'org_groups'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "admin_all_org_groups" ON org_groups';
    EXECUTE '
      CREATE POLICY "admin_all_org_groups" ON org_groups
        FOR ALL USING (public.is_admin())
    ';
  END IF;
END $$;
