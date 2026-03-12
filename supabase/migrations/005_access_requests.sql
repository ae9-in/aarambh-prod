-- Access Requests Table
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_message TEXT,
  admin_response TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(category_id, user_id, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_category_id ON access_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_org_id ON access_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);

-- RLS Policies
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create their own access requests"
  ON access_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can view their own requests
CREATE POLICY "Users can view their own access requests"
  ON access_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all requests for their org
CREATE POLICY "Admins can view all access requests in org"
  ON access_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update access requests"
  ON access_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    )
  );

-- Function to check if user has approved access request
CREATE OR REPLACE FUNCTION has_approved_access_request(p_user_id UUID, p_category_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM access_requests 
    WHERE user_id = p_user_id 
    AND category_id = p_category_id 
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
