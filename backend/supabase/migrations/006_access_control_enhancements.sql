-- Align access request schema with latest product requirements.
ALTER TABLE IF EXISTS access_requests
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS review_note TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill from older column names (if they exist).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'request_message'
  ) THEN
    EXECUTE 'UPDATE access_requests SET reason = COALESCE(reason, request_message)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'responded_by'
  ) THEN
    EXECUTE 'UPDATE access_requests SET reviewed_by = COALESCE(reviewed_by, responded_by)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'responded_at'
  ) THEN
    EXECUTE 'UPDATE access_requests SET reviewed_at = COALESCE(reviewed_at, responded_at)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_requests' AND column_name = 'requested_at'
  ) THEN
    EXECUTE 'UPDATE access_requests SET created_at = COALESCE(created_at, requested_at)';
  END IF;
END $$;

ALTER TABLE IF EXISTS access_requests
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE IF EXISTS access_requests
  DROP CONSTRAINT IF EXISTS access_requests_status_check;

ALTER TABLE IF EXISTS access_requests
  ADD CONSTRAINT access_requests_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Ensure uniqueness is per user/category pair.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'access_requests'::regclass
      AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE access_requests DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE IF EXISTS access_requests
  ADD CONSTRAINT access_requests_user_category_unique UNIQUE (user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at DESC);

-- Role-based default category grants, configurable per org.
CREATE TABLE IF NOT EXISTS role_category_defaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, role_key, category_id)
);

CREATE INDEX IF NOT EXISTS idx_role_category_defaults_org_role
  ON role_category_defaults(org_id, role_key);

-- Stricter category access: admins see all; employees require explicit grant.
CREATE OR REPLACE FUNCTION get_accessible_categories(p_user_id UUID, p_org_id UUID)
RETURNS TABLE (category_id UUID) AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT p.role INTO user_role
  FROM profiles p
  WHERE p.id = p_user_id
  LIMIT 1;

  IF user_role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER') THEN
    RETURN QUERY
    SELECT c.id
    FROM categories c
    WHERE c.org_id = p_org_id;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT c.id
  FROM categories c
  LEFT JOIN category_access ca
    ON ca.category_id = c.id
   AND ca.org_id = p_org_id
  LEFT JOIN access_requests ar
    ON ar.category_id = c.id
   AND ar.org_id = p_org_id
   AND ar.user_id = p_user_id
   AND ar.status = 'approved'
  WHERE c.org_id = p_org_id
    AND (
      (ca.id IS NOT NULL AND (
        p_user_id = ANY(ca.allowed_user_ids)
        OR (ca.allowed_roles <> '{}' AND user_role = ANY(ca.allowed_roles))
      ))
      OR ar.id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
