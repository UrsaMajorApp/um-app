-- ADMIN_RLS_ANON_DEV: SQL-скрипт Supabase для настройки admin rls anon dev.
-- ADMIN_RLS_ANON_DEV.sql
-- FOR DEVELOPMENT / MVP ONLY
--
-- The dev-mode role switcher (devLogin) stores a fake user in AsyncStorage
-- but never creates a real Supabase session, so every Supabase request is
-- sent with the anon key and auth.uid() = null / auth.role() = 'anon'.
-- None of the authenticated-only or uid-based policies match, causing every
-- admin-panel query to silently return [].
--
-- This file adds fully-permissive SELECT policies (USING (true)) on every
-- table the admin panel reads.  Write operations (INSERT/UPDATE/DELETE) are
-- left restricted to the is_admin() / owner policies from ADMIN_RLS_MIGRATION.
--
-- App-level routing already gates AdminHome behind the admin role check in
-- the app, so exposing reads to anon is acceptable for dev/MVP.
-- When you're ready to lock down, drop the "anon_dev_read_*" policies.

-- ── um_user_profiles ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_user_profiles" ON um_user_profiles;
CREATE POLICY "anon_dev_read_user_profiles" ON um_user_profiles
  FOR SELECT USING (true);

-- ── parent_profiles ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_parent_profiles" ON parent_profiles;
CREATE POLICY "anon_dev_read_parent_profiles" ON parent_profiles
  FOR SELECT USING (true);

-- ── child_profiles ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_child_profiles" ON child_profiles;
CREATE POLICY "anon_dev_read_child_profiles" ON child_profiles
  FOR SELECT USING (true);

-- ── mentor_applications ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_mentor_applications" ON mentor_applications;
CREATE POLICY "anon_dev_read_mentor_applications" ON mentor_applications
  FOR SELECT USING (true);

-- ── organizations ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_organizations" ON organizations;
CREATE POLICY "anon_dev_read_organizations" ON organizations
  FOR SELECT USING (true);

-- ── transactions ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_transactions" ON transactions;
CREATE POLICY "anon_dev_read_transactions" ON transactions
  FOR SELECT USING (true);

-- ── tickets ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_tickets" ON tickets;
CREATE POLICY "anon_dev_read_tickets" ON tickets
  FOR SELECT USING (true);

-- ── tags ──────────────────────────────────────────────────────────────────────
-- tags already has "anyone_read_tags" (USING true) from ADMIN_RLS_MIGRATION,
-- but re-creating here is safe (idempotent).
DROP POLICY IF EXISTS "anon_dev_read_tags" ON tags;
CREATE POLICY "anon_dev_read_tags" ON tags
  FOR SELECT USING (true);

-- ── ai_rules ──────────────────────────────────────────────────────────────────
-- ai_rules already has "anyone_read_ai_rules" from ADMIN_RLS_MIGRATION.
DROP POLICY IF EXISTS "anon_dev_read_ai_rules" ON ai_rules;
CREATE POLICY "anon_dev_read_ai_rules" ON ai_rules
  FOR SELECT USING (true);

-- ── test_questions ────────────────────────────────────────────────────────────
-- test_questions already has "anyone_read_test_questions" from ADMIN_RLS_MIGRATION.
DROP POLICY IF EXISTS "anon_dev_read_test_questions" ON test_questions;
CREATE POLICY "anon_dev_read_test_questions" ON test_questions
  FOR SELECT USING (true);

-- ── org_applications ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_org_applications" ON org_applications;
CREATE POLICY "anon_dev_read_org_applications" ON org_applications
  FOR SELECT USING (true);

-- ── org_courses ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_dev_read_org_courses" ON org_courses;
CREATE POLICY "anon_dev_read_org_courses" ON org_courses
  FOR SELECT USING (true);
