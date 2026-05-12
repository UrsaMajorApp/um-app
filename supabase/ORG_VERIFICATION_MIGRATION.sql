-- ORG_VERIFICATION_MIGRATION: SQL-скрипт Supabase для настройки org verification migration.
-- ORG_VERIFICATION_MIGRATION.sql
-- Adds the two-phase org onboarding:
--   new             → org just registered (minimal form)
--   ready_for_review → org submitted verification documents
--   verified         → admin activated (blue checkmark, appears in search)
--   rejected         → admin rejected
--
-- Also adds the verification document columns and offer acceptance flag.
-- Safe to re-run.

-- ── 1. Expand the status constraint ──────────────────────────────────────────
-- Drop any existing CHECK constraint that mentions 'status', whatever it's named.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.organizations'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE 'ALTER TABLE public.organizations DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_status_check
  CHECK (status IN ('new', 'pending', 'ready_for_review', 'verified', 'rejected'));

-- Update default for new rows
ALTER TABLE public.organizations
  ALTER COLUMN status SET DEFAULT 'new';

-- Migrate any legacy 'pending' rows (pre-verification-flow orgs) to 'new'
-- so they don't show up as needing admin action without docs.
-- Comment this out if you want old 'pending' rows to stay actionable.
-- UPDATE public.organizations SET status = 'new' WHERE status = 'pending';

-- ── 2. Add verification columns (idempotent) ─────────────────────────────────
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS bin              text,
  ADD COLUMN IF NOT EXISTS bin_doc_url      text,
  ADD COLUMN IF NOT EXISTS registration_url text,
  ADD COLUMN IF NOT EXISTS license_url      text,
  ADD COLUMN IF NOT EXISTS offer_accepted   boolean NOT NULL DEFAULT false;

-- ── 3. RLS — allow org owners to update their own row for verification ────────
-- (ADMIN_RLS_MIGRATION already gives admin ALL; this adds owner self-update)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_update_own_org" ON public.organizations;
CREATE POLICY "owner_update_own_org" ON public.organizations
  FOR UPDATE
  USING  (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "owner_read_own_org" ON public.organizations;
CREATE POLICY "owner_read_own_org" ON public.organizations
  FOR SELECT USING (owner_user_id = auth.uid());
