-- NEW_FEATURES_MIGRATION: SQL-скрипт Supabase для настройки new features migration.
-- ============================================================================
-- NEW FEATURES MIGRATION
-- Adds tables for trial lessons, student enrollment requests, and mentor notes
-- ============================================================================

-- ── Trial Lessons ────────────────────────────────────────────────────────────
-- Stores trial lesson requests from parents
CREATE TABLE IF NOT EXISTS trial_lesson_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Who
  child_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_age INT,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT,
  
  -- What & Where
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  course_id UUID REFERENCES org_courses(id) ON DELETE SET NULL,
  course_title TEXT NOT NULL,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- When - requested time slots (JSON array of {day, time})
  requested_slots JSONB NOT NULL DEFAULT '[]',
  confirmed_slot JSONB, -- {day, time}
  confirmed_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, declined, completed
  outcome TEXT, -- enrolled, declined_by_parent, no_show
  
  -- Notes
  mentor_notes TEXT,
  parent_notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS trial_requests_mentor_idx ON trial_lesson_requests(mentor_id, status);
CREATE INDEX IF NOT EXISTS trial_requests_parent_idx ON trial_lesson_requests(parent_id);
CREATE INDEX IF NOT EXISTS trial_requests_org_idx ON trial_lesson_requests(org_id);

-- RLS
ALTER TABLE trial_lesson_requests ENABLE ROW LEVEL SECURITY;

-- Parents can see their own requests
CREATE POLICY trial_requests_parent_select ON trial_lesson_requests
  FOR SELECT USING (auth.uid() = parent_id);

-- Parents can insert their own requests
CREATE POLICY trial_requests_parent_insert ON trial_lesson_requests
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Mentors can see requests assigned to them
CREATE POLICY trial_requests_mentor_select ON trial_lesson_requests
  FOR SELECT USING (auth.uid() = mentor_id);

-- Mentors can update requests assigned to them
CREATE POLICY trial_requests_mentor_update ON trial_lesson_requests
  FOR UPDATE USING (auth.uid() = mentor_id);

-- Orgs can see requests for their courses
CREATE POLICY trial_requests_org_select ON trial_lesson_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = trial_lesson_requests.org_id 
      AND owner_user_id = auth.uid()
    )
  );

-- ── Student Enrollment Requests ──────────────────────────────────────────────
-- Stores enrollment requests from students that need parent approval
CREATE TABLE IF NOT EXISTS student_enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Who
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What
  course_id UUID REFERENCES org_courses(id) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  org_name TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Notes
  student_message TEXT,
  parent_response TEXT,
  
  -- Push notification tracking
  notification_sent BOOLEAN DEFAULT false,
  notification_read BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS enrollment_requests_student_idx ON student_enrollment_requests(student_id);
CREATE INDEX IF NOT EXISTS enrollment_requests_parent_idx ON student_enrollment_requests(parent_id, status);
CREATE INDEX IF NOT EXISTS enrollment_requests_course_idx ON student_enrollment_requests(course_id);

-- RLS
ALTER TABLE student_enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Students can see their own requests
CREATE POLICY enrollment_requests_student_select ON student_enrollment_requests
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own requests
CREATE POLICY enrollment_requests_student_insert ON student_enrollment_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Parents can see and update requests for their children
CREATE POLICY enrollment_requests_parent_select ON student_enrollment_requests
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY enrollment_requests_parent_update ON student_enrollment_requests
  FOR UPDATE USING (auth.uid() = parent_id);

-- Orgs can see requests for their courses
CREATE POLICY enrollment_requests_org_select ON student_enrollment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = student_enrollment_requests.org_id 
      AND owner_user_id = auth.uid()
    )
  );

-- ── Mentor Student Notes ─────────────────────────────────────────────────────
-- Stores private notes mentors write about their students
CREATE TABLE IF NOT EXISTS mentor_student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Who
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What
  notes TEXT NOT NULL,
  
  -- Metadata
  tags TEXT[], -- Optional tags for categorization
  
  UNIQUE(mentor_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS mentor_notes_mentor_idx ON mentor_student_notes(mentor_id);
CREATE INDEX IF NOT EXISTS mentor_notes_student_idx ON mentor_student_notes(student_id);

-- RLS
ALTER TABLE mentor_student_notes ENABLE ROW LEVEL SECURITY;

-- Mentors can manage their own notes
CREATE POLICY mentor_notes_select ON mentor_student_notes
  FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY mentor_notes_insert ON mentor_student_notes
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY mentor_notes_update ON mentor_student_notes
  FOR UPDATE USING (auth.uid() = mentor_id);

CREATE POLICY mentor_notes_delete ON mentor_student_notes
  FOR DELETE USING (auth.uid() = mentor_id);

-- ── Monthly Reports ──────────────────────────────────────────────────────────
-- Stores generated monthly reports mentors send to parents
CREATE TABLE IF NOT EXISTS mentor_monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Who
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- When
  report_month TEXT NOT NULL, -- "2026-04" format
  
  -- Content (stored as JSON for flexibility)
  report_data JSONB NOT NULL DEFAULT '{}',
  -- Example structure:
  -- {
  --   "sessions_count": 8,
  --   "progress_percentage": 75,
  --   "average_rating": 4.8,
  --   "skills": [{"label": "Creativity", "value": 75}],
  --   "highlights": "Great improvement...",
  --   "areas_for_improvement": "Work on..."
  -- }
  
  -- Delivery
  sent_to_parent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  parent_viewed BOOLEAN DEFAULT false,
  parent_viewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS monthly_reports_mentor_idx ON mentor_monthly_reports(mentor_id);
CREATE INDEX IF NOT EXISTS monthly_reports_student_idx ON mentor_monthly_reports(student_id);
CREATE INDEX IF NOT EXISTS monthly_reports_parent_idx ON mentor_monthly_reports(parent_id);
CREATE INDEX IF NOT EXISTS monthly_reports_month_idx ON mentor_monthly_reports(report_month);

-- RLS
ALTER TABLE mentor_monthly_reports ENABLE ROW LEVEL SECURITY;

-- Mentors can manage their own reports
CREATE POLICY monthly_reports_mentor_all ON mentor_monthly_reports
  FOR ALL USING (auth.uid() = mentor_id);

-- Parents can view reports sent to them
CREATE POLICY monthly_reports_parent_select ON mentor_monthly_reports
  FOR SELECT USING (auth.uid() = parent_id);

-- Students can view their own reports
CREATE POLICY monthly_reports_student_select ON mentor_monthly_reports
  FOR SELECT USING (auth.uid() = student_id);

-- ── Functions ────────────────────────────────────────────────────────────────

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_trial_requests_updated_at
  BEFORE UPDATE ON trial_lesson_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollment_requests_updated_at
  BEFORE UPDATE ON student_enrollment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_notes_updated_at
  BEFORE UPDATE ON mentor_student_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON trial_lesson_requests TO authenticated;
GRANT ALL ON student_enrollment_requests TO authenticated;
GRANT ALL ON mentor_student_notes TO authenticated;
GRANT ALL ON mentor_monthly_reports TO authenticated;
