-- COURSES_MIGRATION: SQL-скрипт Supabase для настройки courses migration.
-- COURSES_MIGRATION.sql
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run multiple times — uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS

-- ── 1. org_courses table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS org_courses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text,
  level       text        NOT NULL DEFAULT 'beginner'
                          CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price       integer     NOT NULL DEFAULT 0,
  icon        text        NOT NULL DEFAULT 'book',
  skills      text[]      NOT NULL DEFAULT '{}',
  status      text        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'paused', 'archived')),
  age_min     integer,
  age_max     integer,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_owner_courses" ON org_courses;
CREATE POLICY "org_owner_courses" ON org_courses
  FOR ALL
  USING  (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()));

-- ── 2. Public read policies (catalog / parent browsing) ──────────────────────
-- Anyone (including unauthenticated) can read active courses and org names.
-- The org-owner write policy above still restricts inserts/updates.

DROP POLICY IF EXISTS "public_read_active_courses" ON org_courses;
CREATE POLICY "public_read_active_courses" ON org_courses
  FOR SELECT USING (status = 'active');

-- organizations: allow public read so catalog can show org name via join
DROP POLICY IF EXISTS "public_read_organizations" ON organizations;
CREATE POLICY "public_read_organizations" ON organizations
  FOR SELECT USING (true);

-- org_groups: allow public read of active groups (for booking slots)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'org_groups'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "public_read_active_groups" ON org_groups';
    EXECUTE 'CREATE POLICY "public_read_active_groups" ON org_groups FOR SELECT USING (active = true)';
  END IF;
END $$;

-- ── 3. Link groups to courses (optional FK, nullable) ────────────────────────
-- Wrapped in DO block so it's silently skipped if org_groups doesn't exist yet

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'org_groups'
  ) THEN
    ALTER TABLE org_groups ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES org_courses(id) ON DELETE SET NULL;
  END IF;
END $$;
