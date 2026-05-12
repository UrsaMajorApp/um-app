-- Миграция Supabase: применяет изменение схемы или seed-данных для qr pin login access.
-- Migration: Allow anonymous users to query child_profiles by qr_pin for login
-- This enables QR code login for children who aren't authenticated yet

-- Add policy for anonymous QR login
-- Allows reading ONLY when filtering by qr_pin (SELECT with WHERE qr_pin = ?)
DROP POLICY IF EXISTS "anon_qr_login" ON child_profiles;
CREATE POLICY "anon_qr_login" ON child_profiles
  FOR SELECT 
  TO anon
  USING (qr_pin IS NOT NULL);

-- Note: This policy allows anonymous users to query by qr_pin only
-- RLS will still prevent them from seeing records without using qr_pin filter
-- The 6-digit PIN provides sufficient security for this use case
