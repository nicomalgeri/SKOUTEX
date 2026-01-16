-- Create transfer_windows table
-- Migration created: 2026-01-16
-- Purpose: Track transfer window dates for different leagues

CREATE TABLE IF NOT EXISTS transfer_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league TEXT NOT NULL,
  season TEXT NOT NULL,
  window_type TEXT NOT NULL CHECK (window_type IN ('summer', 'winter')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league, season, window_type)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transfer_windows_league ON transfer_windows(league);
CREATE INDEX IF NOT EXISTS idx_transfer_windows_active ON transfer_windows(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_transfer_windows_dates ON transfer_windows(start_date, end_date);

-- Add RLS policies
ALTER TABLE transfer_windows ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read transfer windows
CREATE POLICY "Anyone can view transfer windows"
  ON transfer_windows
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (admin operations)
CREATE POLICY "Only service role can modify transfer windows"
  ON transfer_windows
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert common transfer windows for 2025-26 season
INSERT INTO transfer_windows (league, season, window_type, start_date, end_date, is_active) VALUES
  -- Premier League
  ('Premier League', '2025-26', 'summer', '2025-06-14', '2025-09-01', false),
  ('Premier League', '2025-26', 'winter', '2026-01-01', '2026-02-03', true),

  -- La Liga
  ('La Liga', '2025-26', 'summer', '2025-07-01', '2025-09-02', false),
  ('La Liga', '2025-26', 'winter', '2026-01-02', '2026-02-03', true),

  -- Serie A
  ('Serie A', '2025-26', 'summer', '2025-07-01', '2025-09-01', false),
  ('Serie A', '2025-26', 'winter', '2026-01-02', '2026-02-02', true),

  -- Bundesliga
  ('Bundesliga', '2025-26', 'summer', '2025-07-01', '2025-09-01', false),
  ('Bundesliga', '2025-26', 'winter', '2026-01-02', '2026-02-01', true),

  -- Ligue 1
  ('Ligue 1', '2025-26', 'summer', '2025-06-10', '2025-09-02', false),
  ('Ligue 1', '2025-26', 'winter', '2026-01-01', '2026-02-03', true)

ON CONFLICT (league, season, window_type) DO NOTHING;

-- Add comments
COMMENT ON TABLE transfer_windows IS 'Stores transfer window periods for different leagues';
COMMENT ON COLUMN transfer_windows.league IS 'League name (e.g., Premier League, La Liga)';
COMMENT ON COLUMN transfer_windows.season IS 'Season identifier (e.g., 2025-26)';
COMMENT ON COLUMN transfer_windows.window_type IS 'Either summer or winter transfer window';
COMMENT ON COLUMN transfer_windows.start_date IS 'Transfer window opening date';
COMMENT ON COLUMN transfer_windows.end_date IS 'Transfer window closing date';
COMMENT ON COLUMN transfer_windows.is_active IS 'Whether this window is currently active';
