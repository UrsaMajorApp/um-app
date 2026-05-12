-- Миграция Supabase: применяет изменение схемы или seed-данных для qr pin system.
-- Migration: Replace QR token with PIN-based system
-- Add qr_pin, qr_pin_expires_at, and qr_pin_one_time_use columns

-- Add new columns for PIN system
ALTER TABLE public.child_profiles
  ADD COLUMN IF NOT EXISTS qr_pin TEXT,
  ADD COLUMN IF NOT EXISTS qr_pin_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qr_pin_one_time_use BOOLEAN DEFAULT false;

-- Create index on qr_pin for faster lookups
CREATE INDEX IF NOT EXISTS idx_child_profiles_qr_pin 
  ON public.child_profiles(qr_pin) 
  WHERE qr_pin IS NOT NULL;

-- Drop old qr_token column (if it exists)
-- Note: This will be executed after the app is updated to use qr_pin
-- ALTER TABLE public.child_profiles DROP COLUMN IF EXISTS qr_token;

-- Add comments explaining the PIN system
COMMENT ON COLUMN public.child_profiles.qr_pin IS '6-digit PIN for child login (100000-999999)';
COMMENT ON COLUMN public.child_profiles.qr_pin_expires_at IS 'Timestamp when the qr_pin expires (default 15 minutes)';
COMMENT ON COLUMN public.child_profiles.qr_pin_one_time_use IS 'Whether the PIN should be invalidated after first use (parent configurable)';
