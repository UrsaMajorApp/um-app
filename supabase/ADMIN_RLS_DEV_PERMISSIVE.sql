-- ADMIN_RLS_DEV_PERMISSIVE: SQL-скрипт Supabase для настройки admin rls dev permissive.
-- ADMIN_RLS_DEV_PERMISSIVE.sql
-- FOR DEVELOPMENT / MVP ONLY
-- Allows any authenticated user to SELECT from admin-panel tables.
-- Write operations (UPDATE/DELETE) remain restricted to is_admin().
-- App-level routing already ensures only admin users reach AdminHome.
-- When you're ready to lock down reads, drop these _dev_read policies
-- and uncomment the strict participant/owner-based SELECT policies instead.

-- um_user_profiles
DROP POLICY IF EXISTS "dev_authenticated_read_user_profiles" ON um_user_profiles;
CREATE POLICY "dev_authenticated_read_user_profiles" ON um_user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- parent_profiles
DROP POLICY IF EXISTS "dev_authenticated_read_parent_profiles" ON parent_profiles;
CREATE POLICY "dev_authenticated_read_parent_profiles" ON parent_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- child_profiles
DROP POLICY IF EXISTS "dev_authenticated_read_child_profiles" ON child_profiles;
CREATE POLICY "dev_authenticated_read_child_profiles" ON child_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- mentor_applications
DROP POLICY IF EXISTS "dev_authenticated_read_mentor_applications" ON mentor_applications;
CREATE POLICY "dev_authenticated_read_mentor_applications" ON mentor_applications
  FOR SELECT USING (auth.role() = 'authenticated');

-- transactions
DROP POLICY IF EXISTS "dev_authenticated_read_transactions" ON transactions;
CREATE POLICY "dev_authenticated_read_transactions" ON transactions
  FOR SELECT USING (auth.role() = 'authenticated');

-- tickets
DROP POLICY IF EXISTS "dev_authenticated_read_tickets" ON tickets;
CREATE POLICY "dev_authenticated_read_tickets" ON tickets
  FOR SELECT USING (auth.role() = 'authenticated');

-- org_applications
DROP POLICY IF EXISTS "dev_authenticated_read_org_applications" ON org_applications;
CREATE POLICY "dev_authenticated_read_org_applications" ON org_applications
  FOR SELECT USING (auth.role() = 'authenticated');

-- org_courses (replaces the is_admin-only read; active courses are already public)
DROP POLICY IF EXISTS "dev_authenticated_read_org_courses" ON org_courses;
CREATE POLICY "dev_authenticated_read_org_courses" ON org_courses
  FOR SELECT USING (auth.role() = 'authenticated');
