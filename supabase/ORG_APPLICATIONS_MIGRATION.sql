-- ORG_APPLICATIONS_MIGRATION: SQL-скрипт Supabase для настройки org applications migration.
-- ORG_APPLICATIONS_MIGRATION.sql
-- Creates the org_applications table used by the parent booking flow
-- and the admin enrollment pipeline.

CREATE TABLE IF NOT EXISTS org_applications (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_user_id uuid       REFERENCES auth.users(id) ON DELETE SET NULL,
  child_profile_id uuid,
  group_id      uuid,
  child_name    text        NOT NULL,
  child_age     integer,
  parent_name   text,
  club          text,                    -- course title (free-text copy at time of booking)
  group_name    text,                    -- group name copy at time of booking
  group_schedule text,                   -- recurring schedule copy at time of booking
  applied_date  date,
  status        text        NOT NULL DEFAULT 'awaiting_payment'
                            CHECK (status IN ('awaiting_payment', 'paid', 'activated', 'completed', 'rejected')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org_applications ENABLE ROW LEVEL SECURITY;

-- Org owners can read and manage their own applications
DROP POLICY IF EXISTS "org_owner_applications" ON org_applications;
CREATE POLICY "org_owner_applications" ON org_applications
  FOR ALL
  USING  (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()));

-- Parents can insert (book a course)
DROP POLICY IF EXISTS "authenticated_insert_applications" ON org_applications;
CREATE POLICY "authenticated_insert_applications" ON org_applications
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (parent_user_id IS NULL OR parent_user_id = auth.uid())
  );

-- Parents can read the applications they created, so their calendar can show active classes
DROP POLICY IF EXISTS "parent_read_own_applications" ON org_applications;
CREATE POLICY "parent_read_own_applications" ON org_applications
  FOR SELECT
  USING (parent_user_id = auth.uid());

-- Admins can read and update all applications
DROP POLICY IF EXISTS "admin_all_applications" ON org_applications;
CREATE POLICY "admin_all_applications" ON org_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM um_user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
