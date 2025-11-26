-- ============================================
-- CRASH REPORTS TABLE
-- ============================================
-- This table stores crash reports and errors from the mobile app
-- for developers to review and fix bugs

CREATE TABLE IF NOT EXISTS crash_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_version VARCHAR(50) NOT NULL,
  platform VARCHAR(20) NOT NULL, -- 'ios' | 'android'
  device_model VARCHAR(100),
  os_version VARCHAR(50),
  error_type VARCHAR(100) NOT NULL, -- 'crash' | 'error' | 'warning'
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  screen_name VARCHAR(255),
  action_taken TEXT, -- What user was doing when error occurred
  severity VARCHAR(20) DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'critical'
  status VARCHAR(20) DEFAULT 'open', -- 'open' | 'in_progress' | 'resolved' | 'closed'
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_crash_reports_status ON crash_reports(status);
CREATE INDEX IF NOT EXISTS idx_crash_reports_created_at ON crash_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crash_reports_user_id ON crash_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_crash_reports_severity ON crash_reports(severity);
CREATE INDEX IF NOT EXISTS idx_crash_reports_platform ON crash_reports(platform);

-- Enable RLS
ALTER TABLE crash_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view all crash reports
CREATE POLICY "Staff can view all crash reports"
  ON crash_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'staff', 'developer')
    )
  );

-- Policy: Staff can insert crash reports (for API)
CREATE POLICY "Staff can insert crash reports"
  ON crash_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow API to insert via service role

-- Policy: Staff can update crash reports
CREATE POLICY "Staff can update crash reports"
  ON crash_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'staff', 'developer')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crash_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_crash_reports_updated_at
  BEFORE UPDATE ON crash_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_crash_reports_updated_at();

