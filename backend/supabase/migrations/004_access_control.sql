-- Category Access Control Table
CREATE TABLE IF NOT EXISTS category_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) 
    ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id)
    ON DELETE CASCADE,
  allowed_roles TEXT[] DEFAULT '{}',
  allowed_user_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, org_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_category_access_category_id ON category_access(category_id);
CREATE INDEX IF NOT EXISTS idx_category_access_org_id ON category_access(org_id);

-- RLS Policies for category_access
ALTER TABLE category_access ENABLE ROW LEVEL SECURITY;

-- Admins can manage access
CREATE POLICY "Admins can manage category access"
  ON category_access
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );

-- Users can view access rules for their org
CREATE POLICY "Users can view category access"
  ON category_access
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Update content_access table to also reference categories if needed
-- Add category_id column to content_access for easier filtering
ALTER TABLE content_access 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_content_access_category_id ON content_access(category_id);

-- Function to get accessible categories for a user
CREATE OR REPLACE FUNCTION get_accessible_categories(p_user_id UUID, p_org_id UUID)
RETURNS TABLE (category_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id
  FROM categories c
  LEFT JOIN category_access ca ON ca.category_id = c.id AND ca.org_id = p_org_id
  WHERE c.org_id = p_org_id
  AND (
    -- No access rules set = everyone can access
    ca.id IS NULL
    OR 
    -- User's role is in allowed_roles
    (ca.allowed_roles <> '{}' AND (
      SELECT p.role FROM profiles p WHERE p.id = p_user_id
    ) = ANY(ca.allowed_roles))
    OR
    -- User's ID is in allowed_user_ids
    p_user_id = ANY(ca.allowed_user_ids)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
