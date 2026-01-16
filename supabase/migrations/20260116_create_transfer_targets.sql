-- Create transfer_targets table
-- Migration created: 2026-01-16
-- Purpose: Track transfer targets with status and priority

CREATE TABLE IF NOT EXISTS transfer_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Player information
  player_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  current_club TEXT,
  position TEXT,
  age INTEGER,
  nationality TEXT,
  market_value_eur INTEGER,

  -- Target details
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  target_price_eur INTEGER,
  max_price_eur INTEGER,
  notes TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'scouting' CHECK (status IN (
    'scouting',
    'interested',
    'negotiating',
    'offer_made',
    'agreed',
    'completed',
    'rejected',
    'abandoned'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one target per player per club
  UNIQUE(club_id, player_id)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_targets_club ON transfer_targets(club_id);
CREATE INDEX IF NOT EXISTS idx_targets_user ON transfer_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_targets_player ON transfer_targets(player_id);
CREATE INDEX IF NOT EXISTS idx_targets_status ON transfer_targets(status);
CREATE INDEX IF NOT EXISTS idx_targets_priority ON transfer_targets(priority);
CREATE INDEX IF NOT EXISTS idx_targets_created ON transfer_targets(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_targets_club_status
  ON transfer_targets(club_id, status);

CREATE INDEX IF NOT EXISTS idx_targets_club_priority
  ON transfer_targets(club_id, priority, created_at DESC);

-- Add RLS policies
ALTER TABLE transfer_targets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own club's targets
CREATE POLICY "Users can view their club targets"
  ON transfer_targets
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Users can insert targets for their own club
CREATE POLICY "Users can create targets for their club"
  ON transfer_targets
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Users can update their own club's targets
CREATE POLICY "Users can update their club targets"
  ON transfer_targets
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own club's targets
CREATE POLICY "Users can delete their club targets"
  ON transfer_targets
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transfer_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transfer_targets_updated_at
  BEFORE UPDATE ON transfer_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_transfer_targets_updated_at();

-- Add comments
COMMENT ON TABLE transfer_targets IS 'Stores transfer targets tracked by clubs';
COMMENT ON COLUMN transfer_targets.priority IS 'Target priority: high, medium, or low';
COMMENT ON COLUMN transfer_targets.status IS 'Current status in the transfer process';
COMMENT ON COLUMN transfer_targets.target_price_eur IS 'Ideal target price for the transfer';
COMMENT ON COLUMN transfer_targets.max_price_eur IS 'Maximum price willing to pay';
COMMENT ON COLUMN transfer_targets.notes IS 'Scouting notes and observations';
