-- REPORTS_CHATS_MIGRATION: SQL-скрипт Supabase для настройки reports chats migration.
-- REPORTS_CHATS_MIGRATION.sql
-- Creates missing tables for /parent/reports and /chats
-- Safe to re-run — uses IF NOT EXISTS throughout
--
-- Order is important for cross-referencing policies:
--   tables are created first, then all cross-table policies are added last.

-- ── 1. child_skill_snapshots ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS child_skill_snapshots (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name      text        NOT NULL,
  skill_label     text        NOT NULL,
  current_value   integer     NOT NULL DEFAULT 0 CHECK (current_value BETWEEN 0 AND 100),
  prev_value      integer     NOT NULL DEFAULT 0 CHECK (prev_value BETWEEN 0 AND 100),
  color           text        NOT NULL DEFAULT '#6C5CE7',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE child_skill_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_read_own_snapshots" ON child_skill_snapshots;
CREATE POLICY "parent_read_own_snapshots" ON child_skill_snapshots
  FOR SELECT USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_write_snapshots" ON child_skill_snapshots;
CREATE POLICY "authenticated_write_snapshots" ON child_skill_snapshots
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 2. child_attendance_monthly ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS child_attendance_monthly (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name      text        NOT NULL,
  month_label     text        NOT NULL,
  attendance_pct  integer     NOT NULL DEFAULT 0 CHECK (attendance_pct BETWEEN 0 AND 100),
  month_order     integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE child_attendance_monthly ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_read_own_attendance" ON child_attendance_monthly;
CREATE POLICY "parent_read_own_attendance" ON child_attendance_monthly
  FOR SELECT USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_write_attendance" ON child_attendance_monthly;
CREATE POLICY "authenticated_write_attendance" ON child_attendance_monthly
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 3. conversations (table only — cross-table policies added at the end) ─────

CREATE TABLE IF NOT EXISTS conversations (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  icon_name        text        NOT NULL DEFAULT 'message-circle',
  last_message     text,
  last_message_at  timestamptz NOT NULL DEFAULT now(),
  archived         boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ── 4. conversation_participants ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversation_participants (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unread_count     integer     NOT NULL DEFAULT 0,
  joined_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_own_participation" ON conversation_participants;
CREATE POLICY "user_read_own_participation" ON conversation_participants
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_insert_participants" ON conversation_participants;
CREATE POLICY "authenticated_insert_participants" ON conversation_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "user_update_own_participation" ON conversation_participants;
CREATE POLICY "user_update_own_participation" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- ── 5. messages ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  body             text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ── 6. Policies that cross-reference conversation_participants ────────────────
-- These must come AFTER both conversations and conversation_participants exist.

-- conversations: authenticated read (permissive for dev/MVP)
DROP POLICY IF EXISTS "authenticated_read_conversations" ON conversations;
CREATE POLICY "authenticated_read_conversations" ON conversations
  FOR SELECT USING (auth.role() = 'authenticated');

-- conversations: any authenticated user can create
DROP POLICY IF EXISTS "authenticated_create_conversations" ON conversations;
CREATE POLICY "authenticated_create_conversations" ON conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- conversations: participants can update (archive / update last_message)
DROP POLICY IF EXISTS "authenticated_update_conversations" ON conversations;
CREATE POLICY "authenticated_update_conversations" ON conversations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- messages: participants can read
DROP POLICY IF EXISTS "participants_read_messages" ON messages;
CREATE POLICY "participants_read_messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- messages: participants can send
DROP POLICY IF EXISTS "participants_send_messages" ON messages;
CREATE POLICY "participants_send_messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- ── 7. Seed: welcome conversation ────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM conversations LIMIT 1) THEN
    INSERT INTO conversations (name, icon_name, last_message, last_message_at, archived)
    VALUES (
      'UM Поддержка',
      'headphones',
      'Добро пожаловать в UM! Напишите нам, если нужна помощь.',
      now(),
      false
    );
  END IF;
END $$;
